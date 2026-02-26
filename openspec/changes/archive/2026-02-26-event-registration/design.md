## Context

目前活動系統（event-crud）已完成，使用者可以瀏覽活動列表和詳情頁，但無法報名。活動詳情頁有一個 disabled 的「即將開放報名」CTA 按鈕，`/my-events` 頁面也只有 placeholder。

現有的 Prisma schema 中 Event model 有 `capacity` 欄位但沒有 Registration model。報名人數目前硬編碼為 0。

## Goals / Non-Goals

**Goals:**
- 使用者可以報名 PUBLISHED 狀態的活動（含容量限制）
- 使用者可以在活動開始前取消報名
- 活動詳情頁根據登入狀態和報名狀態顯示不同 CTA
- 「我的活動」頁面顯示已報名的活動列表
- Admin 可以查看每場活動的報名名單
- 所有活動相關頁面顯示真實的報名人數

**Non-Goals:**
- 候補名單機制（額滿就是額滿，不做排隊）
- QR Code 簽到（下一個 change）
- 積分發放（依賴簽到系統）
- Email 通知（報名成功、活動提醒）
- 報名確認彈窗/二次確認（一鍵報名，降低摩擦）

## Decisions

### 1. Registration 狀態設計

**選擇**：只用 `CONFIRMED` 和 `CANCELLED` 兩個狀態

**替代方案**：
- A) 加入 `PENDING`、`WAITLISTED` 等狀態 → 過度設計，MVP 不需要候補
- B) 不用 status，直接刪除記錄來取消 → 失去歷史記錄

**理由**：MVP 只需要知道「報名了」和「取消了」。簡單的兩個狀態足夠，未來需要時可以擴充。保留 CANCELLED 記錄是為了未來可能的數據分析。

### 2. 容量檢查的 Race Condition 防護

**選擇**：使用 Prisma Transaction + count 查詢

```typescript
await prisma.$transaction(async (tx) => {
  const count = await tx.registration.count({
    where: { eventId, status: 'CONFIRMED' }
  })
  if (count >= event.capacity) throw new Error('EVENT_FULL')
  return tx.registration.create({ ... })
})
```

**替代方案**：
- A) 樂觀鎖（version column）→ 對 registration 場景太複雜
- B) 不加保護，前端擋就好 → 有 race condition 風險
- C) 資料庫層級的 CHECK constraint → Prisma 不直接支援

**理由**：Transaction 是 Prisma 最自然的並發控制方式。在 PostgreSQL 預設的 `READ COMMITTED` 隔離等級下，transaction 內的 count 查詢可以看到其他已提交的 transaction 結果，配合 unique constraint（userId + eventId）可以有效防止重複報名。對於社群活動（非搶票場景，同時並發報名量低）這已經足夠安全。

### 3. Server Actions（報名/取消）

**選擇**：使用 Server Actions，與現有 event-crud 的 admin actions 模式一致

| 操作 | Server Action | 權限 |
|------|--------------|------|
| 報名 | `registerEvent(eventId)` | 登入使用者 |
| 取消 | `cancelRegistration(eventId)` | 報名者本人 |

**替代方案**：
- A) API Routes（`POST /api/events/[id]/register`）→ 呼叫者是自己的前端，不需要 HTTP 端點；未來若需要給外部系統用（webhook、其他社群網站），再另外加 API Routes 即可，兩者可共存
- B) 獨立的 `/api/registrations` → 不如掛在 event 下直觀

**理由**：報名操作的呼叫者是自己的 Next.js 前端（RegisterButton 元件），Server Actions 可以直接 import 函式呼叫，不需要多一層 fetch + JSON 序列化。且與現有的 `app/(admin)/admin/events/actions.ts` 保持一致的模式。Admin 查看報名名單是純讀取，直接在 Server Component 裡用 Prisma 查詢即可。

### 4. 前端狀態管理

**選擇**：Server Component 預載 + Client Component 處理互動

- 活動詳情頁是 Server Component，查詢活動資料和使用者的報名狀態
- RegisterButton 是 Client Component，呼叫 Server Action 處理報名/取消 + loading 狀態
- 報名成功後用 `router.refresh()` 重新在 server 端執行 Server Component，取得最新資料（繞過 cache）

**替代方案**：
- A) 全部用 Client Component + SWR/React Query → 過度設計，Server Component + router.refresh() 已足夠

### 5. 「我的活動」頁面設計

**選擇**：分為「即將參加」和「過去參加」兩個 tab，與公開活動列表的 tab 結構一致

顯示內容：活動卡片 + 報名時間 + 取消報名按鈕（僅限即將舉辦的活動）

## Risks / Trade-offs

- **[容量超賣]** 極端並發下 Transaction + count 可能仍有微小超賣風險 → 社群活動場景（非搶票）可接受，上線後觀察
- **[取消後重新報名]** 使用者取消後能否重新報名？→ 可以，CANCELLED 記錄不影響重新建立新的 CONFIRMED 記錄（unique constraint 用 status 條件篩選）
- **[已報名活動被取消]** 組織者取消活動時，現有報名怎麼辦？→ 本次不自動處理，組織者取消活動後報名記錄保留（status 不變），未來可加 Email 通知

## Open Questions

- ~~候補名單~~ → 確認 Non-Goal，MVP 不做

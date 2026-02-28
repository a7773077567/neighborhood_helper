## Context

報名系統已完成（Registration model + Server Actions），但缺少簽到機制。目前 Registration 只記錄報名狀態（CONFIRMED/CANCELLED），無法追蹤實際出席。

組織者需要在活動現場用手機掃描參加者的 QR Code 完成簽到，為後續積分系統（Module 5）提供出席數據。

## Goals / Non-Goals

**Goals:**
- 報名時自動生成唯一 qrToken，防止偽造
- 參加者能在頁面上看到自己的 QR Code
- 組織者能用手機鏡頭掃描 QR Code 完成簽到
- 掃描後即時回饋（成功/重複/錯誤）
- 支援查看活動的簽到統計（出席人數/報名人數）

**Non-Goals:**
- Email 發送 QR Code（等 Email 模組統一做）
- 離線簽到功能
- 積分發放邏輯（Module 5 處理）
- 批量簽到

## Decisions

### 1. QR Token 生成方式

**選擇**：使用 Prisma `@default(uuid())` 在 create 時自動生成 UUID v4

**替代方案**：
- `crypto.randomUUID()` — 在 Server Action 裡手動生成，需要每次 create 時記得帶入
- `crypto.randomBytes(32).toString('hex')` — 64 字元隨機字串，更長但無明確格式
- nanoid — 需額外套件

**理由**：`@default(uuid())` 讓 Prisma 自動處理，程式碼不需額外邏輯，migration 時也能自動幫舊記錄補上。UUID v4 足夠隨機（122 bits 熵），QR Code 的安全性只需不可猜測即可。

### 2. QR Code 生成套件

**選擇**：`qrcode.react`（React 元件，直接渲染 SVG）

**替代方案**：
- `qrcode` — 產生圖片，需要額外處理
- 第三方 API — 依賴外部服務

**理由**：`qrcode.react` 是 React 生態最成熟的 QR 套件，直接渲染 SVG 到頁面，不需要生成圖片檔案。Client Component 即可使用。

### 3. QR Code 掃描套件

**選擇**：`html5-qrcode`

**替代方案**：
- `@yudiel/react-qr-scanner` — React 封裝，但更新頻率低
- `jsQR` + 手動 camera API — 控制度高但開發量大

**理由**：`html5-qrcode` 是最廣泛使用的瀏覽器端 QR 掃描套件，支援多種掃描模式（相機/檔案），文件完整，活躍維護。

### 4. QR Code 內容格式

**選擇**：純 qrToken 字串（UUID）

**替代方案**：
- JSON（`{ registrationId, token }`）— 增加掃描後的資訊但 QR 更大
- URL（`https://domain/checkin?token=xxx`）— 可直接開網頁但不需要

**理由**：簽到頁面已知道是哪場活動，掃描後只需要用 token 查詢 Registration。純字串最簡潔，QR Code 越小越容易掃描。

### 5. 簽到頁面路由

**選擇**：`/admin/events/[id]/checkin`

**理由**：遵循現有的 admin 路由結構，簽到屬於特定活動的操作。組織者從活動管理頁面進入。

### 6. 簽到 Server Action

**選擇**：使用 Server Action（不用 API Route）

**理由**：與報名系統一致，都使用 Server Action。簽到操作是簡單的 token 查詢 + 更新，不需要 REST API。

### 7. Registration Model 變更策略

新增 3 個欄位到現有 Registration model：

```prisma
model Registration {
  // ... 現有欄位
  qrToken     String    @unique @default(uuid())
  attended    Boolean   @default(false)
  attendedAt  DateTime?
}
```

- `qrToken` 使用 `@default(uuid())` 讓 Prisma 自動生成，現有報名記錄也會在 migration 時補上
- `attended` 預設 false
- `attendedAt` 可 null

## Risks / Trade-offs

- **[風險] 舊的 Registration 記錄沒有 qrToken** → Migration 時用 `@default(uuid())` 自動補上，或寫 seed script 補齊
- **[風險] 手機瀏覽器 camera 權限** → 需要 HTTPS 環境（Vercel 部署已滿足），本機開發用 localhost 也可以
- **[風險] 掃描速度與準確度** → `html5-qrcode` 在現代手機上表現良好，但環境光線不足可能影響。MVP 不特別處理
- **[取捨] 手動簽到作為 fallback** → 報名名單頁面加手動簽到按鈕，開發量小但確保現場不會因為參加者手機問題而卡住

## Why

使用者旅程的核心環節——「報名活動」——目前尚未實作。活動詳情頁有一個 disabled 的「即將開放報名」按鈕，「我的活動」頁面也只是 placeholder。沒有報名功能，整條使用者旅程（發現 → 報名 → 參加 → 獲得積分）在第二步就斷掉了，而且後續的 QR Code 簽到、積分系統、排行榜都依賴報名資料才能運作。

## What Changes

- **新增 Registration Model**：建立 `Registration` 資料表（userId + eventId + status），支援報名狀態追蹤
- **報名 API**：實作報名端點，含容量檢查（race condition 安全）、重複報名防止、使用 Prisma Transaction
- **取消報名 API**：允許使用者在活動開始前取消報名
- **活動詳情頁更新**：報名按鈕從 disabled 變為可互動，根據登入狀態和報名狀態顯示不同 UI（未登入 → 登入報名、可報名 → 我要報名、已報名 → 取消報名、已額滿 → 候補或提示）
- **「我的活動」頁面**：從 placeholder 升級為顯示使用者已報名的活動列表
- **Admin 報名名單**：組織者可在後台查看每場活動的報名名單
- **EventCard 更新**：在活動卡片上顯示真實的報名人數（取代目前硬編碼的 0）

## Capabilities

### New Capabilities
- `event-registration`: 活動報名與取消報名的完整流程，包含容量管理、報名狀態追蹤、報名名單查看

### Modified Capabilities
- `event-management`: 新增報名人數的即時顯示（活動列表、詳情頁、Admin 管理頁），以及 Admin 查看報名名單的功能

## Impact

- **資料庫**：新增 `Registration` model + migration，Event model 新增 registrations 關聯
- **API**：新增 `POST /api/events/[id]/register`、`DELETE /api/events/[id]/register`、`GET /api/events/[id]/registrations`（admin）
- **前端頁面**：修改 `/events/[id]`（詳情頁）、`/my-events`（我的活動）、`/admin/events`（管理頁）
- **元件**：修改 EventCard（真實報名數）、新增 RegisterButton（client component）
- **User Model**：新增 registrations 關聯

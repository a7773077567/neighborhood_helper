## Why

平台目前有認證系統和基本 App Shell，但沒有核心功能——活動。活動是整個 Neighborhood Helper 的基礎，報名、簽到、積分、講者系統都建立在活動之上。沒有活動 CRUD，其他功能都無法運作。

## What Changes

- 新增 `Event` model 和 `EventStatus` enum 到 Prisma schema
- 建立公開活動列表頁（`/events`），支援「即將舉辦 / 已結束」Tab 篩選
- 建立公開活動詳情頁（`/events/[id]`），預留報名按鈕位置（disabled）
- 建立組織者活動管理後台（`/admin/events`）：列表、建立、編輯
- 建立活動 CRUD API（GET/POST/PUT），含 Zod 驗證和 Admin 權限保護
- Event model 包含 `seekingSpeaker` 欄位，為後續講者系統預留

## Capabilities

### New Capabilities
- `event-management`: 活動的建立、編輯、列表、詳情展示。涵蓋 Event schema、CRUD API、公開頁面和組織者後台

### Modified Capabilities
（無既有 spec 需要修改）

## Impact

- **Schema**: 新增 Event model、EventStatus enum，需要 migration
- **API**: 新增 `/api/events` 和 `/api/events/[id]` routes
- **頁面**: 更新 `/events` 和 `/admin/events` 現有空白頁面，新增 `/events/[id]`、`/admin/events/new`、`/admin/events/[id]/edit`
- **元件**: 新增 EventCard、EventList、EventForm 等 feature 元件
- **依賴**: 需要安裝 `react-hook-form`、`@hookform/resolvers`、`dayjs`（或確認已安裝）

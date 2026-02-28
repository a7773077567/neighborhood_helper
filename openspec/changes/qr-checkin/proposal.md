## Why

目前報名系統已完成，但活動現場無法驗證參加者身份。組織者需要一個快速、防偽造的簽到機制，確認誰真的到場。這是積分系統（Module 5）的前置條件——沒有簽到記錄就無法發放積分。

## What Changes

- Registration model 新增 `qrToken`（報名時自動生成）、`attended`、`attendedAt` 欄位
- 報名成功後在頁面上顯示 QR Code（含 qrToken），供參加者現場出示
- 組織者後台新增簽到頁面，使用手機鏡頭掃描 QR Code
- 掃描成功後顯示參加者姓名與大頭照，標記出席
- 處理異常情況：無效 token、重複簽到、非本場活動

## Capabilities

### New Capabilities
- `qr-checkin`: QR Code 簽到功能，涵蓋掃描介面、token 驗證、出席標記、簽到狀態回饋

### Modified Capabilities
- `event-registration`: Registration model 新增 qrToken/attended/attendedAt 欄位，報名時自動生成 token，頁面顯示 QR Code
- `event-management`: 組織者後台新增簽到入口與簽到頁面

## Impact

- **資料庫**：Registration model 新增 3 個欄位，需要 Prisma migration
- **套件**：需要 QR Code 生成套件（如 `qrcode.react`）和掃描套件（如 `html5-qrcode`）
- **頁面**：新增 `/admin/events/[id]/checkin` 簽到頁面
- **元件**：新增 QR Code 顯示元件、掃描元件
- **Server Actions**：新增簽到 action（驗證 token + 標記出席）
- **現有頁面影響**：活動詳情頁和我的活動頁需顯示 QR Code（已報名狀態）

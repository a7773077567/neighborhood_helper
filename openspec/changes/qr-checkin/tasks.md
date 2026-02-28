## 1. 資料庫變更

- [x] 1.1 Registration model 新增 qrToken（String, @unique, @default(uuid())）、attended（Boolean, @default(false)）、attendedAt（DateTime?）欄位，執行 Prisma migration
- [x] 1.2 驗證現有 Registration 記錄在 migration 後自動補上 qrToken

## 2. 套件安裝

- [x] 2.1 安裝 `qrcode.react` 套件
- [x] 2.2 安裝 `html5-qrcode` 套件

## 3. 簽到 Server Action

- [x] 3.1 建立簽到 Server Action（`lib/actions/checkin.ts`）：接收 qrToken + eventId，驗證 token、檢查活動歸屬、檢查重複簽到，標記出席
- [x] 3.2 處理所有異常情況：無效 token、非本場活動、已取消報名、已簽到

## 4. Pencil 設計

- [ ] 4.1 設計簽到頁面（桌機版 + 手機版）：掃描區域、結果回饋、簽到統計
- [ ] 4.2 設計 QR Code 顯示元件：活動詳情頁的已報名狀態
- [ ] 4.3 設計簽到結果的不同狀態：成功、重複簽到、錯誤

## 5. QR Code 顯示元件與頁面整合

- [ ] 5.1 建立 QR Code 顯示元件（QrCodeDisplay），接收 qrToken 並渲染 SVG QR Code
- [ ] 5.2 活動詳情頁（`/events/[id]`）已報名狀態下顯示 QR Code（PUBLISHED 活動才顯示）
- [ ] 5.3 我的活動頁面（`/my-events`）即將參加的活動卡片增加「查看 QR Code」入口

## 6. 簽到掃描頁面

- [ ] 6.1 建立 QR 掃描元件（QrScanner），封裝 html5-qrcode 的相機啟動/停止/掃描回呼
- [ ] 6.2 建立簽到頁面（`/admin/events/[id]/checkin`），整合掃描元件 + 簽到 Action + 結果回饋
- [ ] 6.3 簽到頁面顯示活動名稱與簽到統計（已簽到/已報名人數），掃描後即時更新
- [ ] 6.4 處理相機權限拒絕的提示訊息

## 7. Admin 後台整合

- [ ] 7.1 活動管理列表（`/admin/events`）為 PUBLISHED 活動新增「簽到」操作按鈕
- [ ] 7.2 活動報名名單頁面顯示每位報名者的簽到狀態與簽到時間
- [ ] 7.3 報名名單頁面為未簽到的報名者新增「手動簽到」按鈕（呼叫簽到 Server Action，用 registrationId 查詢）

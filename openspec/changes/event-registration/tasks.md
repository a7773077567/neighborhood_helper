## 1. 資料庫

- [x] 1.1 新增 Registration model（含 RegistrationStatus enum）和 Prisma migration
- [x] 1.2 更新 Event / User model 加上 registrations 關聯
- [x] 1.3 ~~新增 Zod validation schema~~ → 不需要，業務邏輯驗證已足夠

## 2. Server Actions

- [x] 2.1 實作 `registerEvent` Server Action（報名，含 Transaction + 容量檢查）
- [x] 2.2 實作 `cancelRegistration` Server Action（取消報名，含時間檢查）

## 3. Pencil 設計

- [x] 3.1 設計 RegisterButton 各狀態（未登入、可報名、已報名、已額滿、已結束）
- [x] 3.2 設計「我的活動」頁面（即將參加 / 過去參加 tab）桌機 + 平板 + 手機版
- [x] 3.3 設計 Admin 報名名單頁面（桌機 + 手機版）

## 4. 活動詳情頁更新

- [x] 4.1 實作 RegisterButton client component（呼叫 Server Action + loading 狀態）
- [x] 4.2 更新活動詳情頁 Server Component（查詢報名狀態，傳入 RegisterButton）
- [x] 4.3 更新報名人數顯示為真實數據（進度條 + 數字）

## 5. 「我的活動」頁面

- [x] 5.1 實作 `/my-events` 頁面（即將參加 / 過去參加 tab）
- [x] 5.2 實作未登入使用者導向登入頁面（middleware 已處理 + auth() defense in depth）

## 6. 活動列表與 Admin 頁面更新

- [x] 6.1 更新 EventCard 顯示真實報名人數
- [x] 6.2 更新公開活動列表頁查詢（include registrations count）
- [x] 6.3 更新 Admin 活動管理頁顯示真實報名人數
- [x] 6.4 實作 Admin 報名名單頁面（`/admin/events/[id]/registrations`）

## 7. 測試

- [ ] 7.1 報名 Server Action 單元測試（容量檢查、重複報名、狀態檢查）
- [ ] 7.2 取消報名 Server Action 單元測試（時間檢查、未報名者）

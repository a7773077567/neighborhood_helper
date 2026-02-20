## 1. Schema 與基礎設施

- [x] 1.1 在 `schema.prisma` 新增 EventStatus enum 和 Event model（含 seekingSpeaker、organizer 關聯、索引）
- [x] 1.2 執行 `prisma migrate dev` 建立資料表
- [x] 1.3 安裝 `react-hook-form` 和 `@hookform/resolvers`
- [x] 1.4 建立 `lib/validations/event.ts`（Zod schema：createEvent、updateEvent）

## 2. Admin 權限保護

- [x] 2.1 更新 `(admin)/layout.tsx`：用 `auth()` 檢查 role，非 ADMIN 導向首頁

## 3. 組織者後台 — 活動管理

- [ ] 3.1 設計活動管理相關頁面的 Pencil 設計稿（Admin 列表、建立/編輯表單）
- [ ] 3.2 建立活動表單元件 `components/features/events/event-form.tsx`（react-hook-form + Zod，建立/編輯共用）
- [ ] 3.3 建立 Server Actions `app/(admin)/admin/events/actions.ts`（createEvent、updateEvent、updateEventStatus）
- [ ] 3.4 實作 `/admin/events` 活動管理列表頁（顯示所有狀態，含狀態操作按鈕）
- [ ] 3.5 實作 `/admin/events/new` 建立活動頁
- [ ] 3.6 實作 `/admin/events/[id]/edit` 編輯活動頁

## 4. 公開頁面 — 活動列表與詳情

- [ ] 4.1 設計活動列表和詳情頁的 Pencil 設計稿（EventCard、列表、詳情頁，含響應式）
- [ ] 4.2 建立 `components/features/events/event-card.tsx` 活動卡片元件
- [ ] 4.3 實作 `/events` 活動列表頁（Tab 篩選：即將舉辦 / 已結束，含空狀態）
- [ ] 4.4 實作 `/events/[id]` 活動詳情頁（含預留報名按鈕 disabled）

## 5. Seed Data 與驗證

- [ ] 5.1 建立 `prisma/seed.ts`，新增幾筆測試活動資料（各種狀態）
- [ ] 5.2 端到端測試：建立活動 → 發布 → 在公開列表中顯示 → 查看詳情
- [ ] 5.3 測試權限：非 ADMIN 無法存取 admin 路由，DRAFT/CANCELLED 活動不在公開列表

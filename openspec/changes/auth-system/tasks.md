## 1. Prisma 基礎設施

- [x] 1.1 建立 Prisma Client 單例（`lib/db/prisma.ts`）
- [x] 1.2 在 `schema.prisma` 新增 User、Account、Session、VerificationToken model（含 Role enum、points 欄位）
- [x] 1.3 執行 `prisma migrate dev` 建立資料表

## 2. NextAuth 設定

- [x] 2.1 安裝 `next-auth@5` 和 `@auth/prisma-adapter`
- [x] 2.2 建立 NextAuth 設定檔（`lib/auth/index.ts`）：Google provider、Prisma adapter、session callback（把 role 加進 session）
- [x] 2.3 建立 API route handler（`app/api/auth/[...nextauth]/route.ts`）
- [x] 2.4 設定環境變數（`AUTH_GOOGLE_ID`、`AUTH_GOOGLE_SECRET`、`AUTH_SECRET`）

## 3. 路由保護

- [x] 3.1 建立 `middleware.ts`：用 cookie 檢查取代 auth() import（避免 Edge Runtime 問題），dashboard 路由需登入、已登入訪問 /login 導向首頁

## 4. 登入頁面

- [x] 4.1 設計登入頁面 Pencil 設計稿（`designs/login-page.pen`）
- [x] 4.2 實作登入頁面（`app/(auth)/login/page.tsx`）：Server Action + Google OAuth，符合 Neobrutalism 風格

## 5. Header / UserMenu 改造

- [ ] 5.1 更新 Header 設計稿（反映移除 variant、改用 session 偵測的變化）
- [ ] 5.2 改造 Header：移除 variant prop，改用 `async` + `auth()` 讀取 session 判斷狀態
- [ ] 5.3 改造 UserMenu：接收 user prop 顯示真實資料，登出按鈕接入 `signOut()`
- [ ] 5.4 更新各 Layout（public、dashboard、admin）：移除 Header 的 variant prop

## 6. 驗證

- [ ] 6.1 本機測試完整登入/登出流程
- [ ] 6.2 測試路由保護：未登入存取 dashboard、MEMBER 存取 admin、已登入存取 /login
- [ ] 6.3 確認 Header 在不同登入狀態下正確顯示

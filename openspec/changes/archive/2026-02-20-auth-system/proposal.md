## Why

目前所有頁面都是 placeholder 狀態，Header 使用假資料（`name='PJ'`），dashboard 和 admin 路由沒有任何存取保護。認證系統是所有功能模組（報名、積分、個人中心、管理後台）的基礎依賴——沒有使用者身份，後續功能都無法運作。

## What Changes

- **新增 Prisma User Model**：建立第一個資料表，包含 role 欄位（MEMBER / ADMIN），執行首次 migration
- **新增 NextAuth.js v5（Auth.js）設定**：Google OAuth provider + Prisma Adapter，自動建立使用者記錄
- **新增 Prisma Client 單例**：`lib/db/prisma.ts`，供全專案使用
- **新增 auth 工具函式**：`lib/auth/` 下的 config 和 helper functions
- **實作登入頁面**：取代 `app/(auth)/login/page.tsx` 的 placeholder，提供 Google 登入按鈕
- **新增 Middleware**：保護 `(dashboard)` 和 `(admin)` 路由，未登入自動導向登入頁
- **修改 Header 元件**：從 session 讀取真實登入狀態，取代目前的 variant prop 判斷邏輯
- **修改 UserMenu 元件**：顯示真實使用者名稱和 email，登出功能接入 NextAuth signOut

## Capabilities

### New Capabilities

- `user-auth`：使用者認證系統，涵蓋 Google OAuth 登入流程、User 資料模型、session 管理、角色權限（MEMBER / ADMIN）、路由保護 middleware

### Modified Capabilities

- `app-shell`：Header 和 UserMenu 需從靜態 variant 判斷改為讀取真實 session 狀態，登出按鈕接入 NextAuth signOut

## Impact

- **新增依賴**：`next-auth@5`（Auth.js）、`@auth/prisma-adapter`
- **Prisma**：新增 User / Account / Session / VerificationToken model（NextAuth 需要），首次 `prisma migrate dev`
- **環境變數**：需要 `GOOGLE_CLIENT_ID`、`GOOGLE_CLIENT_SECRET`、`NEXTAUTH_SECRET`
- **受影響的檔案**：
  - `components/features/layout/header.tsx` — 登入狀態判斷邏輯改變
  - `components/features/layout/user-menu.tsx` — 真實資料 + signOut
  - `app/(auth)/login/page.tsx` — 從 placeholder 變成實際登入頁
  - `app/(dashboard)/layout.tsx` — 可能需要 session provider
  - `app/(admin)/layout.tsx` — 可能需要 admin 權限檢查
  - `middleware.ts`（新增）— 路由保護

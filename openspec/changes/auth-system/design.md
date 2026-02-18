## Context

目前 app-shell 已完成，所有 Route Group layout 和 Header/Footer 元件都到位，但認證功能完全缺失：

- Header 用 `variant` prop 靜態判斷登入狀態（`isLoggedIn = variant !== 'public'`）
- UserMenu 使用 placeholder 資料（`name='PJ'`）
- `(dashboard)` 和 `(admin)` 路由沒有存取保護
- Prisma Schema 沒有任何 Model
- 登入頁面是「即將推出」placeholder

技術棧已確定：NextAuth.js v5（Auth.js）+ Prisma + Google OAuth。

## Goals / Non-Goals

**Goals:**

- 使用者可以用 Google 帳號登入和登出
- 登入後 Header 顯示真實使用者資訊
- 未登入使用者無法存取 dashboard 和 admin 路由
- ADMIN 角色可以存取 admin 路由，MEMBER 不行
- 建立可重用的 auth 基礎設施（之後的 change 直接用 `auth()` 拿 session）

**Non-Goals:**

- 不做 Email / 密碼登入（只有 Google OAuth）
- 不做「指定管理員」的 UI（直接在資料庫手動改 role）
- 不做使用者個人資料編輯頁面（屬於後續 profile change）
- 不做其他 Model（Event、Registration 等留給各自的 change）

## Decisions

### 1. Session 策略：Database Session

**選擇**：使用 database session（NextAuth 預設搭配 Prisma Adapter 時的行為）

**替代方案**：JWT session（token 存在 cookie，不查資料庫）

**為什麼選 database session：**
- 搭配 Prisma Adapter 時這是預設行為，設定最簡單
- 可以在資料庫端主動讓 session 失效（例如封鎖使用者）
- 安全性較高，session 資料不暴露在 client 端

**取捨**：每次請求都要查一次資料庫，但對這個規模的應用影響可以忽略。

### 2. Prisma Model：NextAuth 標準 + 自訂欄位

NextAuth Prisma Adapter 需要四張表：**User、Account、Session、VerificationToken**。

在 User model 上加入自訂欄位：
- `role`（MEMBER / ADMIN）— 角色權限
- `points`（Int, 預設 0）— 提前加入，避免之後改 schema 做 migration

**為什麼現在就加 points？** 這是 User 表本身的屬性，不涉及其他 Model 的關聯。加一個欄位的成本幾乎為零，但日後不用再跑一次 migration。

### 3. 路由保護：Next.js Middleware

**選擇**：使用 `middleware.ts` 在 edge 層攔截未授權請求

**替代方案**：在每個 layout 裡用 `auth()` 檢查並 redirect

**為什麼選 Middleware：**
- 集中管理所有路由保護規則，不用在每個 layout 重複寫
- 在頁面渲染之前就攔截，效能更好
- Next.js 官方推薦的做法

**Middleware 規則：**
```
/my-events、/my-events/*  → 需要登入（任何 role）
/admin、/admin/*          → 需要登入 + ADMIN role
/login                    → 已登入就 redirect 到首頁
其他路由                   → 公開
```

**注意**：Middleware 在 edge runtime 執行，不能直接用 Prisma。需要用 NextAuth 的 `auth()` middleware helper，它透過 session token 判斷。ADMIN 權限檢查需要在 middleware 能讀到 role 的前提下（透過 NextAuth callbacks 把 role 加進 session）。

### 4. Header 改造策略：Server Component + auth()

**目前**：Header 是 Server Component，用 `variant` prop 判斷登入狀態。

**改造方向**：
- Header 維持 Server Component，用 `await auth()` 讀取 session
- 根據 session 有無決定顯示登入按鈕或 UserMenu
- 根據 session.user.role 決定導覽列項目
- **移除 variant prop**，改為自動偵測

**UserMenu**：已經是 Client Component（用了 DropdownMenu），改為接收 `user` prop（從 Header 傳入）。

### 5. 登入頁面設計

- 簡潔的單一按鈕：「使用 Google 登入」
- 符合 Neobrutalism 風格（粗邊框、實心陰影）
- 使用 NextAuth 的 `signIn('google')` 觸發 OAuth 流程
- 需要是 Client Component（因為呼叫 signIn）

### 6. 檔案結構

```
lib/
  auth/
    index.ts          ← NextAuth 設定（providers、adapter、callbacks）
  db/
    prisma.ts         ← Prisma Client 單例

app/
  api/auth/
    [...nextauth]/
      route.ts        ← NextAuth API route handler

middleware.ts         ← 路由保護（專案根目錄）

prisma/
  schema.prisma       ← 新增 User、Account、Session、VerificationToken model
```

## Risks / Trade-offs

- **[Edge Runtime 限制]** → Middleware 跑在 edge，不能直接查 Prisma。用 NextAuth session callback 把 role 塞進 session 物件，Middleware 就能讀到 role 而不需要查資料庫。
- **[Google OAuth 設定]** → 需要正確設定 redirect URI，開發環境和 production 不同。先確保 `http://localhost:3000/api/auth/callback/google` 有加到 Google Cloud Console。
- **[首個 ADMIN 使用者]** → 系統沒有自動產生 ADMIN 的機制。第一位組織者需要手動在 Supabase 的資料庫面板把自己的 role 改成 ADMIN。
- **[Session 內的 role 同步]** → 如果在資料庫改了某人的 role，他的 session 不會立即更新（要等 session 過期或重新登入）。目前可接受，未來如果需要可以加 session refresh 機制。

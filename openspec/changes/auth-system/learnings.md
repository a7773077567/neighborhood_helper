# Auth System — Learnings

> 記錄 auth-system change 開發過程中的技術學習和踩坑經驗

---

## 1. Server Action 的本質

Server Action 是 Next.js App Router 的核心機制之一。關鍵理解：

- **Server Action 的程式碼在 server 執行，但由瀏覽器的 `fetch()` 觸發**
- Next.js 在 build 時把 `'use server'` 函式替換成一個 stub（只有 action ID），真正的程式碼不會出現在瀏覽器的 JS bundle 裡
- `<form action={serverAction}>` 被 React 攔截，改用 `fetch() POST` 送出（不是傳統的整頁表單送出）
- 這讓頁面可以保持 Server Component（不送 JS），同時支援互動

### Server Action 適合的場景

- 表單送出、credentials 登入、登出——全程在自己的 domain，不需要 redirect 到外部
- OAuth 登入也可以用（本專案的做法），但要注意：如果 DB 連線有問題，可能產生奇怪的錯誤表現（如 CORS error 其實是 timeout 導致）

---

## 2. Edge Runtime vs Node.js Runtime

Next.js 的 middleware 跑在 **Edge Runtime**，輕量但有限制：

```
Edge Runtime（middleware）       Node.js Runtime（API routes、pages）
────────────────────            ──────────────────────────────────
不支援 node:process              完整 Node.js API
不支援 Prisma                    支援 Prisma
不支援大部分 Node.js 模組         支援所有 npm 套件
```

**踩坑**：一開始 middleware import 了 `auth` from `@/lib/auth`，而 auth 裡面引用了 PrismaAdapter → Prisma → `node:process` → Edge Runtime 直接報錯。

**解法**：middleware 只做「cookie 存在與否」的檢查，不 import auth。真正的 session 驗證留給跑在 Node.js Runtime 的 page/API。

**設計模式**：兩層防線
- 外層（middleware）：粗篩，快速，不查 DB
- 內層（page/API）：精確驗證，查 DB，確認 session 有效性

---

## 3. CORS 只管 fetch，不管頁面導航

這是理解 Web 安全模型的關鍵：

- `fetch()` / `XMLHttpRequest` → 受 CORS 限制
- `window.location.href`、`<a>`、HTTP 302 redirect → 不受 CORS 限制（一般頁面導航）

Server Action 的 OAuth redirect 之所以可能出問題，是因為底層用 `fetch()`，而 fetch 跟隨 redirect 到外部 domain 時會被 CORS 擋。但本專案實測中，DB 正常時 Server Action 的 OAuth redirect 可以正常運作。

---

## 4. Next.js `redirect()` 用 throw 實現

```typescript
function redirect(url) {
  throw new Error(`NEXT_REDIRECT;${url};307`)
}
```

- 用 `throw` 來「中斷函式執行 + 傳遞 redirect 指令」
- 不是真正的錯誤，是 control flow 技巧
- Next.js 框架會在上層 catch 這個特殊錯誤，轉換成真正的 redirect response

---

## 5. `signIn('google')` 背後的完整流程

一個 `signIn('google')` 呼叫背後涉及：

1. 產生 CSRF state + PKCE code_challenge
2. 組合 Google OAuth URL 並 redirect
3. Google 授權後 callback 回來
4. 驗證 state（防 CSRF）
5. 用 code + code_verifier 換 token
6. 取得使用者資料
7. PrismaAdapter 查/建 User + Account
8. 建立 Session + 設定 cookie
9. Redirect 到首頁

Auth.js 把這些全部封裝了，但理解底層流程對 debug 很重要。

---

## 6. Debug 思維：先排除基礎設施

這次花了不少時間追 CORS error，後來發現根本原因是 **Supabase 資料庫連不上**。

**學到的 debug 順序**：
1. 基礎設施能通嗎？（DB、網路、DNS）
2. 環境變數對嗎？
3. 套件版本相容嗎？
4. 最後才懷疑程式邏輯

**判斷 error 來源的技巧**：
- `AdapterError` → DB 層問題
- `PrismaClientKnownRequestError` → Prisma/DB 問題
- `Operation has timed out` → 連線逾時
- render 時間 75s → 在等外部服務 timeout（正常應該是 ms 級）

---

## 7. Supabase 連線格式變更

Supabase 近期調整了 PostgreSQL 連線架構：

- **舊格式**：`db.{project-ref}.supabase.co:5432`（Direct）
- **新格式**：`aws-X-{region}.pooler.supabase.com:5432`（Session Pooler）

三種連線方式：
- **Direct**（port 5432）：直連 DB，適合 migration
- **Session Pooler**（port 5432 on pooler）：有連線池，Prisma 完整相容
- **Transaction Pooler**（port 6543）：最省連線，但不支援 Prepared Statement，Prisma 相容性差

---

## 8. 連線池（Connection Pooling）概念

開關 DB 連線很昂貴（~50ms），連線池預先開好連線讓請求共用：

- **無池**：每個請求 open/close，100 請求 = 100 條連線 → DB 可能爆
- **有池**：10 條連線共用，100 請求輪流借用 → DB 輕鬆

Session Pooler vs Transaction Pooler 的差別在「連線歸還時機」：
- Session：整個 session 結束才歸還（Prisma Prepared Statement 不會斷）
- Transaction：每個 transaction 結束就歸還（Prepared Statement 可能找不到）

---

## 9. Next/Image 的 width/height vs CSS

```tsx
<Image width={18} height={18} className="size-4" />
```

- `width`/`height` = HTML 屬性，告訴 Next.js 原始尺寸（用於計算 aspect ratio、防 CLS）
- `className` = CSS，控制實際渲染尺寸
- CSS 永遠勝出，HTML 屬性只是「提示」

---

## 10. 按鈕陰影風格決策

原本 STYLE_GUIDE 定義「按鈕預設平面，hover 才出現陰影」。實作後覺得整體視覺太平，改為：

- **預設**：`shadow-brutal`（4px 4px 0px）— 銳利實心陰影
- **Hover**：`shadow-brutal-hover`（6px 6px 3px）— 偏移加大 + blur 擴散
- **Active**：`shadow-none` + translate 按下

加 3px blur 在 hover 是個好的平衡點：保持 Neobrutalism 的「硬」感覺，但 hover 時多一點「漂浮」的視覺層次。

---

## 11. Async Server Component 讀取 Session

Header 改造的核心 pattern：把元件改為 `async`，直接 `await auth()` 讀取 session：

```tsx
// Server Component — 可以直接 await
export async function Header(): Promise<React.ReactElement> {
  const session = await auth()  // 直接查 DB，零 API call
  // session === null → 未登入
  // session.user.role === 'ADMIN' → 管理員
}
```

**為什麼比 variant prop 好？**
- 不需要在每個 Layout 手動指定 `variant`（容易忘記或搞錯）
- 真實的登入狀態由 DB 決定，不是由程式碼路徑假設
- Header 成為自包含的元件，不依賴外部告訴它「你應該長什麼樣」

**Server/Client 邊界處理**：
- MobileNav 是 Client Component，不能呼叫 `auth()`
- 解法：Header（Server）計算好 `mobileVariant` 字串，傳給 MobileNav
- 只傳「純資料」跨越 Server/Client 邊界，不傳函式

---

## 12. Server Action 兩種呼叫方式

```tsx
// 方式一：<form action>（推薦用於 mutation）
// 優點：Progressive Enhancement — JS 壞了也能運作
<form action={signOutAction}>
  <button type="submit">登出</button>
</form>

// 方式二：直接在 event handler 呼叫
<button onClick={async () => await signOutAction()}>登出</button>
```

Server Action 不是只能用 `<form>`，但對登入/登出這類操作，`<form>` 是更好的選擇。

**Server Action 放置位置的 scope 原則**：
- 只有一個頁面用 → colocate（跟頁面放一起），如 `app/(auth)/login/actions.ts`
- 多個頁面共用 → 放 `lib/`，如 `lib/auth/actions.ts`

---

## 13. Next.js Image 外部圖片設定

Google OAuth 的大頭照 URL 來自 `lh3.googleusercontent.com`，Next.js `Image` 預設不允許外部網域：

```typescript
// next.config.ts
images: {
  remotePatterns: [
    { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
  ],
},
```

不加這個設定，`<Image src="https://lh3.googleusercontent.com/..." />` 會直接報錯。

---

## 14. 條件式陣列展開（Spread + Conditional）

動態建立導覽項目的 pattern，避免 Record lookup 的重複：

```typescript
const navItems = [
  { label: '活動', href: '/events' },           // 所有人
  ...(session ? [{ label: '我的活動' }] : []),   // 登入才有
  ...(isAdmin ? [{ label: '管理後台' }] : []),   // admin 才有
]
```

`...(條件 ? [項目] : [])` — 條件成立就展開一個元素，否則展開空陣列（等於不加）。比用 `Record<variant, NavItem[]>` 更簡潔，新增共用項目只要改一處。

---

## 15. Radix UI 的 asChild 和 Controlled vs Uncontrolled

**asChild**：讓 Radix 元件不渲染自己的 DOM wrapper，把 props 委派給唯一的子元素。
```tsx
// 沒 asChild：<div role="menuitem"><a>...</a></div>（點 div 不會導覽）
// 有 asChild：<a role="menuitem">...</a>（Link 同時有選單行為 + 導覽功能）
<DropdownMenuItem asChild>
  <Link href="/profile">個人資料</Link>
</DropdownMenuItem>
```

**Controlled vs Uncontrolled**：
- Uncontrolled（DropdownMenu）：不需要 `useState`，Radix 自己管理開關
- Controlled（Sheet/MobileNav）：需要手動關閉（如點連結後 `setOpen(false)`）

---

## 流程改善筆記

- tasks.md 要及時更新，不要等到最後才同步（這次 2.1~4.1 都做完了但 tasks.md 沒更新）
- 遇到「奇怪的錯誤」時，先 `npx prisma db execute` 測 DB 連線，可以快速排除基礎設施問題
- **設計稿整合為單一檔案**：從「每個 change 各自一份 .pen」改為「全部放在 `designs/app-shell.pen`」。單一設計稿避免重複讀取、減少同步問題，用 git 追蹤變更歷史
- **Pencil MCP 綁定 VSCode 視窗**：開多個 VSCode 時，Pencil MCP 可能在錯誤的視窗開檔案。確保只在目標專案的 VSCode 視窗操作

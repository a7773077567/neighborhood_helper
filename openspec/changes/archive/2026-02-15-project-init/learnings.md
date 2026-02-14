# Learnings: project-init

## 遇到的問題與解法

### 1. create-next-app 不能在非空目錄執行

`create-next-app` 偵測到資料夾有現有檔案就會拒絕執行。解法是先在 `/tmp` 暫存目錄建立，再把生成的檔案搬回來。搬移時要注意排除 `.git`、`node_modules`、`README.md`，然後在專案目錄重新 `npm install`。

### 2. DATABASE_URL 密碼的特殊字元要 URL 編碼

Supabase 生成的密碼可能包含 `#`、`&` 等特殊字元，這些在 URL 中有特殊意義（`#` 是 fragment、`&` 是 parameter 分隔符）。必須做 URL 編碼才能正確連線：
- `#` → `%23`
- `&` → `%26`

不編碼的話 Prisma 會報 `P1013 invalid port number` 錯誤（因為 `#` 截斷了 URL）。

### 3. Prisma 有兩個套件

- `prisma`（devDependency）— CLI 工具，用於 init、migrate、generate
- `@prisma/client`（dependency）— 程式碼中 import 的 runtime 套件

新版 Prisma 還會生成 `prisma.config.ts`，DATABASE_URL 在這裡讀取（需要 `dotenv` 套件）。

### 4. shadcn/ui 不是傳統的 npm 套件

shadcn/ui 是把元件原始碼複製到你的 `components/ui/` 目錄，而不是從 `node_modules` import。好處是可以自由修改，壞處是更新要手動。`npx shadcn@latest init` 只做基礎設定，元件要用 `npx shadcn@latest add <name>` 按需安裝。

### 5. @antfu/eslint-config 需要手動安裝 peer dependencies

設定 `react: true` 和 `nextjs: true` 時，需要額外安裝：
- `@eslint-react/eslint-plugin`
- `eslint-plugin-react-hooks`
- `eslint-plugin-react-refresh`
- `@next/eslint-plugin-next`

`test: false` 可以關閉 vitest 整合（避免 `@vitest/eslint-plugin` 的 ESM 相容性問題）。

### 6. .gitignore 和 ESLint ignore 是不同概念

- `.gitignore` = 不推上 Git 的檔案（例如 `.env`、`node_modules`）
- ESLint `ignores` = 不做 lint 檢查的檔案（例如 `.md`、`openspec/`）

一個檔案可以推上 Git 但不被 ESLint 檢查（例如 `openspec/` 規格文件），也可以不推上 Git 但被 ESLint 檢查（雖然這種情況很少）。

## 過程中的提問與釐清

### Q: @antfu/eslint-config 用在 Next.js 需要設定 `nextjs: true` 嗎？

需要。`nextjs: true` 會啟用 `@next/eslint-plugin-next` 提供的 Next.js 專屬 lint 規則（例如 Image、Link 元件的使用方式）。不加的話就只有通用的 React 規則。

### Q: 用了 @antfu/eslint-config 還需要手動安裝 eslint-plugin-react-hooks 這些套件嗎？

需要。它們是 peer dependencies，@antfu/eslint-config 會使用但不會自動安裝。

### Q: @vitest/eslint-plugin 是什麼？目前需要嗎？

它提供 Vitest 測試檔案的 lint 規則（例如防止遺留 `.only`、確保 `expect` 正確使用）。目前不需要，設定 `test: false` 關閉即可，等之後引入 Vitest 再啟用。

### Q: openspec 規格文件、CLAUDE.md 需要推上 Git 嗎？

- `openspec/` → 要推，規格文件是團隊共享的專案資產
- `.claude/CLAUDE.md` → 要推，是專案規範
- `.claude/memory/` → 不推，是個人的 AI 記憶
- `.agent/` → 不推，是 AI agent 的內部工作檔案
- `.claude/settings.local.json` → 不推，是本機設定

關鍵區分：**團隊共享的推上去，個人/本機的不推**。

### Q: Co-Authored-By 是什麼？

Git commit 中標示共同作者的慣例格式。GitHub 會自動辨識，在 commit 記錄中顯示多個作者頭像。用途是保持透明度，讓團隊知道哪些程式碼有 AI 參與。

## 學到的概念

- **App Router** — Next.js 的新路由系統，基於檔案結構，`app/` 目錄下的 `page.tsx` 自動成為路由
- **Flat Config** — ESLint 的新設定格式（`eslint.config.mjs`），取代舊的 `.eslintrc`
- **cn()** — shadcn/ui 的工具函式，合併 `clsx`（條件 class）和 `twMerge`（Tailwind class 合併）
- **Co-Authored-By** — Git commit 中標示共同作者的慣例格式，GitHub 會自動辨識

## 下次可以改進的地方

- create-next-app 初始化前可以先確認最新版的互動選項（這次多了 React Compiler 的問題）
- DATABASE_URL 密碼可以一開始就提醒要 URL 編碼，避免踩坑

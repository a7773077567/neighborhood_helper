## ADDED Requirements

### Requirement: Next.js 專案可正常啟動

系統 SHALL 是一個基於 Next.js 14 (App Router) + TypeScript 的專案，執行 `npm run dev` 後可在 localhost:3000 正常顯示頁面。

#### Scenario: 開發伺服器啟動成功

- **WHEN** 開發者在專案根目錄執行 `npm run dev`
- **THEN** 開發伺服器在 localhost:3000 啟動，瀏覽器可看到頁面

### Requirement: 核心套件已安裝

專案 SHALL 包含以下核心套件：Prisma、shadcn/ui（含 Tailwind CSS）、Zod、Day.js。

#### Scenario: 套件存在於 package.json

- **WHEN** 開發者檢查 package.json
- **THEN** dependencies 中包含 `prisma`、`@prisma/client`、`zod`、`dayjs`，devDependencies 中包含 `prisma`

### Requirement: 檔案結構符合規範

專案 SHALL 建立符合 PRODUCT_SPEC.md 定義的基礎檔案結構。

#### Scenario: 基礎目錄存在

- **WHEN** 開發者檢查專案結構
- **THEN** 以下目錄 SHALL 存在：`app/`、`components/ui/`、`components/features/`、`lib/db/`、`lib/auth/`、`lib/validations/`、`lib/utils/`、`prisma/`

### Requirement: Prisma 可連接 Supabase

專案 SHALL 設定 Prisma 連接到 Supabase PostgreSQL 資料庫。

#### Scenario: Prisma schema 設定正確

- **WHEN** 開發者檢查 `prisma/schema.prisma`
- **THEN** datasource 設定為 postgresql，url 讀取自 DATABASE_URL 環境變數

#### Scenario: 環境變數範本存在

- **WHEN** 開發者檢查 `.env.example`
- **THEN** 檔案包含 `DATABASE_URL` 的範例值

### Requirement: 開發工具設定完成

專案 SHALL 設定 ESLint 和 Prettier 確保程式碼品質。

#### Scenario: ESLint 可執行

- **WHEN** 開發者執行 `npm run lint`
- **THEN** ESLint 正常執行檢查，無設定錯誤

### Requirement: Git repository 已初始化

專案 SHALL 初始化 Git repository 並建立適當的 .gitignore。

#### Scenario: Git 已初始化且有正確的 .gitignore

- **WHEN** 開發者檢查 Git 狀態
- **THEN** Git repository 已初始化，.gitignore 包含 `node_modules/`、`.env`、`.env.local`、`.next/`

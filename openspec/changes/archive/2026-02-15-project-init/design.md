## Context

Neighborhood Helper 是 GDG Tainan 的社群活動管理平台，技術棧已在 CLAUDE.md 中確定（Next.js 14 + TypeScript + Tailwind CSS + shadcn/ui + Prisma + PostgreSQL）。目前專案資料夾只有規劃文件，需要建立程式碼骨架。

開發者對 Next.js 和 Prisma 不熟悉，會使用 Learn+ 模式學習。

## Goals / Non-Goals

**Goals:**

- 建立可運行的 Next.js 14 專案（`npm run dev` 能正常啟動）
- 安裝 CLAUDE.md 定義的核心套件
- 建立符合 PRODUCT_SPEC.md 的檔案結構
- 連接 Supabase PostgreSQL（Prisma 基礎設定）
- 設定開發工具（ESLint，使用 @antfu/eslint-config）
- 初始化 Git repository

**Non-Goals:**

- 不建立任何功能頁面或 API Route
- 不設定 NextAuth.js（留給認證 change）
- 不定義 Prisma Model（留給各功能 change）
- 不設定測試框架（留給需要測試時）
- 不設定 CI/CD pipeline

## Decisions

### Decision 1: 使用 `create-next-app` 建立專案

**選擇**：使用 `npx create-next-app@latest` 搭配 App Router + TypeScript + Tailwind CSS

**替代方案**：手動從零建立
**理由**：create-next-app 是官方推薦方式，自動設定好 TypeScript、Tailwind、ESLint，省去大量手動設定。對學習者來說，從官方模板開始更容易理解預設結構。

### Decision 2: 在現有資料夾中初始化

**選擇**：在現有專案資料夾中執行 create-next-app（使用 `.` 作為目錄）

**替代方案**：建立新資料夾再搬移文件
**理由**：現有的 CLAUDE.md、PRODUCT_SPEC.md、DEV_GUIDE.md、openspec/ 都已在正確位置，直接在此初始化最簡單。需要注意保留現有檔案。

### Decision 3: Prisma 只做基礎設定

**選擇**：安裝 Prisma、初始化設定檔、設定 Supabase 連線，但不定義任何 Model

**替代方案**：一次建好所有 Model
**理由**：每個功能模組的 Model 應該在對應的 change 中定義。初始化只確保 Prisma 能連上資料庫即可。這也讓學習者在後續 change 中專注學習特定 Model 的設計。

### Decision 4: shadcn/ui 初始化但不安裝元件

**選擇**：執行 `npx shadcn@latest init` 完成基礎設定，但不預先安裝任何元件

**替代方案**：預先安裝常用元件（Button、Card 等）
**理由**：shadcn/ui 的設計是按需安裝。在後續開發 UI 時再安裝需要的元件，避免安裝用不到的東西。

### Decision 5: 使用 @antfu/eslint-config 取代預設 ESLint + Prettier

**選擇**：使用 `@antfu/eslint-config`（ESLint Flat Config），不另外安裝 Prettier

**替代方案**：Next.js 預設 ESLint + 額外設定 Prettier
**理由**：@antfu/eslint-config 內建 stylistic 格式化規則，不需要 Prettier。使用 flat config 格式（eslint.config.js），設定更簡潔。create-next-app 初始化時選擇不使用 ESLint，之後再手動設定 @antfu/eslint-config 以避免衝突。

### Decision 6: Supabase 免費方案

**選擇**：使用 Supabase 免費方案託管 PostgreSQL

**理由**：PRODUCT_SPEC.md 已確定使用 Supabase。免費方案提供 500MB 儲存空間，對 MVP 足夠。

## Risks / Trade-offs

- **[Risk] create-next-app 可能與現有檔案衝突** → 執行前確認不會覆蓋現有的 .claude/、openspec/、*.md 檔案。如有衝突，手動處理。
- **[Risk] Supabase 免費方案有限制（暫停不活躍專案）** → MVP 階段可接受。正式上線前升級付費方案。
- **[Risk] 套件版本相容性** → 使用穩定版本，避免 beta/rc 版本。

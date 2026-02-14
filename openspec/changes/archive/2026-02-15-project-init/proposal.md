## Why

Neighborhood Helper 專案目前只有規劃文件（PRODUCT_SPEC.md、DEV_GUIDE.md、CLAUDE.md），尚未建立任何程式碼。需要初始化 Next.js 專案骨架，安裝核心套件，建立基礎檔案結構，讓後續的功能開發（認證、活動管理、報名系統等）有一個穩固的起點。

## What Changes

- 建立 Next.js 14 專案（App Router + TypeScript）
- 安裝核心套件：Prisma、shadcn/ui、Zod、Day.js
- 建立基礎檔案結構（app/、components/、lib/）
- 設定 Prisma 並連接 Supabase PostgreSQL
- 建立環境變數範本（.env.example）
- 設定 ESLint + Prettier
- 初始化 Git 並建立第一次 commit

### 不包含（留給後續 changes）

- NextAuth.js 認證設定
- Prisma Schema（User、Event 等 model）
- 任何功能頁面或 API
- Vitest 測試設定
- Resend / React Email 設定

## Capabilities

### New Capabilities

- `project-scaffold`: Next.js 專案骨架建立，包含基礎檔案結構、核心套件安裝、開發環境設定

### Modified Capabilities

（無，這是全新專案）

## Impact

- 建立全新的 Next.js 專案結構
- 新增 package.json 及所有相依套件
- 建立 Prisma 基礎設定（schema.prisma，但不含 model）
- 建立 .env.example 環境變數範本
- 初始化 Git repository

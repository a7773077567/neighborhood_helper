## Why

目前專案只有 Next.js 預設的空白頁面，沒有共用的導覽列、頁尾、或 Route Group layout。在開發任何功能模組（活動管理、報名、排行榜等）之前，需要先建立應用程式的「外殼」——統一的 layout 結構和共用 UI 元件，讓後續每個功能有一致的視覺框架和使用者體驗基礎。

## What Changes

- 建立 Root Layout：全域 metadata、字型、主題設定
- 建立公開頁面 Layout `(public)/`：Header（Logo + 導覽列 + 登入按鈕）、Footer
- 建立登入後頁面 Layout `(dashboard)/`：Header 顯示使用者資訊、多一個「我的活動」等選項
- 建立組織者 Layout `(admin)/`：獨立的管理介面 layout（可能有側邊欄）
- 建立響應式 Mobile Navigation（漢堡選單）
- 建立首頁（Landing Page）：簡單的歡迎頁面，引導使用者瀏覽活動
- 設定共用 UI 基礎：Toast 通知、Loading skeleton、Empty state 元件

## Capabilities

### New Capabilities

- `app-shell`: 應用程式外殼，包含 Header、Footer、Navigation、Route Group Layouts、響應式設計、共用 UI 模式（Toast、Loading、Empty State）

### Modified Capabilities

（無）

## Impact

- `app/layout.tsx`：更新 Root Layout（metadata、字型、providers）
- `app/(public)/layout.tsx`：新增公開頁面 layout
- `app/(dashboard)/layout.tsx`：新增登入後頁面 layout
- `app/(admin)/layout.tsx`：新增管理介面 layout
- `app/page.tsx`：替換預設首頁為 Landing Page
- `components/features/`：新增 layout 相關元件（Header、Footer、MobileNav 等）
- `components/ui/`：可能需要安裝 shadcn/ui 元件（NavigationMenu、Sheet、Skeleton、Toast 等）

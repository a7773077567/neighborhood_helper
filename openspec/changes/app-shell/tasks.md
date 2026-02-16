## 1. shadcn/ui 元件安裝

- [x] 1.1 安裝 shadcn/ui 元件：Button、NavigationMenu、Sheet、Skeleton、DropdownMenu、Avatar、Sonner

## 2. Pencil 設計

- [x] 2.1 用 Pencil 設計 Header（桌面版：未登入 / 已登入 / Admin 三種狀態）
- [x] 2.2 用 Pencil 設計 Header（手機版：漢堡選單 + 側邊選單展開）
- [x] 2.3 用 Pencil 設計 Footer
- [x] 2.4 用 Pencil 設計首頁 Landing Page（Hero 區塊）
- [x] 2.5 用 Pencil 設計 Empty State 元件

## 3. Layout 元件實作

- [x] 3.1 建立 Header 元件（`components/features/layout/header.tsx`），支援 variant prop
- [x] 3.2 建立 Mobile Navigation 元件（`components/features/layout/mobile-nav.tsx`），使用 Sheet
- [x] 3.3 建立 User Menu 元件（`components/features/layout/user-menu.tsx`），使用 DropdownMenu + Avatar
- [x] 3.4 建立 Footer 元件（`components/features/layout/footer.tsx`）

## 4. Route Group Layout 設定

- [ ] 4.1 更新 Root Layout（`app/layout.tsx`）：metadata、字型、Toaster provider
- [ ] 4.2 建立 `(public)` Route Group layout：引用 Header（public variant）+ Footer
- [ ] 4.3 建立 `(auth)` Route Group layout：簡潔 Header（只有 Logo）
- [ ] 4.4 建立 `(dashboard)` Route Group layout：引用 Header（dashboard variant）+ Footer
- [ ] 4.5 建立 `(admin)` Route Group layout：引用 Header（admin variant）+ Footer

## 5. 頁面實作

- [ ] 5.1 實作首頁 Landing Page（`app/page.tsx`）：Hero 區塊 + CTA 按鈕
- [ ] 5.2 建立各 Route Group 的 placeholder 頁面（確保路由結構正常）

## 6. 共用 UI 元件

- [ ] 6.1 建立 Empty State 元件（`components/features/layout/empty-state.tsx`）

## 7. 驗證

- [ ] 7.1 確認所有頁面在桌面和手機版正常顯示
- [ ] 7.2 確認導覽連結正確跳轉
- [ ] 7.3 確認 Toast 通知可正常觸發

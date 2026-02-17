## Context

目前專案是 Next.js 14 預設腳手架，只有一個 Root Layout 和預設首頁。沒有任何導覽結構、Route Group、或共用 UI 元件。

根據 PRODUCT_SPEC，應用程式有四種頁面區塊：
- `(public)/`：公開頁面（活動列表、排行榜）— 未登入可看
- `(auth)/`：認證頁面（登入）
- `(dashboard)/`：需登入頁面（個人中心、我的活動）
- `(admin)/`：組織者專區（活動管理、講者管理、簽到）

所有區塊共用同一個 Header 和 Footer，但 Header 內容根據登入狀態和角色不同。

## Goals / Non-Goals

**Goals:**
- 建立統一的 Header + Footer + Navigation 結構
- 設定四個 Route Group 的 layout
- 實現響應式 Mobile Navigation
- 建立首頁（簡單的 Landing Page，引導到活動列表）
- 設定共用 UI 基礎元件（Toast、Skeleton、Empty State）

**Non-Goals:**
- 不實作認證邏輯（Auth 是下一個 change）
- 不實作任何功能頁面內容（只建結構）
- 不做 Dark Mode（未來考慮）
- 不做多語系
- Admin 側邊欄暫時不做（Admin 頁面數量少，用 Header nav 即可）

## Decisions

### 1. Layout 結構：共用 Layout + Route Group Layout

```
app/
├── layout.tsx              ← Root Layout（字型、metadata、Toaster）
├── page.tsx                ← 首頁（Landing Page）
├── (public)/
│   ├── layout.tsx          ← 公開 Layout（Header + Footer）
│   └── ...
├── (dashboard)/
│   ├── layout.tsx          ← 登入後 Layout（同 Header，但有 user menu）
│   └── ...
├── (admin)/
│   ├── layout.tsx          ← Admin Layout（同 Header，但有管理選項）
│   └── ...
└── (auth)/
    ├── layout.tsx          ← 認證 Layout（簡潔，只有 Logo）
    └── ...
```

**決策**：Header 和 Footer 作為共用元件，在各 Route Group layout 中引用。不同 layout 傳入不同 props 控制顯示內容。

**理由**：比起在 Root Layout 放 Header/Footer，Route Group layout 更靈活。例如 `(auth)/` 的登入頁不需要完整導覽列。

### 2. Header 元件設計

Header 根據三種狀態顯示不同內容：

| 狀態 | Logo | 導覽項目 | 右側 |
|------|------|---------|------|
| 未登入 | ✅ | 活動、排行榜 | 登入按鈕 |
| 已登入（會員） | ✅ | 活動、排行榜、我的活動 | 使用者頭像 + 下拉選單 |
| 已登入（組織者） | ✅ | 活動、排行榜、我的活動、管理後台 | 使用者頭像 + 下拉選單 |

**決策**：Header 接受 `variant` prop（`"public" | "dashboard" | "admin"`），內部根據 variant + session 狀態決定顯示內容。

**替代方案**：建立三個獨立的 Header 元件 — 但程式碼重複太多，不採用。

### 3. Mobile Navigation：Sheet（側邊滑出）

**決策**：在 mobile 尺寸（< 768px）隱藏桌面導覽列，顯示漢堡圖示按鈕，點擊後用 shadcn/ui 的 `Sheet` 元件從左側滑出導覽選單。

**理由**：
- `Sheet` 是 shadcn/ui 內建元件，不需額外開發
- 側邊滑出比下拉選單有更多空間放導覽項目
- 使用者體驗更好（可以看到完整選單）

### 4. 共用 UI 元件選擇

| 需求 | shadcn/ui 元件 | 用途 |
|------|---------------|------|
| 通知提示 | `Sonner`（Toast） | 報名成功、錯誤提示 |
| 載入狀態 | `Skeleton` | 頁面載入時的骨架畫面 |
| 空狀態 | 自訂元件 | 沒有資料時的提示（用 illustration + 文字） |
| 導覽列 | `NavigationMenu` | 桌面版導覽 |
| Mobile 選單 | `Sheet` | 手機版側邊選單 |
| 使用者選單 | `DropdownMenu` + `Avatar` | 登入後的使用者下拉選單 |
| 按鈕 | `Button` | 登入按鈕等 |

**決策**：Toast 使用 Sonner 而非 shadcn/ui 原生 Toast。

**理由**：Sonner 的 API 更簡潔（`toast("成功")`），且 shadcn/ui 官方也推薦使用 Sonner。

### 5. 首頁設計

首頁 Landing Page，包含四個區塊：
- **Hero**：品牌 badge + 標題「讓科技成為這片土地的養分」+ 副標題 + CTA 按鈕
- **Marquee（跑馬燈）**：3 列無限滾動 pill items，展示社群關鍵字
- **Features**：「我們正在做的事」3 張特色卡片
- **CTA**：底部號召行動「準備好加入了嗎？」

**決策**：首頁使用 `(public)` layout，不建立獨立 layout。

**理由**：首頁和其他公開頁面共用相同的 Header/Footer，沒有特殊 layout 需求。

### 7. 動態行為規格（非靜態設計）

Pencil 設計稿是靜態的，以下元件有動態行為，需搭配程式碼實作：

#### Marquee 跑馬燈

```
套件：react-fast-marquee
結構：3 列水平無限滾動

Row 1：speed=40
Row 2：speed=30
Row 3：speed=35
方向：3 列同方向，每 20 秒全部反轉（Gumroad 風格）

共用設定：
  pauseOnHover: true（滑鼠移入暫停）
  autoFill: true（自動填滿寬度，不留空白）

背景：#F9F6F0（與頁面統一底色）
每個 item：Lucide icon（彩色）+ 白色藥丸按鈕
所有 item hover 時浮起 + 陰影效果（3px 3px 0 #1A1A1A）
```

> 設計稿中 Marquee Band 寬度 1600px > 容器 1280px，搭配 clip: true 模擬邊緣裁切效果。實際實作用 `overflow-hidden` + `react-fast-marquee` 的 `autoFill` 即可。

### 6. 元件目錄結構

```
components/
├── ui/                        ← shadcn/ui（自動安裝）
│   ├── button.tsx
│   ├── sheet.tsx
│   ├── skeleton.tsx
│   ├── dropdown-menu.tsx
│   ├── avatar.tsx
│   ├── navigation-menu.tsx
│   └── sonner.tsx
└── features/
    └── layout/                ← 新增：layout 相關元件
        ├── header.tsx         （Header 主元件）
        ├── footer.tsx         （Footer）
        ├── mobile-nav.tsx     （Mobile 側邊選單）
        ├── user-menu.tsx      （使用者下拉選單）
        └── empty-state.tsx    （空狀態元件）
```

## Risks / Trade-offs

- **Auth 尚未實作** → Header 的使用者選單和角色判斷會先用假資料或 placeholder。等 auth change 完成後再接入真實 session。
  → 緩解：Header 設計時預留 session prop 接口，auth 接入時只需傳入真實資料。

- **導覽項目會隨功能增加** → 目前只有「活動」和「排行榜」，之後會加更多。
  → 緩解：導覽項目用陣列配置，新增只需加一行。

- **Admin layout 可能需要側邊欄** → 目前決定不做，但 Admin 功能變多後可能需要。
  → 緩解：Route Group layout 可以獨立修改，不影響其他部分。

# 雞婆鄰里互助會 視覺風格規範

> **風格定位**：暖橘 Neobrutalism — 社群感、手繪質感、活潑但不雜亂
> **更新日期**：2026-02-15

---

## 設計哲學

以 **Neobrutalism** 為骨架，融合社群的溫暖和手繪的隨性感。

**關鍵字**：溫暖、活潑、社群、手繪感、code 文化、不制式但有秩序

**參考方向**：
- Gumroad（Neobrutalism 結構：粗邊框 + 實心陰影）
- Hack Club（社群溫度：旋轉貼紙、跑馬燈、活力感）
- Excalidraw（手繪質感的精神）

---

## 色彩系統

### 主色

```
招牌橘:     #FF7A3D    — 主要 CTA、品牌色、小雞吉祥物
暖黃:       #FFD23F    — 輔助強調、次要裝飾（少量使用）
深橘:       #D4764E    — 橘色的深色變體，用於區別
```

### 基底色

```
奶油白:     #F9F6F0    — 頁面主背景（統一底色，柔和不刺眼）
暖灰米:     #F5F0EB    — 保留供元件內部使用
淡橘:       #FFF3E8    — 保留供元件內部使用
```

### 中性色

```
黑:         #1A1A1A    — 邊框、標題文字、實心陰影
深暖褐:     #2A2520    — Footer 背景（比純黑更溫暖）
深灰:       #555555    — 次要文字（導覽連結）
中灰:       #666666    — 內文、描述文字
淺暖灰:     #D4C8BC    — Footer 文字（暗底上的柔和色）
Footer灰:   #8A7E72    — Footer 版權文字
白:         #FFFFFF    — 按鈕文字（在深色底上）
```

### 色彩使用原則

```
✅ 全頁統一底色（#F9F6F0），不用多種背景色區分區塊
✅ 色彩集中在小元素（badge、按鈕、icon、卡片邊框）
✅ 區塊區分靠內容和間距，不靠背景色
✅ 同色系做區別（橘 / 暖黃 / 深橘），不引入太多色相
❌ 不要整個大區塊用高飽和度色（避免視覺疲勞）
❌ 不要用純黑 #000000（用 #1A1A1A 或 #2A2520）
❌ 不要用純白 #FFFFFF 當背景（用 #F9F6F0）
```

---

## 字體

### 字體家族

```
標題:     Space Mono          — monospace，有 code 文化感
內文:     Inter               — 乾淨好讀，中文搭配 Noto Sans TC
裝飾:     Caveat（選用）       — 手寫風，僅用於少量裝飾文字
```

### 字級

```
Hero 標題:     64-72px   Space Mono, 700
區塊標題:      32-36px   Space Mono, 700
卡片標題:      18px      Space Mono, 700
內文:          16px      Inter, 400
小字/描述:     14px      Inter, 400
Badge/標籤:    12px      Space Mono, 600
版權文字:      12px      Space Mono, 400
```

### 字重

```
700 (Bold):     標題、品牌名
600 (Semibold): Badge、按鈕文字、導覽（active）
500 (Medium):   導覽連結
400 (Regular):  內文、描述
```

---

## 邊框 & 陰影（Neobrutalism 核心）

### 邊框

```
標準邊框:    border-2 border-[#1A1A1A]     — 所有卡片、按鈕、badge
粗細:        2px
顏色:        #1A1A1A
```

### 實心陰影

```
標準:        shadow-[4px_4px_0px_#1A1A1A]
小型元件:    shadow-[3px_3px_0px_#1A1A1A]    — badge 等小元素

彩色陰影（選用）:
            shadow-[3px_3px_0px_#FF7A3D]     — 特殊強調（如登入按鈕）
```

### 互動狀態（Gumroad 風格：平面預設，hover 浮起）

```
預設:        無陰影（平面）
hover:       shadow-[4px_4px_0px_#1A1A1A] + translate(-2px, -2px)  — 「浮起來」
active:      shadow-none + translate(2px, 2px)  — 「按下去」的觸感

注意：按鈕和 Badge 預設不帶陰影，只有 hover 時才出現。
      卡片（Card）例外，卡片預設保留陰影。
```

---

## 圓角

```
預設:        rounded-lg (8px)     — 卡片、按鈕
Badge/Tag:   rounded-full         — 藥丸形
大卡片:      rounded-xl (12px)    — 選用
```

---

## 元件樣式參考

### 按鈕

```
主要 CTA:
  背景: #FF7A3D
  文字: #FFFFFF (Space Mono, 600)
  邊框: 2px solid #1A1A1A
  陰影: 無（hover 時 4px 4px 0 #1A1A1A）
  圓角: 8px

次要按鈕:
  背景: #F9F6F0
  文字: #1A1A1A (Space Mono, 600)
  邊框: 2px solid #1A1A1A
  陰影: 無（hover 時 4px 4px 0 #1A1A1A）
  圓角: 8px

深色按鈕:
  背景: #1A1A1A
  文字: #FFFFFF (Space Mono, 600)
  邊框: 2px solid #1A1A1A
  陰影: 無（hover 時 3px 3px 0 #FF7A3D）
  圓角: 8px
```

### 卡片

```
背景: #F9F6F0
邊框: 2px solid #1A1A1A
陰影: 4px 4px 0 #1A1A1A（卡片預設保留陰影）
圓角: 8px
內距: 28px
Icon 方塊: 48x48, 圓角 8px, 邊框 2px
```

### Badge / Tag

```
品牌 Badge:
  背景: #FF7A3D
  文字: #FFFFFF
  邊框: 2px solid #1A1A1A
  陰影: 無（hover 時 3px 3px 0 #1A1A1A）
  圓角: full (藥丸形)

狀態 Tag:
  背景: 對應狀態色的淡色版本
  文字: 對應狀態色
  邊框: 2px solid #1A1A1A
  圓角: full
```

### 跑馬燈 (Marquee)

```
背景: #F9F6F0（與頁面統一）
結構: 3 列水平無限滾動（react-fast-marquee）
  Row 1: 向左, speed=40
  Row 2: 向右, speed=30
  Row 3: 向左, speed=35

每個 item:
  Lucide icon（彩色，各自不同色）+ 白色藥丸按鈕
  藥丸: bg white, border 1px #E0E0E0, rounded-full, px-6 py-2.5
  陰影: 無（hover 時 3px 3px 0 #1A1A1A）

共用設定:
  pauseOnHover: true
  autoFill: true（自動填滿寬度）

風格參考: Gumroad 首頁的 tag 跑馬燈區塊
```

---

## 趣味元素

### 微旋轉

```
部分卡片或裝飾: rotate-[-2deg] ~ rotate-[3deg]
hover 回正:      rotate-0 + transition
使用頻率:        少量，不是每個元素都轉
```

### 貼紙裝飾（未來）

```
小雞吉祥物不同姿勢的手繪版本
手繪風箭頭、圈圈、底線
散佈在頁面特定位置
```

---

## 觸控目標

```
最小觸控面積:  44px（Apple HIG 標準）
適用對象:      按鈕、導覽連結、可點擊區域
Pencil 設計:   設計時也需遵守此標準
Tailwind 參考: py-3 (12px) + text-sm (20px) + py-3 (12px) = 44px
```

---

## Icon

```
Icon 庫:     Lucide（專案已安裝）
風格:        outline style
大小:        20-24px（一般）、48px 方塊內 24px icon
顏色:        跟隨文字色或用白色（在彩色底上）
```

---

## 區塊背景策略

全頁統一底色，區塊靠內容和間距區分，不靠背景色：

```
全頁統一:    #F9F6F0（奶油白）
Footer:      #2A2520（深暖褐，唯一深色區塊）

設計原則:
  ✅ 區塊間用大間距（120-160px padding）自然分隔
  ✅ 色彩留給元素本身（按鈕、icon、卡片邊框）
  ✅ 參考 Gumroad：大部分區塊同底色，靠內容區分
  ❌ 不要給每個區塊不同背景色
```

---

## Tailwind CSS 自訂色彩 Token

實作時在 `tailwind.config.ts` 中設定：

```typescript
colors: {
  brand: {
    orange: '#FF7A3D',
    yellow: '#FFD23F',
    'deep-orange': '#D4764E',
  },
  surface: {
    warm: '#F9F6F0',       // 頁面統一底色（原 #FFFDF7）
    muted: '#F5F0EB',      // 保留供元件內部使用
    'light-orange': '#FFF3E8', // 保留供元件內部使用
    footer: '#2A2520',
  },
  ink: {
    primary: '#1A1A1A',
    secondary: '#555555',
    body: '#666666',
    'footer-light': '#D4C8BC',
    'footer-muted': '#8A7E72',
  },
}
```

---

**最後更新**：2026-02-16

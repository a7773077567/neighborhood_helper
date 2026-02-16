# Neighborhood Helper 視覺風格規範

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
暖白:       #FFFDF7    — 頁面主背景（帶微暖色調）
暖灰米:     #F5F0EB    — 區塊背景（Features 等段落）
淡橘:       #FFF3E8    — 次要區塊背景（CTA 等）
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
✅ 大區塊用柔和暖色（暖白、暖灰米、淡橘）
✅ 色彩集中在小元素（badge、按鈕、icon）
✅ 同色系做區別（橘 / 暖黃 / 深橘），不引入太多色相
❌ 不要整個大區塊用高飽和度色（避免視覺疲勞）
❌ 不要用純黑 #000000（用 #1A1A1A 或 #2A2520）
❌ 不要用純白 #FFFFFF 當背景（用 #FFFDF7）
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

### 互動狀態

```
預設:        shadow-[4px_4px_0px_#1A1A1A]
hover:       shadow-[6px_6px_0px_#1A1A1A] + translate(-2px, -2px)
active:      shadow-none + translate(4px, 4px)  — 「按下去」的觸感
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
  陰影: 4px 4px 0 #1A1A1A
  圓角: 8px

次要按鈕:
  背景: #FFFDF7
  文字: #1A1A1A (Space Mono, 600)
  邊框: 2px solid #1A1A1A
  陰影: 4px 4px 0 #1A1A1A
  圓角: 8px

深色按鈕:
  背景: #1A1A1A
  文字: #FFFFFF (Space Mono, 600)
  邊框: 2px solid #1A1A1A
  陰影: 3px 3px 0 #FF7A3D（彩色陰影）
  圓角: 8px
```

### 卡片

```
背景: #FFFDF7
邊框: 2px solid #1A1A1A
陰影: 4px 4px 0 #1A1A1A
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
  陰影: 3px 3px 0 #1A1A1A
  圓角: full (藥丸形)

狀態 Tag:
  背景: 對應狀態色的淡色版本
  文字: 對應狀態色
  邊框: 2px solid #1A1A1A
  圓角: full
```

### 跑馬燈 (Marquee)

```
背景: #1A1A1A
高度: 48px
文字: Space Mono, 600, 13px
文字顏色: 橘 #FF7A3D 和暖黃 #FFD23F 交替
動態: 無限水平滾動（react-fast-marquee 或 CSS animation）
風格參考: Gumroad / Hack Club 的跑馬燈
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

頁面不同區塊使用柔和的暖色調區隔，不用高飽和度的大色塊：

```
Header:      #FFFDF7（暖白）
Hero:        #FFFDF7（暖白，色彩集中在 badge 和按鈕）
Marquee:     #1A1A1A（黑，作為視覺節奏分隔）
Features:    #F5F0EB（暖灰米）
CTA:         #FFF3E8（淡橘）
Footer:      #2A2520（深暖褐）
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
    warm: '#FFFDF7',
    muted: '#F5F0EB',
    'light-orange': '#FFF3E8',
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

**最後更新**：2026-02-15

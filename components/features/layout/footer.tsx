import { MapPin } from 'lucide-react'
import Link from 'next/link'

/* ─────────────────────────────────────────────
 * Footer 連結設定
 *
 * 用陣列管理，方便未來新增或調整連結，
 * 不需要去 JSX 裡面找。
 * ───────────────────────────────────────────── */
const FOOTER_LINKS = [
  { label: '關於我們', href: '/about' },
  { label: '聯絡方式', href: '/contact' },
] as const
/*
 * `as const` 的作用：
 *   把陣列和物件的值「鎖死」為字面型別（literal types）。
 *   不加的話：label 的型別是 string
 *   加了之後：label 的型別是 '關於我們' | '聯絡方式'
 *   這裡用主要是防止意外修改（readonly），型別更精確是附帶好處。
 */

/* ─────────────────────────────────────────────
 * Footer 元件（Server Component）
 *
 * 對照 Pencil 設計（節點 0PRG0）：
 *
 * 桌面版（≥ 768px）：
 *   [📍 GDG Tainan — 雞婆鄰里互助會]  .....  [關於我們] [聯絡方式] [© 2026]
 *
 * 手機版（< 768px）：Pencil 設計（節點 CKnvx）
 *   [📍 GDG Tainan — 雞婆鄰里互助會]
 *   [關於我們] [聯絡方式]
 *   [© 2026]
 *
 * 不需要 'use client'：Footer 沒有任何互動狀態，
 * 純粹是靜態內容 + Link（Server Component 的 Link 不需要 JS）。
 * ───────────────────────────────────────────── */
export function Footer(): React.ReactElement {
  return (
    <footer className="flex flex-col items-center gap-3 border-t-2 border-ink-primary bg-surface-footer px-4 py-4 md:h-14 md:flex-row md:justify-between md:gap-0 md:px-6 md:py-0 sticky bottom-0 z-40">
      {/*
       * 響應式策略（mobile-first）：
       *
       * 手機版（預設）：
       *   flex-col       → 垂直堆疊
       *   items-center   → 置中對齊
       *   gap-3          → 各區塊間距 12px
       *   px-4 py-4      → 四邊內距 16px
       *
       * 桌面版（md:）：
       *   md:flex-row         → 水平排列
       *   md:justify-between  → 左右分散
       *   md:h-20             → 固定高度 80px（對齊 Pencil）
       *   md:gap-0            → 取消 gap（改用 justify-between 分配空間）
       *   md:px-6 md:py-0     → 只保留左右內距 24px
       */}

      {/* ── 左側：品牌標示 ── */}
      <div className="flex items-center gap-2">
        {/*
         * gap-2 = 8px，對齊 Pencil 設計的 gap: 8
         */}
        <MapPin className="size-4 text-ink-footer-light" />
        {/*
         * size-4 = 16px，對齊 Pencil 的 width/height: 16
         * text-ink-footer-light → currentColor 變成 #555555
         */}
        <span className="font-mono text-[13px] text-ink-footer-light">
          GDG Tainan — 雞婆鄰里互助會
        </span>
        {/*
         * font-mono → Space Mono（layout.tsx 已設定 --font-mono）
         * text-[13px] → Pencil 設計的 fontSize: 13
         *   13px 不在 Tailwind 預設字級裡，所以用 arbitrary value
         * text-ink-footer-light → #555555
         */}
      </div>

      {/* ── 右側：連結 + 版權 ── */}
      <div className="flex flex-col items-center gap-3 md:flex-row md:gap-4">
        {/*
         * 這個 div 包住「連結」和「版權」兩個群組。
         *
         * 手機版（預設）：
         *   flex-col      → 連結一行、版權一行（垂直堆疊）
         *   items-center  → 置中
         *   gap-3         → 12px（對齊 Pencil 手機版設計 CKnvx 的 gap: 12）
         *
         * 桌面版（md:）：
         *   md:flex-row   → 連結和版權排成一行
         *   md:gap-4      → 16px（對齊 Pencil 桌面版設計 0PRG0 的 gap: 16）
         */}

        {/* 導覽連結 */}
        <div className="flex items-center gap-4">
          {/*
           * 連結之間的間距固定 gap-4 = 16px，
           * 桌面和手機版都是水平排列（「關於我們」和「聯絡方式」永遠在同一行）。
           */}
          {FOOTER_LINKS.map(link => (
            <Link
              key={link.href}
              href={link.href}
              className="text-[13px] text-ink-footer-light hover:text-ink-primary"
            >
              {/*
               * hover:text-ink-primary → 淺色背景上，hover 時加深提高對比
               * Pencil 沒定義 hover 狀態，這是合理的互動補充
               */}
              {link.label}
            </Link>
          ))}
        </div>

        {/* 版權文字 */}
        <span className="text-[13px] text-ink-footer-muted">
          © 2026
        </span>
        {/*
         * text-ink-footer-muted → #8A7E72
         * 比連結文字更淡，製造視覺層次：
         *   連結 #555555（要看到、要點）
         *   版權 #8A7E72（資訊性、不重要）
         *
         * 手機版：版權獨立一行（因為外層是 flex-col）
         * 桌面版：跟連結同一行（因為外層是 md:flex-row）
         */}
      </div>
    </footer>
  )
}

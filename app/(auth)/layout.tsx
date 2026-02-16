import { Bird } from 'lucide-react'
import Link from 'next/link'

/* ─────────────────────────────────────────────
 * (auth) Route Group Layout
 *
 * 對照 Pencil 設計：桌面 d2EUx / 手機 hJ6Gj
 *
 * 這個 layout 包住所有「認證」頁面：
 *   - /login（登入）
 *   - /register（註冊）
 *
 * 結構（跟 public 不同）：
 *   ┌─────────────────────┐
 *   │  [🐦 品牌名]  置中   │  ← 簡潔 Header：只有 Logo，沒有導覽
 *   ├─────────────────────┤
 *   │                     │
 *   │      children       │  ← 登入/註冊表單
 *   │                     │
 *   └─────────────────────┘
 *   （沒有 Footer）
 *
 * 為什麼 (auth) 不用 Header 元件？
 *   Auth 頁面需要極簡體驗：
 *   - 沒有導覽 → 不讓使用者分心
 *   - 沒有 Footer → 減少干擾
 *   - Logo 置中 → 引導視覺焦點到表單
 *   結構跟 Header 差太多，沒必要共用同一個元件。
 *
 * 為什麼 min-h-screen 但不需要 flex-1？
 *   沒有 Footer 要推到底部，min-h-screen 只是確保
 *   頁面至少有一個螢幕高度，讓表單垂直置中時有足夠空間。
 * ───────────────────────────────────────────── */
export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>): React.ReactElement {
  return (
    <div className="min-h-screen">
      {/* ── Auth Header：置中 Logo ── */}
      <header className="flex h-14 items-center justify-center border-b-2 border-ink-primary bg-surface-warm px-4 md:h-16 md:px-6">
        {/*
         * justify-center → Logo 水平置中（不同於 Header 的 justify-between）
         * 響應式尺寸跟 Header 一致：h-14(56px) / md:h-16(64px)
         */}
        <Link href="/" className="flex items-center gap-1.5 md:gap-2">
          <Bird className="size-6 text-brand-orange md:size-7" />
          <span className="font-mono text-base font-bold text-ink-primary md:text-lg">
            Neighborhood Helper
          </span>
        </Link>
      </header>

      {/* 頁面內容（登入/註冊表單） */}
      <main>{children}</main>
    </div>
  )
}

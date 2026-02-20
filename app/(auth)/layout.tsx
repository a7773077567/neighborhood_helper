import Image from 'next/image'
import Link from 'next/link'
import { Footer } from '@/components/features/layout/footer'

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
 *   │      children       │  ← 登入/註冊表單（flex-1 撐滿中間）
 *   │                     │
 *   ├─────────────────────┤
 *   │  Footer（完整版）    │  ← 共用 Footer 元件
 *   └─────────────────────┘
 *
 * 為什麼 (auth) 不用 Header 元件？
 *   Auth 頁面的 Header 需要極簡體驗：
 *   - 沒有導覽 → 不讓使用者分心
 *   - Logo 置中 → 引導視覺焦點到表單
 *   結構跟 Header 差太多，沒必要共用元件。
 *   但 Footer 共用完整版，保持全站一致。
 *
 * 為什麼用 flex + min-h-screen？
 *   Header 和 Footer 各佔固定高度，中間 main(flex-1)
 *   自動填滿剩餘空間，讓表單能垂直置中。
 * ───────────────────────────────────────────── */
export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>): React.ReactElement {
  return (
    <div className="flex min-h-screen flex-col bg-surface-warm">
      {/* ── Auth Header：置中 Logo ── */}
      <header className="flex h-14 items-center justify-center border-b-2 border-ink-primary bg-surface-header px-4 md:h-16 md:px-6">
        {/*
         * justify-center → Logo 水平置中（不同於 Header 的 justify-between）
         * 響應式尺寸跟 Header 一致：h-14(56px) / md:h-16(64px)
         */}
        <Link href="/" className="flex items-center gap-1.5 md:gap-2">
          <Image
            src="/images/logo-no-bg.png"
            alt="雞婆鄰里互助會 Logo"
            width={48}
            height={48}
            className="size-11 md:size-12"
          />
          <span className="font-mono text-base font-bold text-ink-primary md:text-lg">
            雞婆鄰里互助會
          </span>
        </Link>
      </header>

      {/* 頁面內容（登入/註冊表單） — flex-1 填滿中間空間 */}
      <main className="flex flex-1">{children}</main>

      {/* ── Footer（共用完整版） ── */}
      <Footer />
    </div>
  )
}

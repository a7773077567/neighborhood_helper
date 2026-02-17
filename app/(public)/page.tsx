import { Hexagon, Mic, Trophy, Users } from 'lucide-react'
import Link from 'next/link'
import { MarqueeSection } from '@/components/features/landing/marquee-section'

/**
 * Landing Page — 首頁（Server Component）
 *
 * 對照 Pencil 設計：桌面版 OQH93 / 手機版 MIbbS
 *
 * 結構（4 個區塊，由上到下）：
 *   ┌────────────────────────────────────┐
 *   │  Hero — 標語 + CTA 按鈕            │  bg: 統一底色
 *   ├────────────────────────────────────┤
 *   │  Marquee — 3 列跑馬燈              │  bg: 統一底色
 *   ├────────────────────────────────────┤
 *   │  Features — 我們正在做的事          │  bg: 統一底色
 *   ├────────────────────────────────────┤
 *   │  CTA — 準備好加入了嗎？             │  bg: 統一底色
 *   └────────────────────────────────────┘
 *
 * Header 和 Footer 由 (public)/layout.tsx 的 Layout 自動包裹。
 */

/* ─────────────────────────────────────────────
 * Features 卡片資料
 *
 * 對照 Pencil 節點 eiukF 內的 3 張卡片：
 *   Card 1 (XLpE0): mic icon, 橘色
 *   Card 2 (NduIW): trophy icon, 暖黃色
 *   Card 3 (6xGzp): users icon, 深橘色
 * ───────────────────────────────────────────── */
const FEATURES = [
  {
    icon: Mic,
    iconBg: 'bg-brand-orange',
    /** 白色 icon（在深色底上） */
    iconColor: 'text-white',
    title: '挖掘在地講者',
    description: '每個人的經驗都是養分。踩過的坑、學到的事，我們想讓這些故事被更多人聽見。',
  },
  {
    icon: Trophy,
    iconBg: 'bg-brand-yellow',
    /** 黑色 icon（在亮黃底上） */
    iconColor: 'text-ink-primary',
    title: '遊戲化參與',
    description: '參加活動、分享筆記、幫忙場佈——每一次參與都會被記住，不只是簽到而已。',
  },
  {
    icon: Users,
    iconBg: 'bg-brand-deep-orange',
    iconColor: 'text-white',
    title: '串連社群',
    description: '台南有好多不同社群，各自精彩。串在一起，可能性就完全不一樣了。',
  },
] as const

/* ─────────────────────────────────────────────
 * Landing Page
 * ───────────────────────────────────────────── */
export default function Home(): React.ReactElement {
  return (
    <>
      {/* ══════════════════════════════════════
       * Hero Section
       *
       * 對照 Pencil 節點 nSuDK：
       *   padding: [160, 24] → py-16 md:py-40 px-4 md:px-6
       *   內容寬度: 640px → max-w-[640px]
       *   文字組 gap: 16px → gap-4
       *   文字組與按鈕組 gap: 40px → gap-10
       * ══════════════════════════════════════ */}
      <section className="flex flex-col items-center px-4 py-16 md:px-6 md:py-40">
        <div className="flex max-w-[640px] flex-col items-center gap-10">
          {/* 文字組：badge + 標題 + 副標題 */}
          <div className="flex flex-col items-center gap-4">
            {/* 品牌 Badge — 平面預設，hover 浮起 */}
            <div className="flex items-center gap-2 rounded-full border-2 border-ink-primary bg-brand-orange px-4 py-2 transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-brutal-sm">
              <Hexagon className="size-5 text-white" />
              <span className="font-mono text-[13px] font-semibold text-white">
                GDG Tainan 社群平台
              </span>
            </div>

            {/* 主標題 */}
            <h1 className="text-center font-mono text-3xl font-bold text-ink-primary md:text-[40px] md:leading-tight">
              讓科技成為這片土地的養分
            </h1>

            {/* 副標題 */}
            <p className="max-w-[520px] text-center text-sm leading-relaxed text-ink-body md:text-base md:leading-[1.6]">
              挖掘在地講者、鼓勵社群參與、串連台南社群。
              <br />
              一場小聚、一次分享。
              <br />
              累積起來就是改變的開始。
            </p>
          </div>

          {/* CTA 按鈕組 — 平面預設，hover 浮起 */}
          <div className="flex items-center gap-3">
            <Link
              href="/events"
              className="flex h-12 items-center justify-center rounded-lg border-2 border-ink-primary bg-brand-orange px-6 font-mono text-sm font-semibold text-white transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-brutal active:translate-x-0.5 active:translate-y-0.5 active:shadow-none md:text-base"
            >
              瀏覽活動
            </Link>
            <Link
              href="/about"
              className="flex h-12 items-center justify-center rounded-lg border-2 border-ink-primary bg-surface-warm px-6 font-mono text-sm font-semibold text-ink-primary transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-brutal active:translate-x-0.5 active:translate-y-0.5 active:shadow-none md:text-base"
            >
              了解更多
            </Link>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
       * Marquee Section（Client Component）
       *
       * 對照 Pencil 節點 hHfa3 / lSnbW
       * 動態行為見 design.md §7
       * ══════════════════════════════════════ */}
      <MarqueeSection />

      {/* ══════════════════════════════════════
       * Features Section
       *
       * 對照 Pencil 節點 eiukF：
       *   bg: 統一底色（不額外設背景）
       *   padding: [120, 80] → py-16 md:py-[120px] px-4 md:px-20
       *   gap: 40 → gap-10
       * ══════════════════════════════════════ */}
      <section className="px-4 py-16 md:px-20 md:py-[120px]">
        <div className="mx-auto flex max-w-5xl flex-col items-center gap-10">
          {/* 區塊標題 */}
          <h2 className="text-center font-mono text-2xl font-bold text-ink-primary md:text-[28px]">
            我們正在做的事
          </h2>

          {/* Feature 卡片 — 桌面 3 欄、手機堆疊 */}
          <div className="grid w-full grid-cols-1 gap-4 md:grid-cols-3 md:gap-6">
            {FEATURES.map(feature => (
              <div
                key={feature.title}
                className="flex flex-col gap-3 rounded-lg border-2 border-ink-primary bg-surface-warm p-6 shadow-brutal md:p-7"
              >
                {/* Icon 方塊：48x48 */}
                <div
                  className={`flex size-12 items-center justify-center rounded-lg border-2 border-ink-primary ${feature.iconBg}`}
                >
                  <feature.icon className={`size-6 ${feature.iconColor}`} />
                </div>
                {/* 卡片標題 */}
                <h3 className="font-mono text-lg font-bold text-ink-primary">
                  {feature.title}
                </h3>
                {/* 卡片描述 */}
                <p className="text-sm leading-[1.6] text-ink-body">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
       * CTA Section
       *
       * 對照 Pencil 節點 HdZYG：
       *   bg: 統一底色（不額外設背景）
       *   padding: [120, 80] → py-16 md:py-[120px] px-4 md:px-20
       *   gap: 20 → gap-5
       * ══════════════════════════════════════ */}
      <section className="flex flex-col items-center gap-5 px-4 py-16 md:px-20 md:py-[120px]">
        <h2 className="text-center font-mono text-2xl font-bold text-ink-primary md:text-[28px]">
          準備好加入了嗎？
        </h2>
        <p className="text-center text-sm text-ink-body md:text-base">
          和台南的開發者們一起，打造更好的社群。
        </p>
        <Link
          href="/events"
          className="flex h-12 items-center justify-center rounded-lg border-2 border-ink-primary bg-brand-orange px-8 font-mono text-sm font-semibold text-white transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-brutal active:translate-x-0.5 active:translate-y-0.5 active:shadow-none md:text-base"
        >
          立即瀏覽活動
        </Link>
      </section>
    </>
  )
}

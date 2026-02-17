import { Bird } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { MobileNav } from './mobile-nav'
import { UserMenu } from './user-menu'

/* ─────────────────────────────────────────────
 * 型別定義
 * ───────────────────────────────────────────── */

/** Header 的三種變體，對應不同的 Route Group */
type HeaderVariant = 'public' | 'dashboard' | 'admin'

/** 單一導覽項目的資料結構 */
interface NavItem {
  label: string // 顯示文字（如「活動」）
  href: string // 連結目標（如「/events」）
  highlight?: boolean // 是否用橘色強調（如「管理後台」）
}

/** Header 元件接受的 props */
interface HeaderProps {
  variant?: HeaderVariant // 預設為 'public'
}

/* ─────────────────────────────────────────────
 * 導覽項目設定（桌面版）
 *
 * Record<K, V> 是 TypeScript 內建的泛型：
 *   Key = HeaderVariant（'public' | 'dashboard' | 'admin'）
 *   Value = NavItem[]（導覽項目陣列）
 * ───────────────────────────────────────────── */
const NAV_ITEMS: Record<HeaderVariant, NavItem[]> = {
  public: [
    { label: '活動', href: '/events' },
    { label: '排行榜', href: '/leaderboard' },
  ],
  dashboard: [
    { label: '活動', href: '/events' },
    { label: '排行榜', href: '/leaderboard' },
    { label: '我的活動', href: '/my-events' },
  ],
  admin: [
    { label: '活動', href: '/events' },
    { label: '排行榜', href: '/leaderboard' },
    { label: '我的活動', href: '/my-events' },
    { label: '管理後台', href: '/admin', highlight: true },
  ],
}

/* ─────────────────────────────────────────────
 * Header 元件（Server Component）
 *
 * 結構對照 Pencil 設計：
 *
 * 手機版（< 768px）：
 *   [漢堡] [Logo]  ................  [登入/頭像]
 *
 * 桌面版（≥ 768px）：
 *   [Logo]  [活動] [排行榜] ...  ....  [登入/頭像]
 *
 * MobileNav（Client Component）嵌在 Header（Server Component）裡，
 * 只有 MobileNav 的 JS 會被送到瀏覽器。
 * ───────────────────────────────────────────── */
export function Header({ variant = 'public' }: HeaderProps): React.ReactElement {
  const navItems = NAV_ITEMS[variant]
  const isLoggedIn = variant !== 'public'

  return (
    <header className="flex h-14 items-center justify-between border-b-2 border-ink-primary bg-surface-warm px-4 md:h-16 md:px-6">
      {/*
       * 響應式尺寸（對應 Pencil 設計）：
       *   h-14 → 手機版 56px    md:h-16 → 桌面版 64px
       *   px-4 → 手機版 16px    md:px-6 → 桌面版 24px
       */}

      {/* ── 左側群組：漢堡 + Logo + 導覽 ── */}
      <div className="flex items-center gap-2 md:gap-8">
        {/*
         * gap-2 → 手機版：漢堡和 Logo 間距 8px
         * md:gap-8 → 桌面版：Logo 和導覽間距 32px
         */}

        {/* 手機版漢堡選單（含 Sheet 側邊面板） — 桌面版自動隱藏 */}
        <MobileNav variant={variant} />

        {/* Logo */}
        <Link href="/" className="flex items-center gap-1.5 md:gap-2">
          <Bird className="size-6 text-brand-orange md:size-7" />
          <span className="font-mono text-base font-bold text-ink-primary md:text-lg">
            雞婆鄰里互助會
          </span>
          {/*
           * 響應式尺寸：
           *   size-6 → 手機 24px    md:size-7 → 桌面 28px
           *   text-base → 手機 16px  md:text-lg → 桌面 18px
           */}
        </Link>

        {/* 桌面版導覽列 — 手機版隱藏 */}
        <nav className="hidden items-center gap-6 md:flex">
          {navItems.map(item => (
            <Link
              key={item.href}
              href={item.href}
              className={
                item.highlight
                  ? 'text-sm font-semibold text-brand-orange'
                  : 'text-sm font-medium text-ink-secondary hover:text-ink-primary'
              }
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>

      {/* ── 右側群組：登入 / 頭像 ── */}
      <div className="flex items-center">
        {isLoggedIn ? (
          /* 已登入 → 使用者選單（頭像 + 下拉） */
          <UserMenu />
        ) : (
          /* 未登入 → 登入按鈕 */
          <Link href="/login">
            {/* 登入按鈕 — 平面預設，hover 浮起 */}
            <Button
              size="sm"
              className="border-2 border-ink-primary font-mono text-xs font-semibold transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-brutal-sm active:translate-x-0.5 active:translate-y-0.5 active:shadow-none md:text-sm md:hover:shadow-brutal"
            >
              登入
            </Button>
          </Link>
        )}
      </div>
    </header>
  )
}

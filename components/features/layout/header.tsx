import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { auth } from '@/lib/auth' // 【改造】新增：讀取 session
import { MobileNav } from './mobile-nav'
import { UserMenu } from './user-menu'

/* ─────────────────────────────────────────────
 * 型別定義
 * ───────────────────────────────────────────── */

/** 單一導覽項目的資料結構 */
interface NavItem {
  label: string
  href: string
  highlight?: boolean
}

// 【改造】移除了 HeaderVariant、HeaderProps
// Header 不再接收 variant prop，改用 session 自動判斷

/* ─────────────────────────────────────────────
 * Header 元件（Async Server Component）
 *
 * 【改造重點】
 * 原本：Layout 傳 variant="public" | "dashboard" | "admin"
 * 現在：Header 內部用 await auth() 讀取 session 自動判斷
 *
 * session === null           → 未登入（顯示登入按鈕）
 * session.user.role === MEMBER → 已登入（顯示 UserMenu）
 * session.user.role === ADMIN  → 管理員（多顯示管理後台）
 *
 * MobileNav 仍是 Client Component，無法直接用 auth()，
 * 所以 Header 計算出 variant 再傳給它。
 * ───────────────────────────────────────────── */
export async function Header(): Promise<React.ReactElement> {
  // 【改造】在 Server Component 直接查 DB 讀取 session
  // 不需要 API call、不需要 useEffect、不需要 loading state
  const session = await auth()

  const isAdmin = session?.user?.role === 'ADMIN'

  // 【改造】根據 session 動態建立導覽項目（取代原本的 Record lookup）
  const navItems: NavItem[] = [
    { label: '活動', href: '/events' },
    { label: '排行榜', href: '/leaderboard' },
    ...(session ? [{ label: '我的活動', href: '/my-events' }] : []),
    ...(isAdmin ? [{ label: '管理後台', href: '/admin', highlight: true }] : []),
  ]

  // 【改造】計算 MobileNav 的 variant（MobileNav 是 Client Component，不能直接用 auth()）
  const mobileVariant = !session
    ? 'public'
    : isAdmin
      ? 'admin'
      : 'dashboard'

  return (
    <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b-2 border-ink-primary bg-surface-header px-4 md:h-16 md:px-6">
      {/* ── 左側群組：漢堡 + Logo + 導覽 ── */}
      <div className="flex items-center gap-2 md:gap-8">
        {/* 手機版漢堡選單 — 桌面版自動隱藏 */}
        <MobileNav variant={mobileVariant} />

        {/* Logo */}
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
        {/* 【改造】用 session 判斷，並傳入真實使用者資料（含大頭照） */}
        {session
          ? (
              <UserMenu
                name={session.user.name ?? '使用者'}
                email={session.user.email ?? ''}
                image={session.user.image}
              />
            )
          : (
              <Link href="/login">
                <Button
                  size="sm"
                  className="cursor-pointer border-2 border-ink-primary font-mono text-xs font-semibold shadow-brutal-sm transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-brutal active:translate-x-0.5 active:translate-y-0.5 active:shadow-none md:text-sm md:shadow-brutal md:hover:shadow-brutal-hover"
                >
                  登入
                </Button>
              </Link>
            )}
      </div>
    </header>
  )
}

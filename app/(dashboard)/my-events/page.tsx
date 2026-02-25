// ============================================================
// 我的活動頁面（Server Component）
// ============================================================
//
// 【關鍵概念】
// 1. 認證保護（雙重防線）
//    - middleware.ts：cookie 層檢查，未登入直接 redirect 到 /login
//    - 這裡再用 auth() 驗證 session 有效性（cookie 存在但 session 過期的情況）
//
// 2. URL Search Params 做 Tab 狀態
//    ?tab=upcoming（預設） / ?tab=past
//    與公開活動列表頁（/events）同樣的 pattern
//
// 3. 查詢邏輯
//    從 Registration 出發（不是從 Event），因為我們要的是「這個使用者報名的活動」
//    即將參加：CONFIRMED + 活動未結束 + PUBLISHED，按 startTime 升序
//    過去參加：CONFIRMED + (活動已結束 OR ENDED)，按 startTime 降序
//
// 4. 報名人數
//    用 event._count.registrations 帶出，傳給 EventCard
// ============================================================

import { CalendarX } from 'lucide-react'
import Link from 'next/link'
import { redirect } from 'next/navigation'

import { EventCard } from '@/components/features/events/event-card'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db/prisma'

// ── Tab 設定 ──────────────────────────────────────────

type Tab = 'upcoming' | 'past'

const TABS: { key: Tab, label: string }[] = [
  { key: 'upcoming', label: '即將參加' },
  { key: 'past', label: '過去參加' },
]

// ── 頁面元件 ──────────────────────────────────────────

export default async function MyEventsPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>
}): Promise<React.ReactElement> {
  // 1. 認證檢查（defense in depth，middleware 已做第一層）
  const session = await auth()
  if (!session)
    redirect('/login')

  const userId = session.user.id

  // 2. 解析 Tab
  const { tab } = await searchParams
  const activeTab: Tab = tab === 'past' ? 'past' : 'upcoming'
  const now = new Date()

  // 3. 查詢使用者報名的活動
  const registrations = activeTab === 'upcoming'
    ? await prisma.registration.findMany({
        where: {
          userId,
          status: 'CONFIRMED',
          event: {
            status: 'PUBLISHED',
            startTime: { gt: now },
          },
        },
        include: {
          event: {
            include: {
              _count: {
                select: {
                  registrations: { where: { status: 'CONFIRMED' } },
                },
              },
            },
          },
        },
        orderBy: { event: { startTime: 'asc' } },
      })
    : await prisma.registration.findMany({
        where: {
          userId,
          status: 'CONFIRMED',
          event: {
            OR: [
              { status: 'ENDED' },
              { status: 'PUBLISHED', startTime: { lte: now } },
            ],
          },
        },
        include: {
          event: {
            include: {
              _count: {
                select: {
                  registrations: { where: { status: 'CONFIRMED' } },
                },
              },
            },
          },
        },
        orderBy: { event: { startTime: 'desc' } },
      })

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 md:px-12 md:py-10">
      {/* ── 標題 ── */}
      <h1 className="font-mono text-2xl font-bold text-ink-primary md:text-[28px]">
        我的活動
      </h1>

      {/* ── Tabs ── */}
      <div className="mt-5 flex border-b-2 border-ink-primary md:mt-7">
        {TABS.map(({ key, label }) => {
          const isActive = key === activeTab
          return (
            <Link
              key={key}
              href={`/my-events${key === 'upcoming' ? '' : '?tab=past'}`}
              className={`rounded-t-lg px-5 py-2.5 font-mono text-sm font-semibold transition-colors md:px-6 ${
                isActive
                  ? 'border-2 border-b-0 border-ink-primary bg-brand-orange text-white'
                  : 'border-2 border-ink-primary bg-surface-header text-ink-secondary hover:bg-surface-muted'
              }`}
            >
              {label}
            </Link>
          )
        })}
      </div>

      {/* ── 活動列表 或 空狀態 ── */}
      {registrations.length === 0
        ? (
            <div className="mx-auto mt-12 flex max-w-md flex-col items-center gap-4 rounded-lg border border-[#DDDDDD] bg-surface-warm px-10 py-10 text-center">
              <div className="flex size-16 items-center justify-center rounded-full border-2 border-brand-orange bg-surface-light-orange">
                <CalendarX className="size-7 text-brand-orange" />
              </div>
              <p className="font-mono text-base font-bold text-ink-primary">
                {activeTab === 'upcoming'
                  ? '目前沒有即將參加的活動'
                  : '還沒有過去參加的活動'}
              </p>
              <p className="text-sm leading-relaxed text-ink-body">
                {activeTab === 'upcoming'
                  ? '報名活動後會出現在這裡。\n去探索活動吧！'
                  : '參加過的活動會出現在這裡。'}
              </p>
              {activeTab === 'upcoming' && (
                <Link
                  href="/events"
                  className="mt-2 inline-flex items-center rounded-lg border-2 border-ink-primary bg-brand-orange px-5 py-2 font-mono text-sm font-bold text-white shadow-brutal-sm transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-brutal active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
                >
                  探索活動
                </Link>
              )}
            </div>
          )
        : (
            <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6 lg:grid-cols-3">
              {registrations.map(({ event }) => (
                <EventCard
                  key={event.id}
                  event={event}
                  registrationCount={event._count.registrations}
                />
              ))}
            </div>
          )}
    </div>
  )
}

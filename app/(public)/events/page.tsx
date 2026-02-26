// ============================================================
// 公開活動列表頁（Server Component）
// ============================================================
//
// 【關鍵概念】
// 1. URL Search Params 做 Tab 狀態
//    用 ?tab=upcoming / ?tab=past 管理，不用 React state
//    → Server Component 直接讀 searchParams，不需 'use client'
//    → URL 可分享、可 back/forward、SEO 友善
//
// 2. Server Component 直接查 DB
//    async function → await prisma.event.findMany()
//    不需要 API route，不需要 useEffect / fetch
//
// 3. Tab 用 <Link> 而非 <button>
//    切換 Tab 其實是導航到不同 URL（?tab=upcoming / ?tab=past）
//    Next.js 會做 soft navigation（不會整頁刷新）
//
// 4. 篩選邏輯（from design.md）
//    即將舉辦：PUBLISHED + endTime > now，按 startTime 升序
//    已結束：  ENDED 或 (PUBLISHED + endTime <= now)，按 startTime 降序
// ============================================================

import { CalendarX } from 'lucide-react'
import Link from 'next/link'

import { EventCard } from '@/components/features/events/event-card'
import { prisma } from '@/lib/db/prisma'

// ── Tab 設定 ──────────────────────────────────────────

type Tab = 'upcoming' | 'past'

const TABS: { key: Tab, label: string }[] = [
  { key: 'upcoming', label: '即將舉辦' },
  { key: 'past', label: '已結束' },
]

// ── 頁面元件 ──────────────────────────────────────────

export default async function EventsPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>
}): Promise<React.ReactElement> {
  const { tab } = await searchParams
  const activeTab: Tab = tab === 'past' ? 'past' : 'upcoming'
  const now = new Date()

  // ── 根據 Tab 查詢不同資料 ──
  // 👈 加上 include _count 查 CONFIRMED 報名人數，與活動詳情頁同 pattern
  const events = activeTab === 'upcoming'
    ? await prisma.event.findMany({
        where: {
          status: 'PUBLISHED',
          endTime: { gt: now },
        },
        orderBy: { startTime: 'asc' },
        include: {
          _count: {
            select: {
              registrations: { where: { status: 'CONFIRMED' } },
            },
          },
        },
      })
    : await prisma.event.findMany({
        where: {
          OR: [
            { status: 'ENDED' },
            { status: 'PUBLISHED', endTime: { lte: now } },
          ],
        },
        orderBy: { startTime: 'desc' },
        include: {
          _count: {
            select: {
              registrations: { where: { status: 'CONFIRMED' } },
            },
          },
        },
      })

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 md:px-12 md:py-10">
      {/* ── 標題 ── */}
      <h1 className="font-mono text-2xl font-bold text-ink-primary md:text-[32px]">
        探索活動
      </h1>

      {/* ── Tabs ── */}
      <div className="mt-5 flex border-b-2 border-ink-primary md:mt-7">
        {TABS.map(({ key, label }) => {
          const isActive = key === activeTab
          return (
            <Link
              key={key}
              href={`/events${key === 'upcoming' ? '' : '?tab=past'}`}
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
      {events.length === 0
        ? (
            <div className="mx-auto mt-12 flex max-w-md flex-col items-center gap-4 rounded-lg border border-[#DDDDDD] bg-surface-warm px-10 py-10 text-center">
              <div className="flex size-16 items-center justify-center rounded-full border-2 border-brand-orange bg-surface-light-orange">
                <CalendarX className="size-7 text-brand-orange" />
              </div>
              <p className="font-mono text-base font-bold text-ink-primary">
                {activeTab === 'upcoming'
                  ? '目前沒有即將舉辦的活動'
                  : '還沒有已結束的活動'}
              </p>
              <p className="text-sm leading-relaxed text-ink-body">
                {activeTab === 'upcoming'
                  ? '我們正在策劃新活動，敬請期待！\n你也可以查看已結束的活動紀錄。'
                  : '活動結束後會出現在這裡。'}
              </p>
            </div>
          )
        : (
            <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6 lg:grid-cols-3">
              {events.map(event => (
                <EventCard
                  key={event.id}
                  event={event}
                  registrationCount={event._count.registrations}  // 👈 傳入真實報名人數
                />
              ))}
            </div>
          )}
    </div>
  )
}

// ============================================================
// EventCard — 公開活動列表用的卡片元件（Server Component）
// ============================================================
//
// 【關鍵決策】
// 1. 不加 'use client' — 純展示元件，不需要 state 或 event handler
//    點擊導航用 <Link> 包整張卡片，而非 onClick
//    → 瀏覽器端零 JS bundle
//
// 2. Props 型別直接用 Prisma 的 Event — schema 改了型別自動跟著變
//    只多加一個 registrationCount（目前預設 0，報名系統實作後傳入）
//
// 3. 響應式用 Tailwind md: breakpoint 切換
//    桌面 vs 手機差異只在字級、padding、圖片高度、按鈕大小
//    不需要分成兩個元件
//
// 4. Progress Bar 是自訂的 Neobrutalism 元件（非 shadcn/ui）
//    外框：rounded-sm, border-2, shadow-[2px_2px], bg-[#E8E3DD], p-0.5
//    內部 fill：bg-brand-orange, 寬度用 inline style 動態算百分比
// ============================================================

import type { Event } from '@/app/generated/prisma/client'
import dayjs from 'dayjs'
import { ArrowRight, Calendar, MapPin, Megaphone, Users } from 'lucide-react'
import Link from 'next/link'

// ── 中文星期對照表 ─────────────────────────────────────
// 比載入 dayjs locale 套件輕量得多
const WEEKDAYS = ['日', '一', '二', '三', '四', '五', '六'] as const

function formatEventDate(date: Date): string {
  const d = dayjs(date)
  const weekday = WEEKDAYS[d.day()]
  return `${d.format('M/DD')} (${weekday}) ${d.format('HH:mm')}`
}

// ── Props ──────────────────────────────────────────────

type EventCardProps = {
  event: Event
  /** 目前報名人數（報名系統尚未實作，預設 0） */
  registrationCount?: number
}

// ── 元件 ──────────────────────────────────────────────

export function EventCard({ event, registrationCount = 0 }: EventCardProps): React.ReactElement {
  const percentage = event.capacity > 0
    ? Math.min((registrationCount / event.capacity) * 100, 100)
    : 0

  return (
    <Link
      href={`/events/${event.id}`}
      className="group block rounded-lg border-2 border-ink-primary bg-surface-header shadow-brutal transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-brutal-hover active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
    >
      {/* ── Image Wrapper ── */}
      <div className="relative h-[140px] rounded-t-[6px] border-b-2 border-ink-primary bg-[#E8E3DD] md:h-[180px]">
        {/* 徵求講者 Badge */}
        {event.seekingSpeaker && (
          <div className="px-2.5 pt-2 md:px-3 md:pt-2.5">
            <span className="inline-flex items-center gap-1 rounded border-2 border-ink-primary bg-brand-yellow px-3 py-1 shadow-[2px_2px_0px_#1A1A1A] md:gap-1.5 md:px-3.5 md:py-1.5">
              <Megaphone className="size-3 text-ink-primary md:size-3.5" />
              <span className="font-mono text-[11px] font-bold text-ink-primary md:text-xs">
                徵求講者！
              </span>
            </span>
          </div>
        )}

        {/* 圖片 placeholder（未來換成 Next/Image） */}
        <div className="absolute inset-0 flex items-center justify-center">
          <svg
            className="size-7 text-[#BBBBBB] md:size-8"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
            <circle cx="9" cy="9" r="2" />
            <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
          </svg>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="flex flex-col gap-2 p-3 pb-3.5 md:gap-2.5 md:px-5 md:pb-4 md:pt-3.5">
        {/* 標題 */}
        <h3 className="truncate text-base font-bold text-ink-primary md:text-lg">
          {event.title}
        </h3>

        {/* Bottom Row：Meta + Arrow Button */}
        <div className="flex items-end gap-5 md:gap-10">
          {/* Meta 資訊 */}
          <div className="flex min-w-0 flex-1 flex-col gap-1.5">
            {/* 日期 */}
            <div className="flex items-center gap-1.5">
              <Calendar className="size-3.5 shrink-0 text-ink-secondary" />
              <span className="truncate text-[13px] text-ink-secondary">
                {formatEventDate(event.startTime)}
              </span>
            </div>

            {/* 地點 */}
            <div className="flex items-center gap-1.5">
              <MapPin className="size-3.5 shrink-0 text-ink-secondary" />
              <span className="truncate text-[13px] text-ink-secondary">
                {event.location}
              </span>
            </div>

            {/* 報名進度 */}
            <div className="flex items-center gap-2">
              <Users className="size-3.5 shrink-0 text-ink-secondary" />

              {/* Neobrutalism Progress Bar */}
              <div className="h-2.5 min-w-0 flex-1 rounded-sm border-2 border-ink-primary bg-[#E8E3DD] p-0.5 shadow-[2px_2px_0px_#1A1A1A] md:h-3">
                <div
                  className="h-full rounded-[1px] bg-brand-orange transition-all"
                  style={{ width: `${percentage}%` }}
                />
              </div>

              <span className="shrink-0 font-mono text-[11px] font-bold text-ink-secondary md:text-xs">
                {registrationCount}
                /
                {event.capacity}
              </span>
            </div>
          </div>

          {/* Arrow Button */}
          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg border-2 border-ink-primary bg-brand-orange shadow-[3px_3px_0px_#1A1A1A] transition-all group-hover:-translate-x-0.5 group-hover:-translate-y-0.5 group-hover:shadow-brutal md:size-10">
            <ArrowRight className="size-[18px] text-white md:size-5" />
          </div>
        </div>
      </div>
    </Link>
  )
}

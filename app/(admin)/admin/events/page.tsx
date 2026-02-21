// ============================================================
// Admin 活動管理列表頁（Server Component）
// ============================================================
//
// 【關鍵概念】
// 1. 這是 Server Component — 不需要 'use client'
//    可以直接 await prisma 查 DB，不需要 useEffect / fetch
//
// 2. 資料在伺服器端取得、渲染成 HTML，瀏覽器直接收到結果
//    → 不會有 loading 閃爍、不會暴露 DB 查詢給前端
//
// 3. 狀態操作按鈕用 <form action={...}> 觸發 Server Action
//    → Server Component 不能有 onClick（那是瀏覽器行為）
//    → 但 <form action> 是 HTML 原生機制，伺服器端可用
//    → Server Action 用 .bind(null, arg) 預先綁定參數
//
// 4. 條件渲染：根據 event.status 顯示不同的 badge 和按鈕
// ============================================================

import type { EventStatus } from '@/app/generated/prisma/enums'
import dayjs from 'dayjs'
import { Calendar, MapPin, Plus, Users } from 'lucide-react'
import Link from 'next/link'

import { Button } from '@/components/ui/button'
import { prisma } from '@/lib/db/prisma'

import { updateEventStatus } from './actions'

// ── 狀態 Badge 設定 ─────────────────────────────────────

/**
 * 每個 EventStatus 對應的 badge 樣式和文字
 *
 * 為什麼用 Record<EventStatus, ...> 而不是 switch？
 * - 所有狀態一目了然
 * - 新增 EventStatus 時 TypeScript 會強制你補上對應設定
 */
const STATUS_CONFIG: Record<
  EventStatus,
  { label: string, className: string }
> = {
  PUBLISHED: {
    label: '已發布',
    className:
      'border-[#2E7D32] bg-[#E8F5E9] text-[#2E7D32]',
  },
  DRAFT: {
    label: '草稿',
    className:
      'border-[#E65100] bg-[#FFF3E0] text-[#E65100]',
  },
  ENDED: {
    label: '已結束',
    className:
      'border-[#999999] bg-[#F5F5F5] text-[#999999]',
  },
  CANCELLED: {
    label: '已取消',
    className:
      'border-[#999999] bg-[#F5F5F5] text-[#999999]',
  },
}

// ── 頁面元件 ─────────────────────────────────────────────

export default async function AdminEventsPage(): Promise<React.ReactElement> {
  // Server Component 直接查 DB — 最新建立的排最前面
  const events = await prisma.event.findMany({
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 md:px-8 md:py-10">
      {/* ── 標題列 ── */}
      <div className="flex items-center justify-between">
        <h1 className="font-mono text-2xl font-bold text-ink-primary md:text-[28px]">
          活動管理
        </h1>
        <Link href="/admin/events/new">
          <Button className="cursor-pointer border-2 border-ink-primary font-mono text-sm font-semibold shadow-brutal transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-brutal-hover active:translate-x-0.5 active:translate-y-0.5 active:shadow-none">
            <Plus className="size-4" />
            建立活動
          </Button>
        </Link>
      </div>

      {/* ── 活動列表 ── */}
      <div className="mt-6 flex flex-col gap-4">
        {events.length === 0 ? (
          <div className="rounded-lg border-2 border-dashed border-ink-primary/30 px-6 py-16 text-center">
            <p className="font-mono text-lg font-semibold text-ink-secondary">
              還沒有任何活動
            </p>
            <p className="mt-2 text-sm text-ink-body">
              點擊「建立活動」開始建立第一個活動
            </p>
          </div>
        ) : (
          events.map((event) => {
            const config = STATUS_CONFIG[event.status]
            const isInactive
              = event.status === 'ENDED' || event.status === 'CANCELLED'

            // 格式化日期：03/15 14:00-17:00
            const dateStr = `${dayjs(event.startTime).format('MM/DD HH:mm')}-${dayjs(event.endTime).format('HH:mm')}`

            return (
              <div
                key={event.id}
                className={`rounded-lg border-2 bg-surface-header ${
                  isInactive
                    ? 'border-[#CCCCCC] opacity-70'
                    : 'border-ink-primary shadow-brutal'
                }`}
              >
                <div className="flex flex-col gap-4 p-4 md:flex-row md:items-center md:gap-6 md:p-5 md:px-6">
                  {/* ── 活動資訊 ── */}
                  <div className="min-w-0 flex-1 space-y-2">
                    {/* 標題 + Badge */}
                    <div className="flex flex-wrap items-center gap-3">
                      <h2
                        className={`text-base font-bold md:text-[17px] ${
                          isInactive ? 'text-ink-secondary' : 'text-ink-primary'
                        }`}
                      >
                        {event.title}
                      </h2>
                      {config && (
                        <span
                          className={`inline-flex items-center rounded-full border-[1.5px] px-3 py-0.5 font-mono text-[11px] font-semibold ${config.className}`}
                        >
                          {config.label}
                        </span>
                      )}
                    </div>

                    {/* Meta 資訊 — 桌面水平排列，手機垂直堆疊 */}
                    <div className="flex flex-col gap-1.5 md:flex-row md:items-center md:gap-6">
                      <div className="flex items-center gap-1.5">
                        <Calendar
                          className={`size-4 ${isInactive ? 'text-[#999999]' : 'text-ink-secondary'}`}
                        />
                        <span
                          className={`text-sm ${isInactive ? 'text-[#999999]' : 'text-ink-body'}`}
                        >
                          {dateStr}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <MapPin
                          className={`size-4 ${isInactive ? 'text-[#999999]' : 'text-ink-secondary'}`}
                        />
                        <span
                          className={`text-sm ${isInactive ? 'text-[#999999]' : 'text-ink-body'}`}
                        >
                          {event.location}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Users
                          className={`size-4 ${isInactive ? 'text-[#999999]' : 'text-ink-secondary'}`}
                        />
                        <span
                          className={`text-sm ${isInactive ? 'text-[#999999]' : 'text-ink-body'}`}
                        >
                          0/
                          {event.capacity}
                          {' '}
                          人
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* ── 操作按鈕 ── */}
                  {!isInactive && (
                    <div className="flex items-center gap-2.5">
                      {/* 編輯按鈕 — 所有活動狀態都可以 */}
                      <Link href={`/admin/events/${event.id}/edit`}>
                        <Button
                          variant="outline"
                          size="sm"
                          className="cursor-pointer border-2 border-ink-primary bg-surface-warm font-mono text-[13px] font-semibold shadow-brutal-sm transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-brutal active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
                        >
                          編輯
                        </Button>
                      </Link>

                      {/* 狀態操作按鈕 — 根據狀態顯示不同按鈕 */}
                      {event.status === 'PUBLISHED' && (
                        <form
                          action={updateEventStatus.bind(
                            null,
                            event.id,
                            'ENDED',
                          )}
                        >
                          <Button
                            type="submit"
                            size="sm"
                            className="cursor-pointer border-2 border-[#E65100] bg-[#FFF3E0] font-mono text-[13px] font-semibold text-[#E65100] shadow-[3px_3px_0px_#E65100] transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[4px_4px_0px_#E65100] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
                          >
                            結束
                          </Button>
                        </form>
                      )}

                      {event.status === 'DRAFT' && (
                        <form
                          action={updateEventStatus.bind(
                            null,
                            event.id,
                            'PUBLISHED',
                          )}
                        >
                          <Button
                            type="submit"
                            size="sm"
                            className="cursor-pointer border-2 border-ink-primary bg-brand-orange font-mono text-[13px] font-semibold text-white shadow-brutal-sm transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-brutal active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
                          >
                            發布
                          </Button>
                        </form>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}

// ============================================================
// Admin 報名名單頁面（Server Component）
// ============================================================
//
// 【關鍵概念】
// 1. Prisma nested include
//    一次查詢取出 event + registrations + user
//    select 限制 user 只取 name / email（不取敏感資料）
//
// 2. 顯示全部報名記錄（含 CANCELLED）
//    Spec 原寫「只顯示 CONFIRMED」，但設計稿顯示兩種狀態
//    Admin 需要看到取消記錄 → 跟設計稿走，CANCELLED 用淡化樣式
//
// 3. 響應式差異
//    桌面：Avatar + 姓名/Email + 時間 + Badge（水平排列）
//    手機：姓名/Email/時間（垂直堆疊）+ Badge，無 Avatar
// ============================================================

import type { RegistrationStatus } from '@/app/generated/prisma/enums'

import dayjs from 'dayjs'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { prisma } from '@/lib/db/prisma'

// ── Avatar 顏色循環 — Neobrutalism 配色 ──────────────────
// 👈 簡單用 index % length 分配，不需要 hash 算法
const AVATAR_COLORS = ['#FFD23F', '#FF7A3D', '#A8D8EA', '#C2FFD6', '#E8C2FF', '#FFD6C2'] as const

// ── 報名狀態 Badge 設定 ────────────────────────────────────

const REG_STATUS_CONFIG: Record<
  RegistrationStatus,
  { label: string, className: string }
> = {
  CONFIRMED: {
    label: '已報名',
    className: 'bg-[#E8F5E9] text-[#2E7D32]',
  },
  CANCELLED: {
    label: '已取消',
    className: 'bg-[#FFF3E0] text-[#E65100]',
  },
}

// ── 活動狀態 Badge 設定 ────────────────────────────────────

const EVENT_STATUS_DISPLAY: Record<string, { label: string, dotColor: string, bgColor: string, textColor: string }> = {
  PUBLISHED: { label: '報名中', dotColor: 'bg-[#4CAF50]', bgColor: 'bg-[#E8F5E9]', textColor: 'text-[#2E7D32]' },
  ENDED: { label: '已結束', dotColor: 'bg-[#BBBBBB]', bgColor: 'bg-[#F5F0EB]', textColor: 'text-[#888888]' },
  DRAFT: { label: '草稿', dotColor: 'bg-[#E65100]', bgColor: 'bg-[#FFF3E0]', textColor: 'text-[#E65100]' },
  CANCELLED: { label: '已取消', dotColor: 'bg-[#BBBBBB]', bgColor: 'bg-[#F5F0EB]', textColor: 'text-[#888888]' },
}

// ── 中文星期對照表 ─────────────────────────────────────────
const WEEKDAYS = ['日', '一', '二', '三', '四', '五', '六'] as const

// ── 頁面元件 ──────────────────────────────────────────────

export default async function AdminRegistrationsPage({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<React.ReactElement> {
  const { id } = await params

  // 👈 一次查詢取出活動 + 全部報名記錄 + 報名者資料
  const event = await prisma.event.findUnique({
    where: { id },
    include: {
      registrations: {
        include: { user: { select: { name: true, email: true } } },
        orderBy: { createdAt: 'desc' },
      },
    },
  })

  if (!event)
    notFound()

  // 👈 Stats 計算只算 CONFIRMED
  const confirmedCount = event.registrations.filter(r => r.status === 'CONFIRMED').length
  const percentage = event.capacity > 0
    ? Math.round((confirmedCount / event.capacity) * 100)
    : 0

  // 日期格式化
  const d = dayjs(event.startTime)
  const weekday = WEEKDAYS[d.day()]
  const dateDisplay = `${d.format('M/D')} (${weekday}) ${d.format('HH:mm')} - ${dayjs(event.endTime).format('HH:mm')}`

  const statusDisplay = EVENT_STATUS_DISPLAY[event.status]

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 md:px-8 md:py-10">
      {/* ── 返回連結 ── */}
      <Link
        href="/admin/events"
        className="inline-flex items-center gap-1.5 text-sm text-ink-secondary transition-colors hover:text-brand-orange"
      >
        <ArrowLeft className="size-4" />
        返回活動管理
      </Link>

      {/* ── 活動資訊 ── */}
      <div className="mt-5 flex flex-col gap-2">
        <h1 className="font-mono text-xl font-bold text-ink-primary md:text-2xl">
          {event.title}
        </h1>
        <div className="flex flex-wrap items-center gap-2.5">
          {/* 狀態 Badge */}
          {statusDisplay && (
            <span className={`inline-flex items-center gap-1.5 rounded border-[1.5px] border-current px-3 py-0.5 text-xs font-semibold ${statusDisplay.bgColor} ${statusDisplay.textColor}`}>
              <span className={`size-2 rounded-full ${statusDisplay.dotColor}`} />
              {statusDisplay.label}
            </span>
          )}
          {/* 日期 */}
          <span className="text-[13px] text-ink-secondary md:text-sm">{dateDisplay}</span>
        </div>
      </div>

      {/* ── Stats Row ── */}
      <div className="mt-6 grid grid-cols-3 gap-2.5 md:flex md:gap-4">
        {/* 已報名 */}
        <div className="rounded-lg border-2 border-ink-primary bg-surface-header p-3 shadow-[2px_2px_0px_#1A1A1A] md:w-[200px] md:px-5 md:py-4 md:shadow-[3px_3px_0px_#1A1A1A]">
          <p className="text-[11px] text-ink-secondary md:text-[13px]">已報名</p>
          <p className="font-mono text-[22px] font-bold text-ink-primary md:text-[28px]">
            {confirmedCount}
          </p>
        </div>
        {/* 總容量 */}
        <div className="rounded-lg border-2 border-ink-primary bg-surface-header p-3 shadow-[2px_2px_0px_#1A1A1A] md:w-[200px] md:px-5 md:py-4 md:shadow-[3px_3px_0px_#1A1A1A]">
          <p className="text-[11px] text-ink-secondary md:text-[13px]">總容量</p>
          <p className="font-mono text-[22px] font-bold text-ink-primary md:text-[28px]">
            {event.capacity}
          </p>
        </div>
        {/* 報名率 */}
        <div className="rounded-lg border-2 border-ink-primary bg-surface-header p-3 shadow-[2px_2px_0px_#1A1A1A] md:w-[200px] md:px-5 md:py-4 md:shadow-[3px_3px_0px_#1A1A1A]">
          <p className="text-[11px] text-ink-secondary md:text-[13px]">報名率</p>
          <p className="font-mono text-[22px] font-bold text-brand-orange md:text-[28px]">
            {percentage}
            %
          </p>
        </div>
      </div>

      {/* ── 報名名單 ── */}
      <div className="mt-6 flex flex-col gap-3">
        {event.registrations.length === 0
          ? (
              // 👈 空狀態 — spec 要求顯示「尚無人報名此活動」
              <div className="rounded-lg border-2 border-dashed border-ink-primary/30 px-6 py-16 text-center">
                <p className="font-mono text-lg font-semibold text-ink-secondary">
                  尚無人報名此活動
                </p>
                <p className="mt-2 text-sm text-ink-body">
                  報名者資訊會顯示在這裡
                </p>
              </div>
            )
          : (
              event.registrations.map((reg, index) => {
                const config = REG_STATUS_CONFIG[reg.status]
                const isCancelled = reg.status === 'CANCELLED'
                const initial = reg.user.name?.charAt(0) ?? '?'
                const avatarColor = isCancelled ? '#E8E3DD' : AVATAR_COLORS[index % AVATAR_COLORS.length]

                return (
                  <div
                    key={reg.id}
                    className={`rounded-lg border-2 bg-surface-header ${
                      isCancelled
                        ? 'border-[#CCCCCC]' // 👈 取消的報名淡化邊框
                        : 'border-ink-primary shadow-[3px_3px_0px_#1A1A1A]'
                    }`}
                  >
                    {/* 👈 桌面：水平排列（Avatar + Info + Time + Badge） */}
                    {/* 👈 手機：垂直排列（Info + Badge），無 Avatar */}
                    <div className="flex items-center gap-4 p-3.5 px-4 md:gap-5 md:p-4 md:px-5">
                      {/* Avatar — 桌面才顯示 */}
                      <div
                        className={`hidden size-10 shrink-0 items-center justify-center rounded-full border-2 md:flex ${
                          isCancelled ? 'border-[#CCCCCC]' : 'border-ink-primary'
                        }`}
                        style={{ backgroundColor: avatarColor }}
                      >
                        <span className={`text-base font-bold ${isCancelled ? 'text-[#BBBBBB]' : 'text-ink-primary'}`}>
                          {initial}
                        </span>
                      </div>

                      {/* Info */}
                      <div className="min-w-0 flex-1">
                        <p className={`text-[15px] font-bold ${isCancelled ? 'text-[#BBBBBB]' : 'text-ink-primary'}`}>
                          {reg.user.name ?? '未設定姓名'}
                        </p>
                        <p className={`truncate text-[13px] ${isCancelled ? 'text-[#CCCCCC]' : 'text-ink-secondary'}`}>
                          {reg.user.email ?? ''}
                        </p>
                        {/* 報名時間 — 手機版顯示在 Info 下方 */}
                        <p className={`mt-1 text-xs md:hidden ${isCancelled ? 'text-[#CCCCCC]' : 'text-ink-secondary'}`}>
                          報名時間：
                          {dayjs(reg.createdAt).format('M/D HH:mm')}
                        </p>
                      </div>

                      {/* 報名時間 — 桌面版獨立顯示 */}
                      <span className={`hidden shrink-0 text-[13px] md:block ${isCancelled ? 'text-[#BBBBBB]' : 'text-ink-secondary'}`}>
                        {dayjs(reg.createdAt).format('M/D HH:mm')}
                      </span>

                      {/* Status Badge */}
                      <span className={`shrink-0 rounded px-2.5 py-1 text-[11px] font-semibold md:text-xs ${config.className}`}>
                        {config.label}
                      </span>
                    </div>
                  </div>
                )
              })
            )}
      </div>
    </div>
  )
}

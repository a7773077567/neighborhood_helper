// ============================================================
// 公開活動詳情頁（Server Component）
// ============================================================
//
// 【關鍵概念】
// 1. 動態路由 [id]
//    /events/abc123 → params.id = "abc123"
//    Next.js 自動從 URL 擷取，不需要手動解析
//
// 2. notFound() 做存取控制
//    活動不存在、DRAFT、CANCELLED → 都顯示 404
//    公開頁面只能看到 PUBLISHED 和 ENDED 的活動
//
// 3. 響應式雙欄佈局
//    桌面：左欄（講者 + 說明）+ 右欄（報名卡片 340px）
//    手機：單欄堆疊，報名卡片在說明下方
//    用 lg: breakpoint (1024px) 切換，避免平板壓縮
//
// 4. 預留 UI 區塊（先做 UI，之後接資料）
//    - 報名按鈕：disabled，顯示「即將開放報名」（Change 2）
//    - 講者卡片：目前用 placeholder（Speaker model 未建立）
//    - Tags：目前硬編碼（Event model 未來加 tags 欄位）
//    - Attendees Row：頭像堆疊 placeholder（Registration 未建立）
//    - 分享按鈕：UI 先放，功能未接
// ============================================================

import dayjs from 'dayjs'
import { ArrowLeft, Calendar, MapPin, Megaphone, Share2, Users } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { Button } from '@/components/ui/button'
import { prisma } from '@/lib/db/prisma'

// ── 中文星期對照表 ─────────────────────────────────────
const WEEKDAYS = ['日', '一', '二', '三', '四', '五', '六'] as const

// ── Placeholder 資料（未來接真實 model 後移除） ──────────

const PLACEHOLDER_TAGS = ['AI', '工作坊', '初學者友善', 'Next.js']

const PLACEHOLDER_SPEAKERS = [
  { name: '王小明', title: 'Google Developer Expert\nAI/ML 領域', bio: '專注於機器學習與生成式 AI 應用開發，曾在多個國際研討會分享 AI 落地經驗。' },
  { name: '李雅婷', title: '全端工程師\nReact / Next.js', bio: '擁有五年全端開發經驗，熱衷於前端效能優化與開發者體驗改善，社群活躍貢獻者。' },
]

const PLACEHOLDER_ATTENDEE_COLORS = ['#FFD6C2', '#C2E0FF', '#C2FFD6', '#E8C2FF']

// ── 頁面元件 ──────────────────────────────────────────

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<React.ReactElement> {
  const { id } = await params

  const event = await prisma.event.findUnique({
    where: { id },
  })

  // 不存在、DRAFT、CANCELLED → 404
  if (!event || event.status === 'DRAFT' || event.status === 'CANCELLED') {
    notFound()
  }

  // 報名人數（目前固定 0，Change 2 實作後改為真實資料）
  const registrationCount = 0
  const percentage = event.capacity > 0
    ? Math.min((registrationCount / event.capacity) * 100, 100)
    : 0

  // 日期格式化
  const d = dayjs(event.startTime)
  const weekday = WEEKDAYS[d.day()]
  const dateDisplay = `${d.format('YYYY 年 M 月 D 日')}（${weekday}）`
  const timeDisplay = `${dayjs(event.startTime).format('HH:mm')} - ${dayjs(event.endTime).format('HH:mm')}`

  return (
    <div>
      {/* ── Hero Image ── */}
      <div className="mx-auto mt-6 max-w-6xl px-4 md:px-12">
        <div className="relative overflow-hidden rounded-lg aspect-4/1">
          <Image
            src="/images/GDG_Bevy_DefaultEventBanner_VKOwYjb.webp"
            alt="活動封面圖片"
            fill
            className="object-cover"
            priority
          />
        </div>
      </div>

      {/* ── Page Info（返回連結 + 標題 + Badges + Tags） ── */}
      <div className="mx-auto max-w-6xl px-4 pt-6 md:px-12">
        <Link
          href="/events"
          className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-ink-secondary transition-colors hover:text-brand-orange"
        >
          <ArrowLeft className="size-4" />
          返回活動列表
        </Link>

        <h1 className="font-mono text-2xl font-bold text-ink-primary md:text-[32px]">
          {event.title}
        </h1>

        {/* Badges + Tags Row */}
        <div className="mt-3 flex flex-wrap items-center gap-2">
          {/* 徵求講者 Badge */}
          {event.seekingSpeaker && (
            <span className="inline-flex items-center gap-1.5 rounded border-2 border-ink-primary bg-brand-yellow px-2.5 py-1 shadow-[2px_2px_0px_#1A1A1A]">
              <Megaphone className="size-3.5 text-ink-primary" />
              <span className="font-mono text-xs font-bold text-ink-primary">
                徵求講者！
              </span>
            </span>
          )}

          {/* 狀態 Badge */}
          <span className={`inline-flex items-center gap-1.5 rounded border-2 border-ink-primary px-2.5 py-1 shadow-[2px_2px_0px_#1A1A1A] ${
            event.status === 'ENDED'
              ? 'bg-[#F5F0EB]'
              : 'bg-[#E8F5E9]'
          }`}>
            <span className={`size-2 rounded-full ${
              event.status === 'ENDED' ? 'bg-[#BBBBBB]' : 'bg-[#4CAF50]'
            }`} />
            <span className={`text-xs font-semibold ${
              event.status === 'ENDED' ? 'text-[#888888]' : 'text-[#2E7D32]'
            }`}>
              {event.status === 'ENDED' ? '已結束' : '報名中'}
            </span>
          </span>

          {/* Spacer — 把 tags 推到右邊（桌面），手機時不生效 */}
          <span className="hidden flex-1 lg:block" />

          {/* Tags（placeholder，未來從 Event model 讀取） */}
          {PLACEHOLDER_TAGS.map(tag => (
            <span
              key={tag}
              className="rounded border border-[#D4D0CB] bg-surface-muted px-3 py-1 text-[13px] font-medium text-ink-body"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* ── Content Area（雙欄佈局） ── */}
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-6 md:px-12 lg:flex-row lg:gap-10">
        {/* ── Left Column ── */}
        <div className="flex min-w-0 flex-1 flex-col gap-6">
          {/* 講者區塊 */}
          <div className="rounded-lg border-2 border-ink-primary bg-surface-header p-5 shadow-brutal md:p-6">
            <h2 className="font-mono text-lg font-bold text-ink-primary">
              講者
            </h2>

            {/* 講者卡片（placeholder） */}
            <div className="mt-4 flex flex-col gap-4 sm:flex-row">
              {PLACEHOLDER_SPEAKERS.map(speaker => (
                <div
                  key={speaker.name}
                  className="flex flex-1 flex-col items-center gap-3 rounded-lg border-[1.5px] border-[#E8E3DD] bg-surface-header p-5 text-center"
                >
                  {/* Avatar Placeholder */}
                  <div className="flex size-16 items-center justify-center rounded-full border-2 border-ink-primary bg-[#E8E3DD]">
                    <Users className="size-6 text-[#BBBBBB]" />
                  </div>
                  <p className="font-bold text-ink-primary">{speaker.name}</p>
                  <p className="whitespace-pre-line text-[13px] leading-snug text-[#888888]">
                    {speaker.title}
                  </p>
                  <p className="text-[13px] leading-relaxed text-ink-body">
                    {speaker.bio}
                  </p>
                </div>
              ))}
            </div>

            {/* 徵求講者 Banner */}
            {event.seekingSpeaker && (
              <div className="mt-4 flex flex-col items-start gap-3 rounded-lg border-[1.5px] border-brand-orange bg-[#FFF8F0] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-2">
                  <Megaphone className="size-[18px] shrink-0 text-brand-orange" />
                  <p className="text-sm font-semibold text-brand-deep-orange">
                    徵求講者中 — 歡迎自薦或推薦！
                  </p>
                </div>
                <Button
                  disabled
                  size="sm"
                  className="cursor-not-allowed border-2 border-ink-primary font-mono text-[13px] font-bold opacity-60 shadow-[3px_3px_0px_#1A1A1A]"
                >
                  我要當講者
                </Button>
              </div>
            )}
          </div>

          {/* 活動說明 */}
          <div className="rounded-lg border-2 border-ink-primary bg-surface-header p-5 shadow-brutal md:p-6">
            <h2 className="font-mono text-lg font-bold text-ink-primary">
              活動說明
            </h2>
            <p className="mt-4 whitespace-pre-wrap text-[15px] leading-[1.7] text-ink-body">
              {event.description}
            </p>
          </div>
        </div>

        {/* ── Right Column（報名資訊卡片） ── */}
        <div className="w-full shrink-0 lg:w-[340px]">
          <div className="rounded-lg border-2 border-ink-primary bg-surface-header p-6 shadow-brutal">
            <h2 className="font-mono text-lg font-bold text-ink-primary">
              報名資訊
            </h2>

            <hr className="my-4 border-[#E0DBD4]" />

            {/* 日期時間 */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center gap-2">
                <Calendar className="size-4 text-brand-orange" />
                <span className="text-[13px] font-semibold text-ink-body">日期時間</span>
              </div>
              <p className="text-[15px] font-semibold text-ink-primary">{dateDisplay}</p>
              <p className="text-sm text-[#888888]">{timeDisplay}</p>
            </div>

            <hr className="my-4 border-[#E0DBD4]" />

            {/* 活動地點 */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center gap-2">
                <MapPin className="size-4 text-brand-orange" />
                <span className="text-[13px] font-semibold text-ink-body">活動地點</span>
              </div>
              <p className="text-[15px] font-semibold text-ink-primary">{event.location}</p>
            </div>

            <hr className="my-4 border-[#E0DBD4]" />

            {/* 主辦單位 */}
            <div className="flex items-center gap-3">
              <div className="flex size-8 items-center justify-center rounded-full border-[1.5px] border-ink-primary bg-[#E8E3DD]">
                <Users className="size-4 text-[#BBBBBB]" />
              </div>
              <div>
                <p className="text-[11px] text-[#888888]">主辦單位</p>
                <p className="text-sm font-semibold text-ink-primary">GDG Tainan</p>
              </div>
            </div>

            <hr className="my-4 border-[#E0DBD4]" />

            {/* 報名人數 + Progress Bar */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <Users className="size-4 text-brand-orange" />
                <span className="text-[13px] font-semibold text-ink-body">報名人數</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="font-mono text-2xl font-bold text-ink-primary">
                  {registrationCount}
                </span>
                <span className="text-sm text-[#888888]">
                  /
                  {' '}
                  {event.capacity}
                  {' '}
                  人
                </span>
              </div>
              {/* Neobrutalism Progress Bar */}
              <div className="h-2.5 rounded-sm border-2 border-ink-primary bg-[#E8E3DD] p-0.5 shadow-[2px_2px_0px_#1A1A1A]">
                <div
                  className="h-full rounded-[1px] bg-brand-orange transition-all"
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>

            <hr className="my-4 border-[#E0DBD4]" />

            {/* CTA 按鈕（預留，disabled） */}
            <Button
              disabled
              className="h-12 w-full cursor-not-allowed border-2 border-ink-primary font-mono text-base font-bold opacity-60 shadow-brutal"
            >
              即將開放報名
            </Button>

            {/* 分享按鈕 */}
            <button
              type="button"
              className="mt-3 flex h-10 w-full cursor-not-allowed items-center justify-center gap-2 rounded-lg border-2 border-ink-primary bg-transparent font-semibold text-ink-primary opacity-60"
            >
              <Share2 className="size-4" />
              分享活動
            </button>
          </div>

          {/* Attendees Row（placeholder） */}
          <div className="mt-4 flex items-center gap-2.5 px-1">
            <div className="flex -space-x-2">
              {PLACEHOLDER_ATTENDEE_COLORS.map(color => (
                <div
                  key={color}
                  className="size-7 rounded-full border-2 border-white"
                  style={{ backgroundColor: color }}
                />
              ))}
              <div className="flex size-7 items-center justify-center rounded-full border-2 border-white bg-[#E8E3DD]">
                <span className="text-[10px] font-bold text-[#888888]">+14</span>
              </div>
            </div>
            <span className="text-[13px] text-[#888888]">
              {registrationCount}
              {' '}
              人已報名
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

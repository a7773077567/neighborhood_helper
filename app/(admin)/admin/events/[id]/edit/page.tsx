// ============================================================
// 編輯活動頁面
// ============================================================
//
// 【動態路由】
// 資料夾名稱 [id] 讓 Next.js 把 URL 中的值傳到 params.id
// 例如 /admin/events/abc123/edit → params.id = "abc123"
//
// 【資料流】
// 1. 從 params 取得 eventId
// 2. 用 Prisma 查詢現有活動資料
// 3. 找不到 → notFound()（顯示 404）
// 4. 把 DB 的 Date 轉成 datetime-local 字串
// 5. 用 .bind(null, eventId) 綁定 updateEvent 的第一個參數
// 6. 把資料和 action 傳給 EventForm
// ============================================================

import dayjs from 'dayjs'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import type { EventFormValues } from '@/components/features/events/event-form'
import { EventForm } from '@/components/features/events/event-form'
import type { ActionResult } from '@/components/features/events/event-form'
import { prisma } from '@/lib/db/prisma'

import { updateEvent } from '../../actions'

// ── 頁面元件 ─────────────────────────────────────────────

export default async function EditEventPage({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<React.ReactElement> {
  const { id } = await params

  // 查詢現有活動資料
  const event = await prisma.event.findUnique({
    where: { id },
  })

  // 活動不存在 → 404
  if (!event) notFound()

  // Date → datetime-local 字串（"YYYY-MM-DDTHH:mm"）
  // EventForm 的 defaultValues 期望 string，不是 Date
  const defaultValues = {
    title: event.title,
    description: event.description,
    startTime: dayjs(event.startTime).format('YYYY-MM-DDTHH:mm'),
    endTime: dayjs(event.endTime).format('YYYY-MM-DDTHH:mm'),
    location: event.location,
    capacity: event.capacity,
    seekingSpeaker: event.seekingSpeaker,
  }

  // 用 .bind 預先綁定 eventId — updateEvent(eventId, data) → updateWithId(data)
  async function handleUpdate(
    data: EventFormValues,
  ): Promise<ActionResult> {
    'use server'
    return updateEvent(id, data)
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 md:px-8 md:py-10">
      {/* ── 返回連結 ── */}
      <Link
        href="/admin/events"
        className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-ink-secondary transition-colors hover:text-ink-primary"
      >
        <ArrowLeft className="size-4" />
        返回活動列表
      </Link>

      {/* ── 標題 ── */}
      <h1 className="mb-8 font-mono text-2xl font-bold text-ink-primary md:text-[28px]">
        編輯活動
      </h1>

      {/* ── 表單（帶入現有資料） ── */}
      <EventForm
        mode="edit"
        defaultValues={defaultValues}
        onSubmit={handleUpdate}
      />
    </div>
  )
}

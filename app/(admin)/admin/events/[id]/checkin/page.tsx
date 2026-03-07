// ============================================================
// Admin 簽到頁面（Server Component）
// ============================================================
//
// 【Server / Client 分工】
// Server Component：Prisma 查詢 + 資料整理 + 權限檢查（由 admin layout 處理）
// Client Component（CheckinClient）：所有互動邏輯（掃描、簽到、取消、toast）
//
// 【為什麼把資料攤平？】
// Prisma 的 Registration 物件包含 User relation 和 Date 物件，
// 不能直接序列化傳給 Client Component。
// 攤平成 { id, userName, userEmail, attended, attendedAt(ISO) } 的簡單物件。
//
// 【排序邏輯】
// 已簽到的在上面（按 attendedAt 降序，最新簽到的在最前），
// 未簽到的在下面（保持報名順序）。
// 這樣組織者一眼就能看到剛簽到的人。
//
// 【只查 CONFIRMED】
// 已取消的報名不會出現在簽到名單，跟 uncheckIn 的防護邏輯一致。
// ============================================================

import dayjs from 'dayjs'
import { notFound } from 'next/navigation'

import { CheckinClient } from '@/components/features/checkin/checkin-client'
import { prisma } from '@/lib/db/prisma'

// ── 中文星期對照表 ─────────────────────────────────────────
const WEEKDAYS = ['日', '一', '二', '三', '四', '五', '六'] as const

function formatEventDate(start: Date, end: Date): string {
  const d = dayjs(start)
  const weekday = WEEKDAYS[d.day()]
  return `${d.format('M/D')} (${weekday}) ${d.format('HH:mm')} - ${dayjs(end).format('HH:mm')}`
}

// ── 頁面元件 ──────────────────────────────────────────────

export default async function AdminCheckinPage({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<React.ReactElement> {
  const { id } = await params

  // 一次查詢取出活動 + CONFIRMED 報名 + 使用者資料
  const event = await prisma.event.findUnique({
    where: { id },
    include: {
      registrations: {
        where: { status: 'CONFIRMED' },
        include: {
          user: { select: { name: true, email: true, image: true } },
        },
        orderBy: { createdAt: 'asc' },
      },
    },
  })

  if (!event) notFound()

  // 攤平資料 → 可序列化的物件
  const registrations = event.registrations.map((reg, index) => ({
    id: reg.id,
    userName: reg.user.name ?? '未設定姓名',
    userEmail: reg.user.email ?? '',
    attended: reg.attended,
    attendedAt: reg.attendedAt?.toISOString() ?? null,
    avatarIndex: index,
  }))

  // 排序：已簽到（最新在前）→ 未簽到（維持原序）
  registrations.sort((a, b) => {
    if (a.attended && !b.attended) return -1
    if (!a.attended && b.attended) return 1
    if (a.attended && b.attended) {
      return new Date(b.attendedAt!).getTime() - new Date(a.attendedAt!).getTime()
    }
    return 0
  })

  const attendedCount = registrations.filter(r => r.attended).length

  return (
    <CheckinClient
      eventId={id}
      eventTitle={event.title}
      eventDate={formatEventDate(event.startTime, event.endTime)}
      eventStatus={event.status}
      registrations={registrations}
      attendedCount={attendedCount}
      totalCount={registrations.length}
    />
  )
}

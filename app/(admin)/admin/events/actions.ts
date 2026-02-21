'use server'

// ============================================================
// Admin 活動管理 Server Actions
// ============================================================
//
// 【架構】
// 每個 Server Action 都遵循相同的三步驟：
//   1. 驗證身份 — auth() 檢查 session + ADMIN 角色
//   2. 驗證資料 — Zod schema safeParse
//   3. 執行操作 — Prisma 寫入 DB
//
// 【安全性】
// 即使前端 zodResolver 已經驗證過，後端一定要再驗證一次。
// 前端驗證 = UX（即時回饋），後端驗證 = 安全性（防繞過）。
//
// 【回傳格式】Discriminated Union
// - { success: true }           → 操作成功（搭配 redirect）
// - { success: false, error }   → 操作失敗（表單顯示錯誤）
//
// 【revalidatePath + redirect】
// Server Action 改變 DB 資料後，需要：
// 1. revalidatePath — 通知 Next.js 快取過期，下次訪問時重新取資料
// 2. redirect — 導向目標頁面（成功才跳轉，失敗停在原頁顯示錯誤）
//
// 注意：redirect() 會拋出特殊錯誤來中斷執行流程，
// 所以必須放在 try-catch 之外，否則會被 catch 攔截
// ============================================================

import type { EventStatus } from '@/app/generated/prisma/enums'
import type { ActionResult } from '@/components/features/events/event-form'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db/prisma'
import { createEventSchema, updateEventSchema } from '@/lib/validations/event'

// ── 共用：身份驗證 ─────────────────────────────────────

/**
 * 檢查當前使用者是否為 ADMIN
 *
 * 為什麼抽成獨立函式？
 * - 三個 action 都需要同樣的檢查
 * - 回傳 userId 供後續 Prisma 查詢使用
 * - 回傳 null 表示未授權，呼叫端統一處理
 */
async function requireAdmin(): Promise<{ userId: string } | null> {
  const session = await auth()
  if (!session || session.user.role !== 'ADMIN') {
    return null
  }
  return { userId: session.user.id }
}

// ── 建立活動（發布狀態） ───────────────────────────────

export async function createEvent(
  data: Record<string, unknown>,
): Promise<ActionResult> {
  // 1. 驗證身份
  const admin = await requireAdmin()
  if (!admin) {
    return { success: false, error: '沒有權限執行此操作' }
  }

  // 2. 驗證資料（後端 Zod 驗證，不信任前端傳來的資料）
  const parsed = createEventSchema.safeParse(data)
  if (!parsed.success) {
    // 取第一個錯誤訊息回傳給前端
    const firstError = parsed.error.issues[0]?.message ?? '資料格式錯誤'
    return { success: false, error: firstError }
  }

  // 3. 寫入 DB — 狀態為 PUBLISHED（立即發布）
  await prisma.event.create({
    data: {
      ...parsed.data,
      status: 'PUBLISHED',
      organizerId: admin.userId,
    },
  })

  // 4. 更新快取 & 導向列表頁
  revalidatePath('/admin/events')
  revalidatePath('/events')
  redirect('/admin/events')
}

// ── 建立活動（草稿狀態） ───────────────────────────────

export async function createDraftEvent(
  data: Record<string, unknown>,
): Promise<ActionResult> {
  const admin = await requireAdmin()
  if (!admin) {
    return { success: false, error: '沒有權限執行此操作' }
  }

  // 草稿也要驗證基本格式（但 createEventSchema 會檢查開始時間是否為未來）
  // 如果草稿不需要這個限制，可以改用 updateEventSchema
  const parsed = createEventSchema.safeParse(data)
  if (!parsed.success) {
    const firstError = parsed.error.issues[0]?.message ?? '資料格式錯誤'
    return { success: false, error: firstError }
  }

  // 狀態為 DRAFT（草稿）
  await prisma.event.create({
    data: {
      ...parsed.data,
      status: 'DRAFT',
      organizerId: admin.userId,
    },
  })

  revalidatePath('/admin/events')
  redirect('/admin/events')
}

// ── 更新活動 ─────────────────────────────────────────

export async function updateEvent(
  eventId: string,
  data: Record<string, unknown>,
): Promise<ActionResult> {
  const admin = await requireAdmin()
  if (!admin) {
    return { success: false, error: '沒有權限執行此操作' }
  }

  // 確認活動存在
  const existing = await prisma.event.findUnique({
    where: { id: eventId },
    select: { id: true },
  })
  if (!existing) {
    return { success: false, error: '找不到此活動' }
  }

  // 用 updateEventSchema 驗證（不強制開始時間是未來）
  const parsed = updateEventSchema.safeParse(data)
  if (!parsed.success) {
    const firstError = parsed.error.issues[0]?.message ?? '資料格式錯誤'
    return { success: false, error: firstError }
  }

  await prisma.event.update({
    where: { id: eventId },
    data: parsed.data,
  })

  revalidatePath('/admin/events')
  revalidatePath('/events')
  revalidatePath(`/events/${eventId}`)
  redirect('/admin/events')
}

// ── 變更活動狀態 ───────────────────────────────────────

/**
 * 變更活動狀態（發布 / 結束 / 取消）
 *
 * 與 createEvent / updateEvent 不同：
 * - 不需要 Zod 驗證（沒有表單資料，只有一個狀態值）
 * - 但需要檢查狀態轉換是否合法（例如已結束的不能再發布）
 *
 * 合法的狀態轉換：
 *   DRAFT     → PUBLISHED | CANCELLED
 *   PUBLISHED → ENDED | CANCELLED
 *   ENDED     → （不可變更）
 *   CANCELLED → （不可變更）
 */

const VALID_TRANSITIONS: Record<string, EventStatus[]> = {
  DRAFT: ['PUBLISHED', 'CANCELLED'],
  PUBLISHED: ['ENDED', 'CANCELLED'],
  ENDED: [],
  CANCELLED: [],
}

export async function updateEventStatus(
  eventId: string,
  newStatus: EventStatus,
): Promise<void> {
  const admin = await requireAdmin()
  if (!admin) return

  const event = await prisma.event.findUnique({
    where: { id: eventId },
    select: { status: true },
  })
  if (!event) return

  // 檢查狀態轉換是否合法
  const allowed = VALID_TRANSITIONS[event.status] ?? []
  if (!allowed.includes(newStatus)) return

  await prisma.event.update({
    where: { id: eventId },
    data: { status: newStatus },
  })

  revalidatePath('/admin/events')
  revalidatePath('/events')
  revalidatePath(`/events/${eventId}`)
}

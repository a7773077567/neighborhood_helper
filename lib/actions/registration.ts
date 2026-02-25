'use server'

// ============================================================
// 活動報名 Server Actions
// ============================================================
//
// 【為什麼放在 lib/actions/ 而不是 app/ 底下？】
// admin 的 actions 放在 app/(admin)/admin/events/actions.ts，
// 是因為只有 admin 頁面會用到。但報名 action 會被多個地方呼叫
// （活動詳情頁、未來可能的快速報名等），放在 lib/ 比較通用。
//
// 【回傳格式】與 admin actions 一致的 Discriminated Union
// - { success: true }           → 操作成功
// - { success: false, error, code? } → 操作失敗
// ============================================================

import { revalidatePath } from 'next/cache'

import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db/prisma'

// ── 回傳型別 ────────────────────────────────────────────

type RegistrationResult
  = | { success: true }
    | { success: false, error: string, code?: string }

// ── 報名活動 ────────────────────────────────────────────

export async function registerEvent(
  eventId: string,
): Promise<RegistrationResult> {
  // 1. 身份檢查
  const session = await auth()
  if (!session) {
    return { success: false, error: '請先登入', code: 'UNAUTHORIZED' }
  }

  const userId = session.user.id

  // 2. 活動檢查 — 活動存在且是 PUBLISHED 狀態才能報名
  const event = await prisma.event.findUnique({
    where: { id: eventId },
    select: { id: true, status: true, capacity: true },
  })

  if (!event) {
    return { success: false, error: '找不到此活動', code: 'EVENT_NOT_FOUND' }
  }

  if (event.status !== 'PUBLISHED') {
    return {
      success: false,
      error: '此活動目前無法報名',
      code: 'EVENT_NOT_AVAILABLE',
    }
  }

  // 3. 檢查是否有舊的報名記錄（含 CANCELLED）
  const existingRegistration = await prisma.registration.findUnique({
    where: { userId_eventId: { userId, eventId } },
  })

  if (existingRegistration?.status === 'CONFIRMED') {
    return {
      success: false,
      error: '您已報名此活動',
      code: 'ALREADY_REGISTERED',
    }
  }

  // 4. 在 Transaction 內做容量檢查 + 寫入
  //    為什麼 Transaction？避免兩個人同時報名最後一個名額時都成功
  try {
    await prisma.$transaction(async (tx) => {
      const confirmedCount = await tx.registration.count({
        where: { eventId, status: 'CONFIRMED' },
      })

      if (confirmedCount >= event.capacity) {
        throw new Error('EVENT_FULL')
      }

      if (existingRegistration) {
        // 之前取消過 → 更新回 CONFIRMED（重新報名）
        await tx.registration.update({
          where: { id: existingRegistration.id },
          data: { status: 'CONFIRMED' },
        })
      }
      else {
        // 首次報名 → 建立新記錄
        await tx.registration.create({
          data: { userId, eventId },
        })
      }
    })
  }
  catch (error) {
    if (error instanceof Error && error.message === 'EVENT_FULL') {
      return { success: false, error: '活動已額滿', code: 'EVENT_FULL' }
    }
    throw error // 其他未預期的錯誤，往上拋
  }

  // 5. 更新快取 — 讓相關頁面顯示最新的報名人數
  revalidatePath(`/events/${eventId}`)
  revalidatePath('/events')
  revalidatePath('/my-events')

  return { success: true }
}

// ── 取消報名 ────────────────────────────────────────────

export async function cancelRegistration(
  eventId: string,
): Promise<RegistrationResult> {
  // 1. 身份檢查
  const session = await auth()
  if (!session) {
    return { success: false, error: '請先登入', code: 'UNAUTHORIZED' }
  }

  const userId = session.user.id

  // 2. 報名記錄檢查 — 必須有 CONFIRMED 的報名才能取消
  const registration = await prisma.registration.findUnique({
    where: { userId_eventId: { userId, eventId } },
    include: {
      event: {
        select: { startTime: true },
      },
    },
  })

  if (!registration || registration.status !== 'CONFIRMED') {
    return {
      success: false,
      error: '您尚未報名此活動',
      code: 'NOT_REGISTERED',
    }
  }

  // 3. 時間檢查 — 活動已開始就不能取消
  if (registration.event.startTime <= new Date()) {
    return {
      success: false,
      error: '活動已開始，無法取消報名',
      code: 'EVENT_STARTED',
    }
  }

  // 4. 更新 status 為 CANCELLED（soft delete）
  //    不需要 Transaction — 只更新自己的記錄，不跟其他人競爭
  await prisma.registration.update({
    where: { id: registration.id },
    data: { status: 'CANCELLED' },
  })

  // 5. 更新快取
  revalidatePath(`/events/${eventId}`)
  revalidatePath('/events')
  revalidatePath('/my-events')

  return { success: true }
}

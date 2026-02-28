'use server'

// ============================================================
// QR Code 簽到 Server Actions
// ============================================================
//
// 【為什麼放在 lib/actions/？】
// 簽到會被多個地方呼叫：掃描頁面（QR 簽到）和報名名單頁面（手動簽到），
// 放在 lib/ 比較通用。
//
// 【回傳格式】與 registration.ts 一致的 Discriminated Union
// - { success: true, attendee }    → 簽到成功，附帶參加者資訊
// - { success: false, error, code } → 簽到失敗
// ============================================================

import { revalidatePath } from 'next/cache'

import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db/prisma'

// ── 回傳型別 ────────────────────────────────────────────

type CheckinResult =
  | { success: true; attendee: { name: string; image: string | null } }
  | { success: false; error: string; code: string }

// ── QR Code 簽到 ────────────────────────────────────────

export async function checkinByQrToken(
  qrToken: string,
  eventId: string,
): Promise<CheckinResult> {
  // 1. 身份 + 權限檢查 — 只有 ADMIN 能簽到
  const session = await auth()
  if (!session) {
    return { success: false, error: '請先登入', code: 'UNAUTHORIZED' }
  }

  if (session.user.role !== 'ADMIN') {
    return { success: false, error: '無權限執行此操作', code: 'FORBIDDEN' }
  }

  // 2. 用 qrToken 查詢 Registration
  //    include user 是為了拿簽到者的名字和大頭照，顯示在簽到成功畫面
  const registration = await prisma.registration.findUnique({
    where: { qrToken },
    include: { user: { select: { name: true, image: true } } },
  })

  if (!registration) {
    return { success: false, error: '無效的 QR Code', code: 'INVALID_TOKEN' }
  }

  // 3. 確認是本場活動的報名
  //    防止跨活動掃描 — A 活動的 QR Code 不能在 B 活動簽到
  if (registration.eventId !== eventId) {
    return { success: false, error: '此 QR Code 不屬於本場活動', code: 'WRONG_EVENT' }
  }

  // 4. 檢查報名狀態 — 已取消的報名不能簽到
  if (registration.status === 'CANCELLED') {
    return { success: false, error: '此報名已取消', code: 'REGISTRATION_CANCELLED' }
  }

  // 5. 檢查是否已簽到 — 不報錯但用不同 code 讓前端顯示警告而非錯誤
  if (registration.attended) {
    return { success: false, error: '此參加者已簽到', code: 'ALREADY_CHECKED_IN' }
  }

  // 6. 標記出席
  //    不需要 Transaction — 不像報名有搶名額的競速問題
  await prisma.registration.update({
    where: { id: registration.id },
    data: { attended: true, attendedAt: new Date() },
  })

  // 7. 更新快取 — 簽到頁面和報名名單都需要刷新
  revalidatePath(`/admin/events/${eventId}/checkin`)
  revalidatePath(`/admin/events/${eventId}/registrations`)

  return {
    success: true,
    attendee: {
      name: registration.user.name ?? '未知使用者',
      image: registration.user.image,
    },
  }
}

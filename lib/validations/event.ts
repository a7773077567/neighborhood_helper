import { z } from 'zod/v4'

// ============================================================
// 活動表單的共用欄位驗證
// ============================================================
// 建立和編輯共用同一套欄位規則，差異用 refine 處理

const eventBaseSchema = z.object({
  title: z
    .string()
    .min(5, '標題至少 5 個字')
    .max(100, '標題最多 100 個字'),

  description: z
    .string()
    .min(10, '描述至少 10 個字'),

  startTime: z.coerce
    .date({ error: '請輸入有效的開始時間' }),

  endTime: z.coerce
    .date({ error: '請輸入有效的結束時間' }),

  location: z
    .string()
    .min(1, '請輸入活動地點'),

  capacity: z.coerce
    .number({ error: '請輸入有效的數字' })
    .int('容量必須是整數')
    .positive('容量必須大於 0'),

  seekingSpeaker: z
    .boolean()
    .default(false),
})

// ============================================================
// 建立活動 — 開始時間必須是未來
// ============================================================

export const createEventSchema = eventBaseSchema
  .refine(
    (data) => data.startTime > new Date(),
    { message: '開始時間必須是未來', path: ['startTime'] },
  )
  .refine(
    (data) => data.endTime > data.startTime,
    { message: '結束時間必須晚於開始時間', path: ['endTime'] },
  )

// ============================================================
// 編輯活動 — 不限制開始時間（已發布活動可能只改描述）
// ============================================================

export const updateEventSchema = eventBaseSchema
  .refine(
    (data) => data.endTime > data.startTime,
    { message: '結束時間必須晚於開始時間', path: ['endTime'] },
  )

// ============================================================
// 型別匯出 — 供 Server Actions 和表單元件使用
// ============================================================

export type CreateEventInput = z.input<typeof createEventSchema>
export type UpdateEventInput = z.input<typeof updateEventSchema>

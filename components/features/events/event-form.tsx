'use client'

// ============================================================
// EventForm — 活動建立 / 編輯共用表單元件
// ============================================================
//
// 【關鍵概念】react-hook-form + zodResolver
//
// 1. useForm 管理表單狀態（值、驗證錯誤、dirty 狀態）
// 2. zodResolver 橋接 Zod schema → react-hook-form 驗證器
//    - 同一份 Zod schema 前端後端共用，驗證邏輯不重複
//    - @hookform/resolvers v5 自動偵測 zod v3/v4，不需特殊 import
// 3. register() 連結原生 HTML input（Input、Textarea）
//    - 回傳 { onChange, onBlur, name, ref }，自動追蹤值的變化
// 4. Controller 包裝非原生元件（Switch）
//    - Radix Switch 不是 <input>，無法用 register()
//    - Controller 提供 field.value + field.onChange 讓我們手動綁定
// 5. handleSubmit 在提交前先跑 zodResolver 驗證
//    - 通過 → 呼叫 onValid callback（帶驗證過的資料）
//    - 失敗 → 自動填入 errors，不呼叫 callback
//
// 【表單模式】
// - create: 兩個按鈕 — 「儲存草稿」+「立即發布」
// - edit:   兩個按鈕 — 「取消」+「儲存變更」
//
// 【datetime-local】
// - 瀏覽器原生日期時間選擇器，手機體驗最好
// - 值格式: "2026-03-15T14:00"（ISO 字串）
// - Zod 的 z.coerce.date() 會把字串轉成 Date
// ============================================================

import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { useTransition } from 'react'
import { Controller, useForm } from 'react-hook-form'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { createEventSchema, updateEventSchema } from '@/lib/validations/event'

// ── 型別定義 ─────────────────────────────────────────

/**
 * Server Action 的回傳格式（Discriminated Union）
 *
 * 用 success 欄位區分成功/失敗兩種情況：
 * - { success: true }          → 成功，不會有 error
 * - { success: false, error }  → 失敗，一定有 error 訊息
 *
 * TypeScript 會根據 success 的值自動收窄型別（narrowing），
 * 在 if (result.success) 的分支裡，存取 result.error 會報錯
 */
export type ActionResult
  = | { success: true }
    | { success: false, error: string }

/**
 * 表單欄位值 — 對應 HTML input 的原始型別
 *
 * 注意 startTime / endTime 是 string（datetime-local 的值）
 * 提交時 Zod 的 z.coerce.date() 會把它們轉成 Date
 */
export type EventFormValues = {
  title: string
  description: string
  startTime: string
  endTime: string
  location: string
  capacity: number
  seekingSpeaker: boolean
}

interface EventFormProps {
  mode: 'create' | 'edit'
  defaultValues?: Partial<EventFormValues>
  /** 主要提交（create = 發布，edit = 儲存變更） */
  onSubmit: (data: EventFormValues) => Promise<ActionResult>
  /** 建立模式專用：儲存為草稿 */
  onSaveDraft?: (data: EventFormValues) => Promise<ActionResult>
}

// ── 主元件 ───────────────────────────────────────────

export function EventForm({
  mode,
  defaultValues,
  onSubmit,
  onSaveDraft,
}: EventFormProps): React.ReactElement {
  const router = useRouter()

  // useTransition 讓 Server Action 執行期間可以顯示 loading 狀態
  // isPending = true 時禁用按鈕，防止重複提交
  const [isPending, startTransition] = useTransition()

  // 根據模式選擇不同的 Zod schema
  // create: 要求開始時間必須是未來
  // edit: 不限制開始時間（已發布活動可能只改描述）
  const schema = mode === 'create' ? createEventSchema : updateEventSchema

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    setError,
  } = useForm<EventFormValues>({
    // z.coerce 的 input 型別是 unknown，與表單 string/number 欄位衝突
    // 這是 zodResolver + z.coerce 的已知限制，runtime 行為正確
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(schema) as any,
    defaultValues: {
      title: '',
      description: '',
      startTime: '',
      endTime: '',
      location: '',
      capacity: 50,
      seekingSpeaker: false,
      ...defaultValues,
    },
  })

  // ── 提交處理 ─────────────────────────────────────

  /** 主要提交（發布 / 儲存變更） */
  function handleFormSubmit(data: EventFormValues): void {
    startTransition(async () => {
      const result = await onSubmit(data)
      // discriminated union：先用 success 收窄，才能安全存取 error
      if (!result.success) {
        setError('root', { message: result.error })
      }
    })
  }

  /** 儲存草稿（僅 create 模式） */
  function handleDraftSubmit(data: EventFormValues): void {
    if (!onSaveDraft)
      return
    startTransition(async () => {
      const result = await onSaveDraft(data)
      if (!result.success) {
        setError('root', { message: result.error })
      }
    })
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {/* ── 表單全域錯誤 ── */}
      {errors.root && (
        <div className="rounded-lg border-2 border-destructive bg-red-50 px-4 py-3 text-sm text-destructive">
          {errors.root.message}
        </div>
      )}

      {/* ── 表單卡片（Neobrutalism 風格） ── */}
      <div className="rounded-lg border-2 border-ink-primary bg-surface-warm p-5 shadow-brutal md:p-8">
        {/* 活動標題 */}
        <div className="space-y-2">
          <Label
            htmlFor="title"
            className="font-mono text-sm font-semibold text-ink-primary"
          >
            活動標題
          </Label>
          <Input
            id="title"
            placeholder="例：Build with AI 工作坊"
            {...register('title')}
            aria-invalid={!!errors.title}
            className="border-2 border-ink-primary bg-white"
          />
          {errors.title && (
            <p className="text-sm text-destructive">{errors.title.message}</p>
          )}
        </div>

        {/* 活動描述 */}
        <div className="mt-5 space-y-2">
          <Label
            htmlFor="description"
            className="font-mono text-sm font-semibold text-ink-primary"
          >
            活動描述
          </Label>
          <Textarea
            id="description"
            placeholder="描述活動內容、目標受眾、活動形式..."
            rows={4}
            {...register('description')}
            aria-invalid={!!errors.description}
            className="border-2 border-ink-primary bg-white"
          />
          {errors.description && (
            <p className="text-sm text-destructive">
              {errors.description.message}
            </p>
          )}
        </div>

        {/* 開始 / 結束時間 — 桌面並排，手機堆疊 */}
        <div className="mt-5 grid gap-5 md:grid-cols-2">
          <div className="space-y-2">
            <Label
              htmlFor="startTime"
              className="font-mono text-sm font-semibold text-ink-primary"
            >
              開始時間
            </Label>
            <Input
              id="startTime"
              type="datetime-local"
              {...register('startTime')}
              aria-invalid={!!errors.startTime}
              className="border-2 border-ink-primary bg-white"
            />
            {errors.startTime && (
              <p className="text-sm text-destructive">
                {errors.startTime.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="endTime"
              className="font-mono text-sm font-semibold text-ink-primary"
            >
              結束時間
            </Label>
            <Input
              id="endTime"
              type="datetime-local"
              {...register('endTime')}
              aria-invalid={!!errors.endTime}
              className="border-2 border-ink-primary bg-white"
            />
            {errors.endTime && (
              <p className="text-sm text-destructive">
                {errors.endTime.message}
              </p>
            )}
          </div>
        </div>

        {/* 地點 + 人數上限 — 桌面並排（地點佔寬，人數窄），手機堆疊 */}
        <div className="mt-5 grid gap-5 md:grid-cols-[1fr_120px]">
          <div className="space-y-2">
            <Label
              htmlFor="location"
              className="font-mono text-sm font-semibold text-ink-primary"
            >
              活動地點
            </Label>
            <Input
              id="location"
              placeholder="例：成大資工系館 65204"
              {...register('location')}
              aria-invalid={!!errors.location}
              className="border-2 border-ink-primary bg-white"
            />
            {errors.location && (
              <p className="text-sm text-destructive">
                {errors.location.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="capacity"
              className="font-mono text-sm font-semibold text-ink-primary"
            >
              人數上限
            </Label>
            <Input
              id="capacity"
              type="number"
              min={1}
              {...register('capacity', { valueAsNumber: true })}
              aria-invalid={!!errors.capacity}
              className="border-2 border-ink-primary bg-white"
            />
            {errors.capacity && (
              <p className="text-sm text-destructive">
                {errors.capacity.message}
              </p>
            )}
          </div>
        </div>

        {/* 徵求講者 Switch */}
        <div className="mt-5 flex items-start gap-3">
          {/*
           * Controller 包裝 Radix Switch：
           * field.value = 表單追蹤的布林值
           * field.onChange = 更新表單狀態的函式
           * onCheckedChange 是 Radix Switch 的 callback，直接傳布林值
           */}
          <Controller
            control={control}
            name="seekingSpeaker"
            render={({ field }) => (
              <Switch
                id="seekingSpeaker"
                checked={field.value}
                onCheckedChange={field.onChange}
                className="mt-0.5"
              />
            )}
          />
          <Label
            htmlFor="seekingSpeaker"
            className="cursor-pointer text-sm leading-relaxed"
          >
            <span className="font-mono font-semibold text-ink-primary">
              徵求講者
            </span>
            {' '}
            <span className="text-ink-body">
              開放社群成員自薦為講者，提昇社群參與度
            </span>
          </Label>
        </div>
      </div>

      {/* ── 操作按鈕 ───────────────────────────────── */}
      {/*
       * 響應式排列策略：
       * - 桌面 (md+): flex-row，次要按鈕在左、主要按鈕在右
       * - 手機: flex-col-reverse，主要按鈕在上、次要按鈕在下
       *   （DOM 順序：次要 → 主要，flex-col-reverse 反轉顯示順序）
       */}
      <div className="flex flex-col-reverse gap-3 md:flex-row md:justify-end">
        {mode === 'create' ? (
          <>
            {/* 儲存草稿（次要動作） */}
            <Button
              type="button"
              variant="outline"
              onClick={handleSubmit(handleDraftSubmit)}
              disabled={isPending}
              className="h-11 cursor-pointer border-2 border-ink-primary bg-surface-warm font-mono font-semibold shadow-brutal transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-brutal-hover active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
            >
              儲存草稿
            </Button>

            {/* 立即發布（主要動作） */}
            <Button
              type="submit"
              disabled={isPending}
              className="h-11 cursor-pointer border-2 border-ink-primary font-mono font-semibold shadow-brutal transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-brutal-hover active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
            >
              {isPending ? '處理中...' : '立即發布'}
            </Button>
          </>
        ) : (
          <>
            {/* 取消（次要動作，無陰影） */}
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={isPending}
              className="h-11 cursor-pointer border-2 border-ink-primary bg-surface-warm font-mono font-semibold text-ink-secondary shadow-brutal transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:bg-surface-muted hover:shadow-brutal-hover active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
            >
              取消
            </Button>

            {/* 儲存變更（主要動作） */}
            <Button
              type="submit"
              disabled={isPending}
              className="h-11 cursor-pointer border-2 border-ink-primary font-mono font-semibold shadow-brutal transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-brutal-hover active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
            >
              {isPending ? '處理中...' : '儲存變更'}
            </Button>
          </>
        )}
      </div>
    </form>
  )
}

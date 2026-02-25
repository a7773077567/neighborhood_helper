'use client'

// ============================================================
// RegisterButton — 活動報名 CTA 按鈕（Client Component）
// ============================================================
//
// 【為什麼是 Client Component？】
// 按鈕需要：1) 點擊事件 2) loading 狀態 3) 呼叫 Server Action
// 這些都需要 JavaScript 在瀏覽器端執行
//
// 【狀態判斷不在這裡做】
// 按鈕的「當前狀態」由 Server Component（詳情頁）判斷後傳入
// 這個元件只負責「根據狀態 render 對應 UI + 處理互動」
//
// 【useTransition vs useState】
// useTransition 的 isPending 會在整個 Server Action 執行期間
// （包含 revalidatePath 觸發的重新渲染）保持 true
// 比手動 setLoading(true/false) 更安全，不怕漏 reset
// ============================================================

import { Check, Loader2, LogIn } from 'lucide-react'
import { useRouter } from 'next/navigation'

import { useTransition } from 'react'
import { cancelRegistration, registerEvent } from '@/lib/actions/registration'

// ── 按鈕的五種狀態（由 Server Component 計算後傳入） ──────

export type ButtonState
  = | 'not-logged-in' // 未登入 → 導向登入
    | 'can-register' // 可報名 → 呼叫 registerEvent
    | 'registered' // 已報名 → 顯示已報名 + 取消連結
    | 'full' // 已額滿 → disabled
    | 'ended' // 已結束 → disabled

type RegisterButtonProps = {
  eventId: string
  state: ButtonState
}

// ── 元件 ────────────────────────────────────────────────

export function RegisterButton({ eventId, state }: RegisterButtonProps): React.ReactElement {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  // ── 報名 ──
  function handleRegister(): void {
    startTransition(async () => {
      const result = await registerEvent(eventId)
      if (!result.success) {
        // TODO: 未來可以用 toast 顯示錯誤，目前先 alert
        alert(result.error)
      }
    })
  }

  // ── 取消報名 ──
  function handleCancel(): void {
    startTransition(async () => {
      const result = await cancelRegistration(eventId)
      if (!result.success) {
        alert(result.error)
      }
    })
  }

  // ── 未登入：導向登入頁 ──
  if (state === 'not-logged-in') {
    return (
      <button
        type="button"
        onClick={() => router.push('/login')}
        className="flex h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-lg border-2 border-ink-primary bg-surface-header font-mono text-[15px] font-bold text-ink-primary shadow-brutal-sm transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-brutal active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
      >
        <LogIn className="size-[18px]" />
        登入後報名
      </button>
    )
  }

  // ── 可報名：招牌橘 CTA ──
  if (state === 'can-register') {
    return (
      <button
        type="button"
        onClick={handleRegister}
        disabled={isPending}
        className="flex h-12 w-full cursor-pointer items-center justify-center rounded-lg border-2 border-ink-primary bg-brand-orange font-mono text-base font-bold text-white shadow-brutal-sm transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-brutal active:translate-x-0.5 active:translate-y-0.5 active:shadow-none disabled:pointer-events-none disabled:opacity-70"
      >
        {isPending
          ? <Loader2 className="size-5 animate-spin" />
          : '立即報名'}
      </button>
    )
  }

  // ── 已報名：綠色 + 取消連結 ──
  if (state === 'registered') {
    return (
      <div className="flex w-full flex-col gap-2.5">
        <div className="flex h-12 w-full items-center justify-center gap-2 rounded-lg border-2 border-ink-primary bg-[#66BB6A] font-mono text-base font-bold text-white shadow-brutal-sm">
          {isPending
            ? <Loader2 className="size-5 animate-spin" />
            : (
                <>
                  <Check className="size-[18px]" />
                  已報名
                </>
              )}
        </div>
        <button
          type="button"
          onClick={handleCancel}
          disabled={isPending}
          className="flex h-10 w-full cursor-pointer items-center justify-center rounded-lg border-2 border-ink-primary bg-surface-header font-mono text-sm font-bold text-brand-deep-orange shadow-[2px_2px_0px_#1A1A1A] transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-brutal-sm active:translate-x-0.5 active:translate-y-0.5 active:shadow-none disabled:pointer-events-none disabled:opacity-50"
        >
          取消報名
        </button>
      </div>
    )
  }

  // ── 已額滿 ──
  if (state === 'full') {
    return (
      <div className="flex h-12 w-full items-center justify-center rounded-lg border-2 border-[#CCCCCC] bg-[#E8E3DD] font-mono text-base font-bold text-[#999999]">
        已額滿
      </div>
    )
  }

  // ── 已結束 ──
  return (
    <div className="flex h-12 w-full items-center justify-center rounded-lg border-2 border-[#CCCCCC] bg-[#E8E3DD] font-mono text-base font-bold text-[#999999]">
      活動已結束
    </div>
  )
}

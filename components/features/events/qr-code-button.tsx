'use client'

// ============================================================
// QrCodeButton — 我的活動頁的 QR Code 按鈕（Client Component）
// ============================================================
//
// 【用途】
// 在 EventCard 上顯示 QR Code 圖示按鈕
// 點擊後彈出 Dialog 顯示簽到用的 QR Code
//
// 【為什麼是 Client Component？】
// 1. 需要 onClick 處理點擊事件
// 2. 需要 useState 控制 Dialog 開關
// 3. 需要 useEffect 管理 Wake Lock
//
// 【stopPropagation 的必要性】
// EventCard 整張被 <Link> 包住，按鈕在 Link 內部
// 不攔截事件的話，點按鈕會同時觸發 Link 導航
//
// 【Wake Lock API】
// Dialog 開啟時啟用 Wake Lock，防止螢幕在出示 QR Code 時熄滅
// 不支援的瀏覽器會靜默忽略，不影響功能
//
// 【設計稿】
// designs/app-shell.pen → "QR Code Dialog"
// ============================================================

import { QrCode, X } from 'lucide-react'
import { useEffect, useState } from 'react'

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { QrCodeDisplay } from '@/components/features/events/qr-code-display'

type QrCodeButtonProps = {
  qrToken: string
}

export function QrCodeButton({ qrToken }: QrCodeButtonProps): React.ReactElement {
  const [open, setOpen] = useState(false)

  // ── Wake Lock — Dialog 開啟時防止螢幕熄滅 ──────────────
  useEffect(() => {
    if (!open) return

    let wakeLock: WakeLockSentinel | null = null

    async function requestWakeLock(): Promise<void> {
      try {
        wakeLock = await navigator.wakeLock.request('screen')
      } catch {
        // Wake Lock 不支援或被拒絕（例如低電量模式），靜默忽略
      }
    }

    requestWakeLock()

    return (): void => {
      wakeLock?.release()
    }
  }, [open])

  // ── 按鈕點擊 — 攔截 Link 導航，開啟 Dialog ──────────────
  function handleClick(e: React.MouseEvent): void {
    e.preventDefault()
    e.stopPropagation()
    setOpen(true)
  }

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        className="flex size-9 cursor-pointer items-center justify-center rounded-lg border-2 border-ink-primary bg-surface-header shadow-brutal-sm transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-brutal active:translate-x-0.5 active:translate-y-0.5 active:shadow-none md:size-10"
        aria-label="查看簽到 QR Code"
      >
        <QrCode className="size-4.5 text-ink-primary md:size-5" />
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          className="max-w-90 rounded-xl border-2 border-ink-primary bg-surface-header p-7 shadow-brutal"
          showCloseButton={false}
          onPointerDownOutside={e => e.preventDefault()}
          onCloseAutoFocus={e => e.preventDefault()}
        >
          {/* 自訂關閉按鈕 — 加大觸控區域，手機友善 */}
          <DialogClose className="absolute top-3 right-3 flex size-10 cursor-pointer items-center justify-center rounded-lg text-ink-secondary transition-colors hover:bg-surface-muted hover:text-ink-primary">
            <X className="size-5" />
            <span className="sr-only">關閉</span>
          </DialogClose>

          <DialogHeader>
            <DialogTitle className="font-mono text-lg font-bold text-ink-primary">
              簽到 QR Code
            </DialogTitle>
            <DialogDescription className="sr-only">
              請在活動現場出示此 QR Code 完成簽到
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col items-center gap-5">
            <QrCodeDisplay qrToken={qrToken} />
            <p className="text-center text-xs text-[#BBBBBB]">
              建議調高螢幕亮度以利掃描
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

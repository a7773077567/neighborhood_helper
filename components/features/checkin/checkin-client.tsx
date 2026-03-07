'use client'

// ============================================================
// CheckinClient — 簽到頁面主要互動元件（Client Component）
// ============================================================
//
// 【資料流】
// Server Component (page.tsx) 查詢 Prisma → 攤平成可序列化 props → CheckinClient
// 簽到/取消簽到呼叫 Server Action → revalidatePath → Next.js 自動重新 fetch
// → Server Component 傳新 props → CheckinClient re-render
//
// 【為什麼 registrations 不存 state？】
// 因為 revalidatePath 會讓 Server Component 重新查詢，
// 新的 props 會自動傳進來。不需要手動維護 local state。
// useTransition 的 isPending 會在整個流程（Action + re-render）期間為 true。
//
// 【QR 掃描防抖】
// 掃描器每秒讀 10 幀，同一張 QR Code 可能連續觸發多次。
// 用 lastScanRef 記錄最後一次掃描的 token + 時間，
// 3 秒內同一個 token 不會重複處理。
//
// 【響應式差異】
// 桌面：無掃描器，進度條較大，按鈕有文字
// 手機：掃描器開關、「報名名單」標題、按鈕 icon-only
//
// 【設計稿】
// designs/app-shell.pen → "Checkin Page" 系列
// ============================================================

import dayjs from 'dayjs'
import {
  ArrowLeft,
  CameraOff,
  Circle,
  CircleCheckBig,
  ScanLine,
  Undo2,
  UserCheck,
} from 'lucide-react'
import Link from 'next/link'
import { useCallback, useRef, useState, useTransition } from 'react'
import { toast } from 'sonner'

import { QrScanner } from '@/components/features/checkin/qr-scanner'
import { checkinByQrToken, manualCheckin, uncheckIn } from '@/lib/actions/checkin'

// ── Avatar 顏色循環 ────────────────────────────────────────
const AVATAR_COLORS = ['#FFD23F', '#FF7A3D', '#A8D8EA', '#C2FFD6', '#E8C2FF', '#FFD6C2'] as const

// ── 活動狀態顯示設定 ────────────────────────────────────────
const EVENT_STATUS_DISPLAY: Record<string, { label: string, dotColor: string, bg: string, text: string }> = {
  PUBLISHED: { label: '進行中', dotColor: 'bg-[#4CAF50]', bg: 'bg-[#E8F5E9]', text: 'text-[#2E7D32]' },
  ENDED: { label: '已結束', dotColor: 'bg-[#BBBBBB]', bg: 'bg-[#F5F0EB]', text: 'text-[#888888]' },
  DRAFT: { label: '草稿', dotColor: 'bg-[#E65100]', bg: 'bg-[#FFF3E0]', text: 'text-[#E65100]' },
  CANCELLED: { label: '已取消', dotColor: 'bg-[#BBBBBB]', bg: 'bg-[#F5F0EB]', text: 'text-[#888888]' },
}

// ── Props 型別 ────────────────────────────────────────────

type Registration = {
  id: string
  userName: string
  userEmail: string
  attended: boolean
  attendedAt: string | null
  avatarIndex: number
}

type CheckinClientProps = {
  eventId: string
  eventTitle: string
  eventDate: string
  eventStatus: string
  registrations: Registration[]
  attendedCount: number
  totalCount: number
}

// ── 元件 ──────────────────────────────────────────────────

export function CheckinClient({
  eventId,
  eventTitle,
  eventDate,
  eventStatus,
  registrations,
  attendedCount,
  totalCount,
}: CheckinClientProps): React.ReactElement {
  const [scannerOpen, setScannerOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  // QR 掃描防抖 — 同一個 token 3 秒內不重複處理
  const lastScanRef = useRef<{ token: string, time: number } | null>(null)

  const percentage = totalCount > 0
    ? Math.round((attendedCount / totalCount) * 100)
    : 0

  const statusDisplay = EVENT_STATUS_DISPLAY[eventStatus]

  // ── QR 掃描回呼 ──
  const handleScan = useCallback((decodedText: string) => {
    const now = Date.now()
    const last = lastScanRef.current

    if (last && last.token === decodedText && now - last.time < 3000)
      return

    lastScanRef.current = { token: decodedText, time: now }

    startTransition(async () => {
      const result = await checkinByQrToken(decodedText, eventId)
      if (result.success) {
        toast.success(`${result.attendee.name} 簽到成功`)
      }
      else if (result.code === 'ALREADY_CHECKED_IN') {
        toast.warning(result.error)
      }
      else {
        toast.error(result.error)
      }
    })
  }, [eventId])

  // ── 手動簽到 ──
  function handleCheckin(registrationId: string): void {
    startTransition(async () => {
      const result = await manualCheckin(registrationId, eventId)
      if (result.success) {
        toast.success(`${result.attendee.name} 簽到成功`)
      }
      else {
        toast.error(result.error)
      }
    })
  }

  // ── 取消簽到 ──
  function handleUndo(registrationId: string): void {
    startTransition(async () => {
      const result = await uncheckIn(registrationId, eventId)
      if (result.success) {
        toast.warning(`已取消 ${result.attendee.name} 的簽到`)
      }
      else {
        toast.error(result.error)
      }
    })
  }

  return (
    <div className={`mx-auto max-w-4xl px-4 md:px-8 md:py-10 ${scannerOpen ? 'py-3' : 'py-6'}`}>
      {/* ── 返回連結 + 活動資訊（掃描模式時隱藏，騰出手機螢幕空間） ── */}
      <div className={scannerOpen ? 'hidden md:block' : ''}>
        <Link
          href="/admin/events"
          className="inline-flex items-center gap-1.5 text-[13px] text-ink-secondary transition-colors hover:text-brand-orange md:text-sm"
        >
          <ArrowLeft className="size-4" />
          返回活動管理
        </Link>

        <div className="mt-4 flex flex-col gap-2 md:mt-5">
          <div className="flex flex-wrap items-center gap-2.5 md:gap-4">
            <h1 className="font-mono text-lg font-bold text-ink-primary md:text-2xl">
              {eventTitle}
            </h1>
            {statusDisplay && (
              <span className={`inline-flex items-center gap-1 rounded border-[1.5px] border-current px-2 py-0.5 text-[11px] font-semibold md:gap-1.5 md:px-3 md:text-xs ${statusDisplay.bg} ${statusDisplay.text}`}>
                <span className={`size-2 rounded-full ${statusDisplay.dotColor}`} />
                {statusDisplay.label}
              </span>
            )}
          </div>
          <span className="text-[13px] text-ink-secondary md:text-sm">{eventDate}</span>
        </div>
      </div>

      {/* ── 掃描器區域（手機版） ── */}
      {scannerOpen && (
        <div className="mt-2 md:hidden">
          <QrScanner onScan={handleScan} />
        </div>
      )}

      {/* ── FAB 掃描器開關（手機版） ── */}
      <button
        type="button"
        onClick={() => setScannerOpen(!scannerOpen)}
        className="fixed bottom-16 right-4 z-50 flex size-14 cursor-pointer items-center justify-center rounded-full border-2 border-ink-primary bg-white text-brand-orange shadow-brutal-sm transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-brutal active:translate-x-0.5 active:translate-y-0.5 active:shadow-none md:hidden"
      >
        {scannerOpen ? <CameraOff className="size-6" /> : <ScanLine className="size-6" />}
      </button>

      {/* ── 簽到進度 ── */}
      <div className="mt-5 flex flex-col gap-2 md:mt-6 md:gap-2.5">
        {/* 標籤列：百分比合併到右側，手機版省一行 */}
        <div className="flex items-center justify-between">
          <span className="font-mono text-[13px] font-bold text-ink-primary md:text-sm">
            簽到進度
          </span>
          <span className="font-mono text-[13px] font-semibold text-brand-orange md:text-sm">
            {attendedCount}
            {' / '}
            {totalCount}
            {' 人 '}
            <span className="text-[11px] font-normal text-ink-secondary md:text-xs">
              (
              {percentage}
              %)
            </span>
          </span>
        </div>

        {/* 進度條 — 比 EventCard 用的大，獨立實作 */}
        <div className="h-6 rounded border-[3px] border-ink-primary bg-white p-[3px] shadow-[3px_3px_0px_#1A1A1A] md:h-7">
          <div
            className="h-full rounded-[2px] bg-brand-orange transition-all"
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>

      {/* ── 報名名單標題（手機版） ── */}
      <h2 className="mt-5 font-mono text-sm font-bold text-ink-primary md:hidden">
        報名名單
      </h2>

      {/* ── 報名名單 ── */}
      <div className="mt-3 flex flex-col gap-2 md:mt-6 md:gap-3">
        {registrations.length === 0
          ? (
              <div className="rounded-lg border-2 border-dashed border-ink-primary/30 px-6 py-16 text-center">
                <p className="font-mono text-lg font-semibold text-ink-secondary">
                  尚無人報名此活動
                </p>
              </div>
            )
          : registrations.map((reg) => {
              const initial = reg.userName.charAt(0)
              const avatarColor = reg.attended ? AVATAR_COLORS[reg.avatarIndex % AVATAR_COLORS.length] : '#E8E3DD'

              return (
                <div
                  key={reg.id}
                  className={`flex items-center gap-2 rounded-lg p-2 md:gap-4 md:px-5 md:py-3.5 ${
                    reg.attended
                      ? 'border-2 border-[#2E7D32] bg-[#F0FFF0] shadow-[3px_3px_0px_#1A1A1A]'
                      : 'border-2 border-ink-primary bg-surface-header shadow-[3px_3px_0px_#1A1A1A]'
                  }`}
                >
                  {/* 簽到狀態 icon */}
                  {reg.attended
                    ? <CircleCheckBig className="size-5 shrink-0 text-[#2E7D32] md:size-6" />
                    : <Circle className="size-5 shrink-0 text-[#CCCCCC] md:size-6" />}

                  {/* Avatar */}
                  <div
                    className="flex size-8 shrink-0 items-center justify-center rounded-full border-2 border-ink-primary md:size-10"
                    style={{ backgroundColor: avatarColor }}
                  >
                    <span className={`text-sm font-bold md:text-base ${reg.attended ? 'text-ink-primary' : 'text-[#BBBBBB]'}`}>
                      {initial}
                    </span>
                  </div>

                  {/* Info */}
                  <div className="min-w-0 flex-1">
                    <p className={`truncate text-sm font-bold md:text-[15px] ${reg.attended ? 'text-ink-primary' : 'text-ink-primary'}`}>
                      {reg.userName}
                    </p>
                    <p className="truncate text-xs text-ink-secondary md:text-[13px]">
                      {reg.userEmail}
                    </p>
                  </div>

                  {/* 簽到時間（桌面版） */}
                  <span className={`hidden shrink-0 text-[13px] md:block ${reg.attended ? 'text-[#2E7D32]' : 'text-[#999999]'}`}>
                    {reg.attended && reg.attendedAt
                      ? `${dayjs(reg.attendedAt).format('HH:mm')} 簽到`
                      : '未簽到'}
                  </span>

                  {/* 動作按鈕 */}
                  {reg.attended
                    ? (
                        // 取消簽到按鈕
                        <button
                          type="button"
                          onClick={() => handleUndo(reg.id)}
                          disabled={isPending}
                          className="flex shrink-0 cursor-pointer items-center gap-1 rounded-md border-2 border-ink-primary bg-surface-header px-3 py-1.5 text-xs font-semibold text-ink-primary shadow-[2px_2px_0px_#1A1A1A] transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-brutal-sm active:translate-x-0.5 active:translate-y-0.5 active:shadow-none disabled:pointer-events-none disabled:opacity-50 max-md:size-10 max-md:justify-center max-md:p-0"
                        >
                          <Undo2 className="size-3.5 md:size-3.5" />
                          <span className="hidden md:inline">取消</span>
                        </button>
                      )
                    : (
                        // 簽到按鈕
                        <button
                          type="button"
                          onClick={() => handleCheckin(reg.id)}
                          disabled={isPending}
                          className="flex shrink-0 cursor-pointer items-center gap-1 rounded-md border-2 border-ink-primary bg-brand-orange px-3.5 py-1.5 text-xs font-semibold text-white shadow-[2px_2px_0px_#1A1A1A] transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-brutal-sm active:translate-x-0.5 active:translate-y-0.5 active:shadow-none disabled:pointer-events-none disabled:opacity-50 max-md:size-10 max-md:justify-center max-md:p-0"
                        >
                          <UserCheck className="size-3.5 md:size-3.5" />
                          <span className="hidden md:inline">簽到</span>
                        </button>
                      )}
                </div>
              )
            })}
      </div>
    </div>
  )
}

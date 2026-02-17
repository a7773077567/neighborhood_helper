import type { LucideIcon } from 'lucide-react'

import Link from 'next/link'

/**
 * EmptyState — 空狀態提示元件
 *
 * 對照 Pencil 設計：節點 qvgaW
 *
 * 結構：
 *   ┌──────────────────────────┐
 *   │       [icon 56x56]       │  ← 圓形、淡橘底、border
 *   │                          │
 *   │        標題文字           │  ← Space Mono 16px bold
 *   │                          │
 *   │      說明文字（選用）      │  ← Inter 14px
 *   │                          │
 *   │     [ CTA 按鈕（選用）]   │  ← 橘色按鈕
 *   └──────────────────────────┘
 *
 * 用法：
 *   <EmptyState
 *     icon={CalendarX}
 *     title="目前沒有活動"
 *     description="目前沒有即將舉辦的活動，請稍後再來看看！"
 *     actionLabel="建立第一個活動"
 *     actionHref="/admin/events/new"
 *   />
 */

interface EmptyStateProps {
  /** Lucide icon 元件 */
  icon: LucideIcon
  /** 主標題 */
  title: string
  /** 說明文字（選用） */
  description?: string
  /** CTA 按鈕文字（選用，需搭配 actionHref） */
  actionLabel?: string
  /** CTA 按鈕連結（選用，需搭配 actionLabel） */
  actionHref?: string
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  actionHref,
}: EmptyStateProps): React.ReactElement {
  return (
    <div className="flex flex-col items-center gap-4 rounded-lg border-2 border-ink-primary bg-surface-warm p-10 shadow-brutal">
      {/* Icon 容器：56x56 圓形 */}
      <div className="flex size-14 items-center justify-center rounded-full border-2 border-ink-primary bg-brand-light-orange">
        <Icon className="size-6 text-brand-orange" />
      </div>

      {/* 標題 */}
      <h3 className="font-mono text-base font-bold text-ink-primary">
        {title}
      </h3>

      {/* 說明文字 */}
      {description && (
        <p className="max-w-[280px] text-center text-sm leading-relaxed text-ink-body">
          {description}
        </p>
      )}

      {/* CTA 按鈕 */}
      {actionLabel && actionHref && (
        <Link
          href={actionHref}
          className="rounded-lg border-2 border-ink-primary bg-brand-orange px-4 py-2 font-mono text-sm font-semibold text-white transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-brutal-sm active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
        >
          {actionLabel}
        </Link>
      )}
    </div>
  )
}

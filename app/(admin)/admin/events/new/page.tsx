// ============================================================
// 建立活動頁面
// ============================================================
//
// 【架構】「薄頁面」模式
// 頁面本身不做業務邏輯，只負責：
// 1. 提供頁面標題和返回連結
// 2. 把 Server Actions 傳給 EventForm
//
// 【為什麼需要 wrapper 函式】
// Server Actions 是 'use server' 函式，不能直接當 props 傳給
// Client Component。需要在 Server Component 中建立 wrapper，
// 讓 Next.js 知道這個函式要序列化傳給前端。
//
// 實際上 Next.js 允許直接傳 imported Server Action 給 Client
// Component，但加 wrapper 讓型別轉換更明確。
// ============================================================

import type { ActionResult, EventFormValues } from '@/components/features/events/event-form'

import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { EventForm } from '@/components/features/events/event-form'

import { createDraftEvent, createEvent } from '../actions'

// ── Wrapper 函式：橋接 EventFormValues → Server Action ───
// EventForm 傳出 EventFormValues，Server Action 接收 Record<string, unknown>
// wrapper 負責型別轉換，讓兩邊的 interface 各自獨立

async function handlePublish(
  data: EventFormValues,
): Promise<ActionResult> {
  'use server'
  return createEvent(data)
}

async function handleSaveDraft(
  data: EventFormValues,
): Promise<ActionResult> {
  'use server'
  return createDraftEvent(data)
}

// ── 頁面元件 ─────────────────────────────────────────────

export default function NewEventPage(): React.ReactElement {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8 md:px-8 md:py-10">
      {/* ── 返回連結（Task 3.2 討論的方案 1） ── */}
      <Link
        href="/admin/events"
        className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-ink-secondary transition-colors hover:text-ink-primary"
      >
        <ArrowLeft className="size-4" />
        返回活動列表
      </Link>

      {/* ── 標題 ── */}
      <h1 className="mb-8 font-mono text-2xl font-bold text-ink-primary md:text-[28px]">
        建立活動
      </h1>

      {/* ── 表單 ── */}
      <EventForm
        mode="create"
        onSubmit={handlePublish}
        onSaveDraft={handleSaveDraft}
      />
    </div>
  )
}

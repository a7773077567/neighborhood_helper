'use client'

import Link from 'next/link'
import { LogOut, Settings, User } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

/* ─────────────────────────────────────────────
 * 型別定義
 * ───────────────────────────────────────────── */

interface UserMenuProps {
  /** 使用者姓名，用來產生 initials */
  name?: string
  /** 使用者 email，顯示在選單頂部 */
  email?: string
}

/* ─────────────────────────────────────────────
 * 工具函式：從姓名產生 initials
 *
 * "Pan Jie" → "PJ"
 * "王小明"  → "王"（中文名通常只取第一個字）
 * ───────────────────────────────────────────── */
function getInitials(name: string): string {
  return name
    .split(' ')
    .map((word) => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

/* ─────────────────────────────────────────────
 * UserMenu 元件
 *
 * 使用 shadcn/ui 的 DropdownMenu，觸發器是橘色頭像圓圈。
 * 目前使用 placeholder 資料，未來接上 Auth 後傳入真實使用者資料。
 * ───────────────────────────────────────────── */
export function UserMenu({
  name = 'PJ',
  email = 'pj@example.com',
}: UserMenuProps): React.ReactElement {
  return (
    <DropdownMenu>
      {/*
       * DropdownMenu 是 uncontrolled（不需要 useState）。
       * 因為我們不需要在程式中主動開關它，
       * Radix 自己管理開關狀態就夠了。
       * （對比 MobileNav 的 Sheet 需要 controlled，
       *   因為點擊連結後要手動關閉。）
       */}

      <DropdownMenuTrigger asChild>
        {/*
         * 用 <button> 當觸發器，而不是 shadcn 的 Avatar 元件。
         * 原因：我們需要 Neobrutalism 的 2px 邊框樣式，
         * 直接用 button + 自訂 className 比覆寫 Avatar 的樣式更簡潔。
         */}
        <button
          className="flex size-8 items-center justify-center rounded-full border-2 border-ink-primary bg-brand-orange focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-orange focus-visible:ring-offset-2 md:size-9"
          aria-label="使用者選單"
        >
          {/*
           * focus:outline-none → 移除瀏覽器預設的 outline
           * focus-visible:ring-2 → 用鍵盤 Tab 聚焦時顯示橘色外圈
           *
           * focus vs focus-visible 的差異：
           *   focus         → 任何方式聚焦都觸發（滑鼠點擊也會）
           *   focus-visible → 只有鍵盤操作聚焦才觸發
           * 所以用 focus-visible 讓滑鼠點擊不會出現醜醜的 ring。
           */}
          <span className="font-mono text-xs font-semibold text-white md:text-sm">
            {getInitials(name)}
          </span>
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-56">
        {/*
         * align="end"：選單靠右對齊（因為觸發器在 Header 最右邊）
         * w-56 → width: 224px
         *
         * 如果不設 align="end"，選單會靠左對齊，
         * 可能會超出螢幕右邊界。
         */}

        {/* 使用者資訊區（不可點擊） */}
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col gap-1">
            <p className="text-sm font-semibold">{name}</p>
            <p className="text-xs text-muted-foreground">{email}</p>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        {/* 導覽選項 */}
        <DropdownMenuItem asChild>
          {/*
           * asChild 的用法跟 SheetTrigger 一樣。
           * DropdownMenuItem 預設渲染 <div>，
           * 加上 asChild 後把行為委派給裡面的 <Link>，
           * 這樣點擊就能正確導覽（而不是只關閉選單）。
           */}
          <Link href="/profile">
            <User className="mr-2 size-4" />
            個人資料
          </Link>
        </DropdownMenuItem>

        <DropdownMenuItem asChild>
          <Link href="/settings">
            <Settings className="mr-2 size-4" />
            設定
          </Link>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        {/* 登出（未來接上 Auth 的 signOut 函式） */}
        <DropdownMenuItem className="text-destructive focus:text-destructive">
          {/*
           * text-destructive → 紅色文字，暗示這是「危險」操作
           * focus:text-destructive → hover/focus 時也保持紅色
           *   （不加的話 focus 時會被 DropdownMenuItem 的預設樣式覆蓋成黑色）
           */}
          <LogOut className="mr-2 size-4" />
          登出
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

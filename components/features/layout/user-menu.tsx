'use client'

import { LogOut, Settings, User } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { signOutAction } from '@/lib/auth/actions'

/* ─────────────────────────────────────────────
 * 型別定義
 * ───────────────────────────────────────────── */

interface UserMenuProps {
  /** 使用者姓名，用來產生 initials */
  name: string
  /** 使用者 email，顯示在選單頂部 */
  email: string
  /** 使用者大頭照 URL（Google OAuth 提供），沒有時顯示 initials */
  image?: string | null
}

// 【改造】name、email 改為 required（Header 傳入真實資料，不再需要預設值）
// 【改造】新增 image prop，有照片時顯示圓形大頭照

/* ─────────────────────────────────────────────
 * 工具函式：從姓名產生 initials
 *
 * "Pan Jie" → "PJ"
 * "王小明"  → "王"（中文名通常只取第一個字）
 * ───────────────────────────────────────────── */
function getInitials(name: string): string {
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

/* ─────────────────────────────────────────────
 * UserMenu 元件
 *
 * 使用 shadcn/ui 的 DropdownMenu，觸發器是頭像圓圈。
 *
 * 【改造重點】
 * - name/email：由 Header 傳入真實 session 資料（不再有預設值）
 * - image：有 Google 大頭照時顯示照片，沒有時顯示 initials
 * - 登出：用 <form action={signOutAction}> 觸發 Server Action
 * ───────────────────────────────────────────── */
export function UserMenu({
  name,
  email,
  image,
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
         * 【改造】頭像觸發器現在支援兩種模式：
         * 1. 有 image → 圓形大頭照（Next.js Image 元件）
         * 2. 沒有 image → 橘色圓圈 + initials 文字（原有樣式）
         */}
        <button
          className="flex size-8 items-center justify-center overflow-hidden rounded-full border-2 border-ink-primary bg-brand-orange focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-orange focus-visible:ring-offset-2 md:size-9 cursor-pointer"
          aria-label="使用者選單"
        >
          {image ? (
            // 【改造】有大頭照時，用 Next.js Image 顯示
            // fill + object-cover 確保圖片填滿圓形區域不變形
            // rounded-full 由外層 button 的 overflow-hidden 裁切
            <Image
              src={image}
              alt={name}
              width={36}
              height={36}
              className="size-full object-cover"
            />
          ) : (
            // 沒有大頭照時，顯示 initials（維持原有樣式）
            <span className="font-mono text-xs font-semibold text-white md:text-sm">
              {getInitials(name)}
            </span>
          )}
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-56">
        {/*
         * align="end"：選單靠右對齊（因為觸發器在 Header 最右邊）
         * w-56 → width: 224px
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
        <DropdownMenuItem asChild className="cursor-pointer">
          <Link href="/profile">
            <User className="mr-2 size-4" />
            個人資料
          </Link>
        </DropdownMenuItem>

        <DropdownMenuItem asChild className="cursor-pointer">
          <Link href="/settings">
            <Settings className="mr-2 size-4" />
            設定
          </Link>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        {/* 【改造】登出 — 用 form + Server Action 取代 placeholder
         *
         * 為什麼用 <form> 而不是 onClick？
         * - signOut() 必須在 server 端執行（存取 cookie、清除 session）
         * - Client Component 不能直接呼叫 server-only 函式
         * - <form action={serverAction}> 是 Next.js 官方推薦的做法
         *   它會自動發 POST request 給 server，觸發 Server Action
         *
         * 額外好處：即使 JavaScript 還沒載入（SSR hydration 前），
         * 表單提交仍然能運作（Progressive Enhancement）。
         */}
        <DropdownMenuItem asChild className="cursor-pointer">
          <form action={signOutAction} className="w-full">
            <button
              type="submit"
              className="flex w-full items-center text-destructive"
            >
              <LogOut className="mr-2 size-4" />
              登出
            </button>
          </form>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

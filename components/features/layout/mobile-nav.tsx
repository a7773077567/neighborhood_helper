'use client'

/**
 * 'use client' 指令：
 * 告訴 Next.js 這個元件要在瀏覽器端執行。
 * 必須放在檔案最頂端，在任何 import 之前。
 *
 * 為什麼需要？因為這個元件用到：
 * - useState（管理 Sheet 的開關狀態）
 * - usePathname（讀取瀏覽器的目前網址）
 * - onClick（處理使用者的點擊事件）
 * 這些功能都只能在瀏覽器中執行。
 */

import {
  Bird,
  Calendar,
  Menu,
  Settings,
  Ticket,
  Trophy,
  X,
} from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'

/* ─────────────────────────────────────────────
 * 型別定義
 * ───────────────────────────────────────────── */

type HeaderVariant = 'public' | 'dashboard' | 'admin'

interface MobileNavItem {
  label: string
  href: string
  /** Lucide icon 元件。型別是「接受 className 的 React 元件」 */
  icon: React.ComponentType<{ className?: string }>
  /** 是否用橘色強調（管理後台），且用分隔線隔開 */
  highlight?: boolean
}

interface MobileNavProps {
  variant?: HeaderVariant
}

/* ─────────────────────────────────────────────
 * 手機版導覽項目設定
 *
 * 跟 Header 的 NAV_ITEMS 類似，但多了 icon 屬性。
 * 手機版的選單有圖示，桌面版沒有。
 * ───────────────────────────────────────────── */
const MOBILE_NAV_ITEMS: Record<HeaderVariant, MobileNavItem[]> = {
  public: [
    { label: '活動', href: '/events', icon: Calendar },
    { label: '排行榜', href: '/leaderboard', icon: Trophy },
  ],
  dashboard: [
    { label: '活動', href: '/events', icon: Calendar },
    { label: '排行榜', href: '/leaderboard', icon: Trophy },
    { label: '我的活動', href: '/my-events', icon: Ticket },
  ],
  admin: [
    { label: '活動', href: '/events', icon: Calendar },
    { label: '排行榜', href: '/leaderboard', icon: Trophy },
    { label: '我的活動', href: '/my-events', icon: Ticket },
    { label: '管理後台', href: '/admin', icon: Settings, highlight: true },
  ],
}

/* ─────────────────────────────────────────────
 * MobileNav 元件
 *
 * 使用 shadcn/ui 的 Sheet 元件，結構是：
 *
 *   <Sheet>                    ← 狀態容器
 *     <SheetTrigger>           ← 觸發按鈕（漢堡圖示）
 *     <SheetContent>           ← 滑出面板
 *       <SheetHeader>          ← 面板標題區
 *       <nav>                  ← 導覽連結
 *     </SheetContent>
 *   </Sheet>
 *
 * Sheet 本質上是 Radix UI 的 Dialog，但從側邊滑入。
 * ───────────────────────────────────────────── */
export function MobileNav({ variant = 'public' }: MobileNavProps): React.ReactElement {
  /**
   * useState<boolean>(false)：
   * - open = 目前的值（true = 打開，false = 關閉）
   * - setOpen = 修改值的函式
   * - false = 初始值（一開始是關閉的）
   *
   * 為什麼要自己管理狀態（controlled mode）？
   * 因為點擊導覽連結後，我們要手動關閉 Sheet。
   * 如果不管理，Sheet 會在頁面切換後仍然開著。
   */
  const [open, setOpen] = useState(false)

  /**
   * usePathname()：Next.js 提供的 Hook，回傳目前的網址路徑。
   * 例如使用者在 /events 頁面 → pathname = '/events'
   * 我們用它來判斷哪個導覽項目要顯示「active」狀態。
   */
  const pathname = usePathname()

  const navItems = MOBILE_NAV_ITEMS[variant]

  /** 一般項目（活動、排行榜、我的活動） */
  const regularItems = navItems.filter(item => !item.highlight)
  /** 強調項目（管理後台），會用分隔線隔開 */
  const highlightedItems = navItems.filter(item => item.highlight)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      {/*
       * open={open}：把我們的 state 傳給 Sheet（controlled mode）
       * onOpenChange={setOpen}：當 Sheet 要開或關時，更新我們的 state
       *   → 點擊觸發按鈕 → onOpenChange(true) → setOpen(true) → 打開
       *   → 點擊 overlay  → onOpenChange(false) → setOpen(false) → 關閉
       */}

      <SheetTrigger asChild>
        {/*
         * asChild：
         * 不渲染 SheetTrigger 自己的 <button>，
         * 而是把觸發行為「委派」給裡面的子元素。
         * 這樣我們可以用自己的 <Button> 元件來當觸發器。
         *
         * 如果不用 asChild，HTML 會變成：
         *   <button>        ← SheetTrigger 的
         *     <button>      ← 我們的 Button
         *   </button>
         * 按鈕套按鈕是不合法的 HTML！
         */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          aria-label="開啟選單"
        >
          <Menu className="size-5" />
        </Button>
      </SheetTrigger>

      <SheetContent
        side="left"
        showCloseButton={false}
        className="w-[280px] gap-0 p-0"
      >
        {/*
         * side="left"：面板從左側滑入（預設是右側）
         * showCloseButton={false}：不用預設的 X 按鈕，我們自己放
         * w-[280px]：固定寬度 280px（對應 Pencil 設計）
         * gap-0 p-0：清除 SheetContent 的預設間距和 padding
         */}

        {/* ── Sheet Header：Logo + 關閉按鈕 ── */}
        <SheetHeader className="flex-row items-center justify-between px-6 pt-6 pb-4">
          {/*
           * SheetHeader 預設是 flex-col（垂直排列）。
           * 加上 flex-row 改為水平排列，讓 Logo 和 X 按鈕在同一行。
           */}
          <SheetTitle className="flex items-center gap-2">
            {/*
             * SheetTitle 是無障礙必要的元素。
             * 螢幕閱讀器會讀出這個標題，告訴使用者這是什麼面板。
             * 如果沒有 SheetTitle，Radix UI 會在 console 發出警告。
             */}
            <Bird className="size-6 text-brand-orange" />
            <span className="font-mono text-sm font-bold">
              雞婆鄰里互助會
            </span>
          </SheetTitle>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => setOpen(false)}
            aria-label="關閉選單"
          >
            {/*
             * onClick={() => setOpen(false)}：
             * 箭頭函式，點擊時呼叫 setOpen(false) 來關閉 Sheet。
             *
             * 為什麼用 () => setOpen(false) 而不是 setOpen(false)？
             * 因為 onClick 需要的是一個「函式」（之後才呼叫），
             * 不是一個「值」（馬上執行）。
             * setOpen(false) 會立刻執行，() => setOpen(false) 則會等到點擊時才執行。
             */}
            <X className="size-5" />
          </Button>
        </SheetHeader>

        {/* ── 分隔線（2px，對應 Pencil 設計） ── */}
        <div className="h-0.5 bg-ink-primary" />

        {/* ── 導覽項目 ── */}
        <nav className="py-2">
          {regularItems.map((item) => {
            /**
             * 把 item.icon 賦值給大寫的 Icon。
             * React 的規則：元件名稱必須大寫開頭。
             * 小寫的會被當成 HTML 標籤（如 <div>），不是 React 元件。
             */
            const Icon = item.icon

            /**
             * 判斷 active 狀態：
             * - pathname === item.href → 完全匹配（如 /events）
             * - pathname.startsWith(item.href + '/') → 子路徑匹配（如 /events/123）
             */
            const isActive
              = pathname === item.href || pathname.startsWith(`${item.href}/`)

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-3 px-6 py-3 text-sm ${
                  isActive
                    ? 'bg-surface-light-orange font-semibold text-ink-primary'
                    : 'text-ink-secondary'
                }`}
              >
                {/*
                 * onClick={() => setOpen(false)}：
                 * 點擊連結後關閉 Sheet。
                 * 如果不加這個，頁面會切換但 Sheet 仍然開著。
                 *
                 * 條件 className：
                 * active → 淡橘背景 + 粗體黑字
                 * 一般  → 灰字
                 */}
                <Icon
                  className={`size-5 ${isActive ? 'text-brand-orange' : ''}`}
                />
                {item.label}
              </Link>
            )
          })}

          {/* 強調項目（管理後台）：用分隔線隔開 */}
          {highlightedItems.length > 0 && (
            <>
              {/*
               * <> ... </> 是 React Fragment 的簡寫。
               * 它不會產生任何 HTML 元素，只是用來包裝多個子元素。
               * React 的規則：.map() 或條件渲染必須回傳「一個」元素。
               * Fragment 讓我們包裝多個元素而不多加一層 <div>。
               */}
              <div className="mx-6 my-2 h-px bg-border" />
              {highlightedItems.map((item) => {
                const Icon = item.icon
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-3 px-6 py-3 text-sm font-medium text-brand-orange"
                  >
                    <Icon className="size-5" />
                    {item.label}
                  </Link>
                )
              })}
            </>
          )}
        </nav>
      </SheetContent>
    </Sheet>
  )
}

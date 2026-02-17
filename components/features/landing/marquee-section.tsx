'use client'

/**
 * MarqueeSection — 跑馬燈區塊（Client Component）
 *
 * 對照 Pencil 設計：桌面版 hHfa3 / 手機版 MIbbS 內的 Marquee
 *
 * 結構：
 *   ┌──────────────────────────────────────────────┐
 *   │  Row 1  ← ← ← ← ← ← ← ← ← ← ←           │
 *   │  Row 2  ← ← ← ← ← ← ← ← ← ← ←           │
 *   │  Row 3  ← ← ← ← ← ← ← ← ← ← ←           │
 *   └──────────────────────────────────────────────┘
 *   每 20 秒全部反轉方向（Gumroad 風格）
 *
 * 每個 item = 彩色 icon + 白色藥丸按鈕
 * 3 列同方向滾動，速度不同製造層次感，定時反轉增加動態。
 *
 * 為什麼是 Client Component？
 *   react-fast-marquee 內部用 useRef + useEffect 來計算滾動動畫，
 *   必須在瀏覽器執行。方向反轉也需要 useState。
 */

import { useEffect, useState } from 'react'

import {
  Award,
  BookOpen,
  Calendar,
  Code,
  Coffee,
  Gamepad2,
  Globe,
  Hammer,
  Hexagon,
  Lightbulb,
  MapPin,
  MessageCircle,
  Mic,
  Share2,
  Sparkles,
  Sprout,
  Target,
  TrendingUp,
  Users,
  Wrench,
  Zap,
} from 'lucide-react'
import Marquee from 'react-fast-marquee'

import type { LucideIcon } from 'lucide-react'

/* ─────────────────────────────────────────────
 * 型別 & 資料定義
 * ───────────────────────────────────────────── */

interface MarqueeItemData {
  label: string
  icon: LucideIcon
  iconColor: string
}

/**
 * Row 1：向左滾動，speed=40
 *
 * 對照 Pencil 節點 g9uoD
 */
const ROW_1_ITEMS: MarqueeItemData[] = [
  { label: '挖掘在地講者', icon: Mic, iconColor: '#FF7A3D' },
  { label: '遊戲化參與', icon: Gamepad2, iconColor: '#FFD23F'},
  { label: '串連社群', icon: Users, iconColor: '#4ECDC4' },
  { label: '在地知識共享', icon: BookOpen, iconColor: '#FF6B6B' },
  { label: '社群活動', icon: Calendar, iconColor: '#8B5CF6' },
  { label: '交流討論', icon: MessageCircle, iconColor: '#14B8A6' },
  { label: '知識共享', icon: Lightbulb, iconColor: '#D946EF' },
]

/**
 * Row 2：向右滾動，speed=30
 *
 * 對照 Pencil 節點 ZKMRf（含 80px spacer 製造錯落感）
 */
const ROW_2_ITEMS: MarqueeItemData[] = [
  { label: '累積社群資產', icon: TrendingUp, iconColor: '#FF1493' },
  { label: '技術分享', icon: Code, iconColor: '#7C3AED' },
  { label: '台南在地', icon: MapPin, iconColor: '#10B981' },
  { label: 'Build Together', icon: Hammer, iconColor: '#3B82F6'},
  { label: '目標達成', icon: Target, iconColor: '#F97316' },
  { label: '成就解鎖', icon: Award, iconColor: '#A855F7' },
  { label: '經驗分享', icon: Share2, iconColor: '#059669' },
]

/**
 * Row 3：向左滾動，speed=35
 *
 * 對照 Pencil 節點 4udpQ（含 30px spacer 製造錯落感）
 */
const ROW_3_ITEMS: MarqueeItemData[] = [
  { label: 'GDG Tainan', icon: Hexagon, iconColor: '#F59E0B' },
  { label: '一起成長', icon: Sprout, iconColor: '#EC4899' },
  { label: '開放社群', icon: Globe, iconColor: '#06B6D4' },
  { label: '激發創意', icon: Sparkles, iconColor: '#EF4444' },
  { label: '咖啡聊天', icon: Coffee, iconColor: '#92400E'},
  { label: '創意激盪', icon: Zap, iconColor: '#DC2626' },
  { label: '問題解決', icon: Wrench, iconColor: '#2563EB' },
]

/* ─────────────────────────────────────────────
 * MarqueeItem 子元件
 *
 * 對照 Pencil 的 item 結構：
 *   [icon 32px] + [白色藥丸: padding 10/24, border 1px #E0E0E0, text 16px]
 * ───────────────────────────────────────────── */

function MarqueeItem({ label, icon: Icon, iconColor }: MarqueeItemData): React.ReactElement {
  return (
    <div className="flex items-center gap-2.5">
      {/* 彩色 icon */}
      <Icon
        className="size-8 shrink-0"
        style={{ color: iconColor }}
      />
      {/* 白色藥丸 — 平面預設，hover 浮起 */}
      <span className="whitespace-nowrap rounded-full border border-[#E0E0E0] bg-white px-6 py-2.5 text-sm font-medium text-ink-primary transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-brutal-sm md:text-base">
        {label}
      </span>
    </div>
  )
}

/* ─────────────────────────────────────────────
 * 方向反轉間隔（毫秒）
 *
 * Gumroad 風格：全部同方向滾動，定時反轉。
 * 20 秒是個不會太頻繁、又能注意到的節奏。
 * ───────────────────────────────────────────── */
const REVERSE_INTERVAL_MS = 20_000

/* ─────────────────────────────────────────────
 * MarqueeSection 主元件
 *
 * 對照 Pencil 設計：
 *   外層 (hHfa3): bg 統一底色, overflow-hidden, py-10
 *   Band (lSnbW): 3 列，gap-4 (16px)
 *
 * react-fast-marquee 設定：
 *   autoFill: 自動填滿寬度（不留空白）
 *   pauseOnHover: 滑鼠移入暫停
 *
 * 動態行為（見 design.md §7）：
 *   3 列同方向，每 20 秒反轉
 * ───────────────────────────────────────────── */

export function MarqueeSection(): React.ReactElement {
  const [direction, setDirection] = useState<'left' | 'right'>('left')

  useEffect(() => {
    const timer = setInterval(() => {
      setDirection(prev => (prev === 'left' ? 'right' : 'left'))
    }, REVERSE_INTERVAL_MS)
    return () => clearInterval(timer)
  }, [])

  return (
    <section className="overflow-hidden py-8 md:py-10">
      <div className="flex flex-col gap-4">
        {/* Row 1：speed=40 */}
        <Marquee speed={40} direction={direction} pauseOnHover autoFill>
          <div className="flex items-center gap-10 px-5 py-2">
            {ROW_1_ITEMS.map(item => (
              <MarqueeItem key={item.label} {...item} />
            ))}
          </div>
        </Marquee>

        {/* Row 2：speed=30 */}
        <Marquee speed={30} direction={direction} pauseOnHover autoFill>
          <div className="flex items-center gap-10 px-5 py-2">
            {ROW_2_ITEMS.map(item => (
              <MarqueeItem key={item.label} {...item} />
            ))}
          </div>
        </Marquee>

        {/* Row 3：speed=35 */}
        <Marquee speed={35} direction={direction} pauseOnHover autoFill>
          <div className="flex items-center gap-10 px-5 py-2">
            {ROW_3_ITEMS.map(item => (
              <MarqueeItem key={item.label} {...item} />
            ))}
          </div>
        </Marquee>
      </div>
    </section>
  )
}

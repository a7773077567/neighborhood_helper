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
 *   3 列同方向、同速度持續滾動，hover 全部一起暫停。
 *
 * 每個 item = 彩色 icon + 白色藥丸按鈕
 *
 * 為什麼是 Client Component？
 *   react-fast-marquee 內部用 useRef + useEffect 來計算滾動動畫，
 *   必須在瀏覽器執行。hover 暫停需要 useState。
 */

import type { LucideIcon } from 'lucide-react'

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
import { useState } from 'react'

import Marquee from 'react-fast-marquee'

/* ─────────────────────────────────────────────
 * 型別 & 資料定義
 * ───────────────────────────────────────────── */

interface MarqueeItemData {
  label: string
  icon: LucideIcon
  iconColor: string
}

/** Row 1 — 對照 Pencil 節點 g9uoD */
const ROW_1_ITEMS: MarqueeItemData[] = [
  { label: '挖掘在地講者', icon: Mic, iconColor: '#FF7A3D' },
  { label: '遊戲化參與', icon: Gamepad2, iconColor: '#FFD23F' },
  { label: '串連社群', icon: Users, iconColor: '#4ECDC4' },
  { label: '在地知識共享', icon: BookOpen, iconColor: '#FF6B6B' },
  { label: '社群活動', icon: Calendar, iconColor: '#8B5CF6' },
  { label: '交流討論', icon: MessageCircle, iconColor: '#14B8A6' },
  { label: '知識共享', icon: Lightbulb, iconColor: '#D946EF' },
]

/** Row 2 — 對照 Pencil 節點 ZKMRf */
const ROW_2_ITEMS: MarqueeItemData[] = [
  { label: '累積社群資產', icon: TrendingUp, iconColor: '#FF1493' },
  { label: '技術分享', icon: Code, iconColor: '#7C3AED' },
  { label: '台南在地', icon: MapPin, iconColor: '#10B981' },
  { label: 'Build Together', icon: Hammer, iconColor: '#3B82F6' },
  { label: '目標達成', icon: Target, iconColor: '#F97316' },
  { label: '成就解鎖', icon: Award, iconColor: '#A855F7' },
  { label: '經驗分享', icon: Share2, iconColor: '#059669' },
]

/** Row 3 — 對照 Pencil 節點 4udpQ */
const ROW_3_ITEMS: MarqueeItemData[] = [
  { label: 'GDG Tainan', icon: Hexagon, iconColor: '#F59E0B' },
  { label: '一起成長', icon: Sprout, iconColor: '#EC4899' },
  { label: '開放社群', icon: Globe, iconColor: '#06B6D4' },
  { label: '激發創意', icon: Sparkles, iconColor: '#EF4444' },
  { label: '咖啡聊天', icon: Coffee, iconColor: '#92400E' },
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
 * MarqueeSection 主元件
 *
 * 對照 Pencil 設計：
 *   外層 (hHfa3): bg 統一底色, overflow-hidden, py-10
 *   Band (lSnbW): 3 列，gap-4 (16px)
 *
 * react-fast-marquee 設定：
 *   speed: 35（3 列統一）
 *   direction: left（固定向左）
 *   autoFill: 自動填滿寬度（不留空白）
 *   play: hover 外層容器時全部一起暫停
 * ───────────────────────────────────────────── */

export function MarqueeSection(): React.ReactElement {
  const [play, setPlay] = useState(true)

  return (
    <section
      className="overflow-hidden py-8 md:py-10"
      onMouseEnter={() => setPlay(false)}
      onMouseLeave={() => setPlay(true)}
    >
      <div className="flex flex-col gap-4">
        {/* Row 1 */}
        <Marquee speed={35} direction="left" play={play} autoFill>
          <div className="flex items-center gap-10 px-5 py-2">
            {ROW_1_ITEMS.map(item => (
              <MarqueeItem key={item.label} {...item} />
            ))}
          </div>
        </Marquee>

        {/* Row 2 */}
        <Marquee speed={35} direction="left" play={play} autoFill>
          <div className="flex items-center gap-10 px-5 py-2">
            {ROW_2_ITEMS.map(item => (
              <MarqueeItem key={item.label} {...item} />
            ))}
          </div>
        </Marquee>

        {/* Row 3 */}
        <Marquee speed={35} direction="left" play={play} autoFill>
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

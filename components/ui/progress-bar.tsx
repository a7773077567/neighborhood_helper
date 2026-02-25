// ============================================================
// ProgressBar — Neobrutalism 風格進度條
// ============================================================
//
// 設計稿規格（designs/app-shell.pen "Progress Bar BG"）：
//   外框: height 8px, cornerRadius 2, padding 2, border 2px #1A1A1A
//   陰影: 2px 2px 0px #1A1A1A
//   背景: #E8E3DD
//   Fill: #FF7A3D (brand-orange), cornerRadius 1, height fill_container
//
// Tailwind 對應（CSS border-box，height 包含 border + padding + content）：
//   h-3 (12px) = border 4px + content 8px（無 padding）
//   → fill 高度 8px，橘色飽滿
//
// 注意：圓角用明確的 rounded-[2px]，不用 rounded-sm
//   專案的 --radius-sm = 4px（8px - 4px），在小元件上過大
// ============================================================

type ProgressBarProps = {
  /** 0-100 的百分比 */
  percentage: number
  className?: string
}

export function ProgressBar({ percentage, className = '' }: ProgressBarProps): React.ReactElement {
  const clampedPercentage = Math.min(Math.max(percentage, 0), 100)

  return (
    <div className={`h-3 rounded-[2px] border-2 border-ink-primary bg-[#E8E3DD] shadow-[2px_2px_0px_#1A1A1A] ${className}`}>
      <div
        className="h-full rounded-[1px] bg-brand-orange transition-all"
        style={{ width: `${clampedPercentage}%` }}
      />
    </div>
  )
}

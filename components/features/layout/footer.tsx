import { Copyright } from 'lucide-react'
import Link from 'next/link'

/* ─────────────────────────────────────────────
 * Footer 連結設定
 *
 * 用陣列管理，方便未來新增或調整連結，
 * 不需要去 JSX 裡面找。
 * ───────────────────────────────────────────── */
const FOOTER_LINKS = [
  { label: '關於我們', href: '/about' },
  { label: '聯絡方式', href: '/contact' },
] as const
/*
 * `as const` 的作用：
 *   把陣列和物件的值「鎖死」為字面型別（literal types）。
 *   不加的話：label 的型別是 string
 *   加了之後：label 的型別是 '關於我們' | '聯絡方式'
 *   這裡用主要是防止意外修改（readonly），型別更精確是附帶好處。
 */

/* ─────────────────────────────────────────────
 * Footer 元件（Server Component）
 *
 * 對照 Pencil 設計（節點 0PRG0）：
 *
 * 桌面版（≥ 768px）：
 *   [📍 GDG Tainan — 雞婆鄰里互助會]  .....  [關於我們] [聯絡方式] [© 2026]
 *
 * 手機版（< 768px）：Pencil 設計（節點 CKnvx）
 *   [📍 GDG Tainan — 雞婆鄰里互助會]
 *   [關於我們] [聯絡方式]
 *   [© 2026]
 *
 * 不需要 'use client'：Footer 沒有任何互動狀態，
 * 純粹是靜態內容 + Link（Server Component 的 Link 不需要 JS）。
 * ───────────────────────────────────────────── */
export function Footer(): React.ReactElement {
  return (
    <footer className="sticky bottom-0 z-40 border-t-2 border-ink-primary bg-surface-footer px-4 py-2.5 md:flex md:h-14 md:items-center md:justify-between md:px-6 md:py-0">
      {/* ── 手機版：單行精簡 ── */}
      <div className="flex items-center justify-center gap-1.5 md:justify-start">
        <Copyright className="size-3.5 shrink-0 text-ink-footer-muted md:hidden" />
        <span className="font-mono text-[13px] text-ink-footer-light">
          {/* 手機版只顯示版權 icon + 年份 + 品牌名，桌面版顯示完整名稱 */}
          <span className="md:hidden">2026 GDG Tainan</span>
          <span className="hidden md:inline">GDG Tainan — 雞婆鄰里互助會</span>
        </span>
      </div>

      {/* ── 桌面版：右側連結 + 版權 ── */}
      <div className="hidden items-center gap-4 md:flex">
        {FOOTER_LINKS.map(link => (
          <Link
            key={link.href}
            href={link.href}
            className="text-[13px] text-ink-footer-light hover:text-ink-primary"
          >
            {link.label}
          </Link>
        ))}
        <span className="text-[13px] text-ink-footer-muted">
          © 2026
        </span>
      </div>
    </footer>
  )
}

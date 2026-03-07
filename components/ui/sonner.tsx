'use client'

// ============================================================
// Toaster — Neobrutalism 風格 Toast 通知
// ============================================================
//
// 【位置】top-center，手機掃描簽到時不會被擋住
//
// 【色彩分類】
//   success: 綠底 #E8F5E9 + 綠字 #2E7D32（簽到成功）
//   warning: 橘底 #FFF3E0 + 深橘字 #E65100（重複簽到等）
//   error:   紅底 #FFEBEE + 紅字 #C62828（無效 QR、權限不足等）
//   normal:  沿用 popover 色系
//
// 【Neobrutalism】
//   border 2px + shadow 3px 3px + font-mono
//   透過 toastOptions.classNames 覆寫 Sonner 預設樣式
//
// 【設計稿】
// designs/app-shell.pen → "Toast — Success / Warning / Error"
// ============================================================

import type { ToasterProps } from 'sonner'
import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  TriangleAlertIcon,
} from 'lucide-react'
import { useTheme } from 'next-themes'
import { Toaster as Sonner } from 'sonner'

function Toaster({ ...props }: ToasterProps) {
  const { theme = 'system' } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps['theme']}
      className="toaster group"
      position="top-center"
      icons={{
        success: <CircleCheckIcon className="size-4" />,
        info: <InfoIcon className="size-4" />,
        warning: <TriangleAlertIcon className="size-4" />,
        error: <OctagonXIcon className="size-4" />,
        loading: <Loader2Icon className="size-4 animate-spin" />,
      }}
      toastOptions={{
        classNames: {
          toast: '!border-2 !shadow-[3px_3px_0px_#1A1A1A] !font-mono !text-sm',
          success: '!bg-[#E8F5E9] !text-[#2E7D32] !border-[#2E7D32]',
          warning: '!bg-[#FFF3E0] !text-[#E65100] !border-[#E65100]',
          error: '!bg-[#FFEBEE] !text-[#C62828] !border-[#C62828]',
        },
      }}
      style={
        {
          '--normal-bg': 'var(--popover)',
          '--normal-text': 'var(--popover-foreground)',
          '--normal-border': 'var(--border)',
          '--border-radius': '8px',
        } as React.CSSProperties
      }
      {...props}
    />
  )
}

export { Toaster }

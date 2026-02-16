import type { Metadata } from 'next'
import { Inter, Space_Mono } from 'next/font/google'
import { Toaster } from '@/components/ui/sonner'
import './globals.css'

/**
 * next/font/google 會在建構時下載字型，避免使用者載入頁面時閃爍。
 *
 * variable 屬性：產生一個 CSS 變數名稱，讓 Tailwind 可以引用。
 *   Inter      → --font-inter       → globals.css 裡的 --font-sans
 *   Space_Mono → --font-space-mono   → globals.css 裡的 --font-mono
 */
const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
})

const spaceMono = Space_Mono({
  variable: '--font-space-mono',
  subsets: ['latin'],
  weight: ['400', '700'], // STYLE_GUIDE: 400(Regular) 和 700(Bold)
})

export const metadata: Metadata = {
  title: 'Neighborhood Helper — GDG Tainan 社群活動平台',
  description: '挖掘在地講者、鼓勵社群參與、串連台南科技社群',
}

/**
 * Root Layout — 所有頁面共用的最外層框架
 *
 * 這裡只放「全站都需要」的東西：
 *   - <html> 和 <body> 標籤
 *   - 字型的 CSS 變數
 *   - Toaster（Toast 通知的容器，放這裡才能在任何頁面觸發）
 *
 * Header 和 Footer 不放這裡，因為不同 Route Group 有不同的 Header。
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>): React.ReactElement {
  return (
    <html lang="zh-Hant">
      <body
        className={`${inter.variable} ${spaceMono.variable} font-sans antialiased`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  )
}

import { Header } from '@/components/features/layout/header'
import { Footer } from '@/components/features/layout/footer'

/* ─────────────────────────────────────────────
 * (dashboard) Route Group Layout
 *
 * 這個 layout 包住所有「已登入使用者」的頁面：
 *   - /my-events（我的活動）
 *   - /profile（個人資料）
 *   - /settings（設定）
 *
 * Header 不再需要 variant prop，會自動用 auth() 判斷登入狀態。
 * 路由保護由 middleware.ts 負責（cookie-based 檢查）。
 * ───────────────────────────────────────────── */
export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>): React.ReactElement {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  )
}

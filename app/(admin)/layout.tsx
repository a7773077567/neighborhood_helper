import { Header } from '@/components/features/layout/header'
import { Footer } from '@/components/features/layout/footer'

/* ─────────────────────────────────────────────
 * (admin) Route Group Layout
 *
 * 這個 layout 包住所有「組織者/管理員」的頁面：
 *   - /admin（管理後台首頁）
 *   - /admin/events（活動管理）
 *   - /admin/users（使用者管理）
 *
 * Header 不再需要 variant prop，會自動用 auth() 判斷登入狀態和角色。
 * 路由保護由 middleware.ts 負責（cookie-based 檢查）。
 * 未來可加上 role 檢查：未授權使用者 redirect 或顯示 403。
 * ───────────────────────────────────────────── */
export default function AdminLayout({
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

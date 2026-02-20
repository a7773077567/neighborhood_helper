import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
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
 * 權限保護兩層：
 *   1. middleware.ts — cookie 檢查（沒登入 → /login）
 *   2. 這個 layout — role 檢查（非 ADMIN → /）
 * ───────────────────────────────────────────── */
export default async function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>): Promise<React.ReactElement> {
  const session = await auth()

  // middleware 已確保有登入，但防禦性檢查：沒 session 或非 ADMIN 就導回首頁
  if (!session || session.user.role !== 'ADMIN') {
    redirect('/')
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  )
}

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
 * 跟 (dashboard) layout 的差異：
 *   - Header variant="admin"
 *     → 多了「管理後台」導覽項目（橘色 highlight）
 *
 * 未來考量：
 *   這個 layout 需要更嚴格的權限保護。
 *   除了要登入，還要檢查 role === 'ADMIN'。
 *   未授權的使用者應該看到 403 或 redirect。
 * ───────────────────────────────────────────── */
export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>): React.ReactElement {
  return (
    <div className="flex min-h-screen flex-col">
      <Header variant="admin" />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  )
}

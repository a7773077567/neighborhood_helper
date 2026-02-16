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
 * 跟 (public) layout 的差異：
 *   - Header variant="dashboard"
 *     → 多了「我的活動」導覽項目
 *     → 右側顯示使用者頭像（不是「登入」按鈕）
 *
 * 未來考量：
 *   實際上線時，這個 layout 需要加上認證保護。
 *   如果使用者未登入，應該 redirect 到 /login。
 *   目前先不做（Auth 還沒接），之後在 NextAuth middleware 處理。
 * ───────────────────────────────────────────── */
export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>): React.ReactElement {
  return (
    <div className="flex min-h-screen flex-col">
      <Header variant="dashboard" />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  )
}

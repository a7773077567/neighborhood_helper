import { Header } from '@/components/features/layout/header'

/**
 * 暫時的預覽頁面 — 用來驗證 Header 三種變體的視覺效果。
 * Task 5.1 會替換成正式的 Landing Page。
 */
export default function Home(): React.ReactElement {
  return (
    <div className="space-y-8">
      {/* Public：未登入 → 右側顯示「登入」按鈕 */}
      <section>
        <p className="bg-surface-muted px-6 py-2 font-mono text-sm text-ink-secondary">
          variant=&quot;public&quot;（未登入）
        </p>
        <Header variant="public" />
      </section>

      {/* Dashboard：已登入 → 多了「我的活動」，右側顯示頭像 */}
      <section>
        <p className="bg-surface-muted px-6 py-2 font-mono text-sm text-ink-secondary">
          variant=&quot;dashboard&quot;（已登入）
        </p>
        <Header variant="dashboard" />
      </section>

      {/* Admin：組織者 → 多了「管理後台」（橘色），右側顯示頭像 */}
      <section>
        <p className="bg-surface-muted px-6 py-2 font-mono text-sm text-ink-secondary">
          variant=&quot;admin&quot;（組織者）
        </p>
        <Header variant="admin" />
      </section>
    </div>
  )
}

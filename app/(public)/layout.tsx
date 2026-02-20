import { Footer } from '@/components/features/layout/footer'
import { Header } from '@/components/features/layout/header'

/* ─────────────────────────────────────────────
 * (public) Route Group Layout
 *
 * 這個 layout 包住所有「公開」頁面：
 *   - / （首頁）
 *   - /events（活動列表）
 *   - /leaderboard（排行榜）
 *
 * 結構：
 *   ┌─────────────────────┐
 *   │      Header         │  ← 自動偵測登入狀態（via auth()）
 *   ├─────────────────────┤
 *   │                     │
 *   │      children       │  ← 頁面內容
 *   │                     │
 *   ├─────────────────────┤
 *   │      Footer         │
 *   └─────────────────────┘
 *
 * 為什麼用 Route Group？
 *   資料夾名稱 (public) 的括號讓 Next.js 忽略這段路徑，
 *   所以 app/(public)/events/page.tsx 的 URL 是 /events，不是 /public/events。
 *   這讓我們可以用不同的 layout 包住不同類型的頁面，而不影響 URL 結構。
 *
 * 為什麼用 min-h-screen + flex + flex-1？
 *   確保 Footer 永遠在頁面最底部：
 *   - min-h-screen → 容器至少佔滿整個螢幕高度
 *   - flex flex-col → 垂直排列 Header / main / Footer
 *   - flex-1 → main 區域自動撐開，把 Footer 推到底部
 *   如果不加這些，當頁面內容很短時，Footer 會「浮在半空中」。
 * ───────────────────────────────────────────── */
export default function PublicLayout({
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

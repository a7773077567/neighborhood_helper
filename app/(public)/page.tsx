/**
 * 首頁暫時的 placeholder — Task 5.1 會替換成正式的 Landing Page。
 *
 * 這個頁面位於 app/(public)/page.tsx，
 * 但因為 (public) 是 Route Group（括號），URL 仍然是 /。
 *
 * Layout 會自動套用 Header（public variant）+ Footer，
 * 所以這裡只需要放頁面內容本身。
 */
export default function Home(): React.ReactElement {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-24">
      <h1 className="font-mono text-2xl font-bold text-ink-primary">
        Neighborhood Helper
      </h1>
      <p className="text-ink-body">
        首頁 Landing Page — 即將實作
      </p>
    </div>
  )
}

import { Shield } from 'lucide-react'

export default function AdminPage(): React.ReactElement {
  return (
    <div className="flex flex-col items-center justify-center px-4 py-24 md:py-40">
      <div className="flex flex-col items-center gap-4">
        <div className="flex size-16 items-center justify-center rounded-xl border-2 border-ink-primary bg-brand-orange shadow-brutal">
          <Shield className="size-8 text-white" />
        </div>
        <h1 className="font-mono text-2xl font-bold text-ink-primary">
          管理後台
        </h1>
        <p className="text-sm text-ink-secondary">
          即將推出，敬請期待
        </p>
      </div>
    </div>
  )
}

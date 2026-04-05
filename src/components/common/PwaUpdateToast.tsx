import { useRegisterSW } from 'virtual:pwa-register/react'

export function PwaUpdateToast() {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW()

  if (!needRefresh) return null

  return (
    <div className="bg-card ring-border fixed bottom-20 left-1/2 z-50 flex -translate-x-1/2 items-center gap-3 rounded-2xl px-4 py-3 shadow-lg ring-1">
      <span className="text-foreground text-sm">Update available</span>
      <button
        onClick={() => updateServiceWorker(true)}
        className="bg-primary text-primary-foreground rounded-xl px-3 py-1.5 text-xs font-semibold"
      >
        Reload
      </button>
      <button
        onClick={() => setNeedRefresh(false)}
        className="text-muted-foreground text-xs"
      >
        Dismiss
      </button>
    </div>
  )
}

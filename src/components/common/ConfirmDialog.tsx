import { useState } from 'react'
import { cn } from '#/lib/utils/cn'
import { useBodyScrollLock } from '#/lib/hooks/use-body-scroll-lock'
import { Button } from './Button'

interface ConfirmDialogProps {
  title: string
  description: string
  confirmLabel: string
  cancelLabel?: string
  onConfirm: () => void | Promise<void>
  onCancel: () => void
  isLoading?: boolean
  tone?: 'default' | 'destructive'
}

const BACKDROP_CLS =
  'fixed inset-0 z-50 flex items-center justify-center bg-black/45 px-5 backdrop-blur-[2px]'
const PANEL_CLS =
  'bg-card text-card-foreground w-full max-w-sm space-y-4 rounded-3xl p-5 shadow-xl ring-1 ring-border'

export function ConfirmDialog({
  title,
  description,
  confirmLabel,
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
  isLoading = false,
  tone = 'default',
}: ConfirmDialogProps) {
  useBodyScrollLock('visible')
  const [isDismissing, setIsDismissing] = useState(false)

  function startDismiss() {
    if (isLoading) return
    setIsDismissing(true)
  }

  return (
    <div
      className={cn(
        BACKDROP_CLS,
        isDismissing ? 'animate-overlay-fade-out' : 'animate-overlay-fade-in',
      )}
      onAnimationEnd={() => {
        if (isDismissing) onCancel()
      }}
      onClick={() => startDismiss()}
    >
      <div className={PANEL_CLS} onClick={(e) => e.stopPropagation()}>
        <div className="space-y-2">
          <h2 className="text-foreground text-base font-bold">{title}</h2>
          <p className="text-muted-foreground text-sm">{description}</p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="secondary"
            className="flex-1"
            onClick={startDismiss}
            disabled={isLoading}
          >
            {cancelLabel}
          </Button>
          <Button
            className={
              tone === 'destructive'
                ? 'bg-destructive hover:bg-destructive/90 flex-1 text-white'
                : 'flex-1'
            }
            onClick={() => void onConfirm()}
            disabled={isLoading}
          >
            {isLoading ? 'Deleting…' : confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  )
}

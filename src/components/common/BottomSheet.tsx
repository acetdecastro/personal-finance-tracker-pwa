import { X } from 'lucide-react'
import { cn } from '#/lib/utils/cn'

interface BottomSheetProps {
  title: string
  onClose: () => void
  children: React.ReactNode
  contentClassName?: string
}

const BACKDROP_CLS = 'fixed inset-0 z-50 flex flex-col justify-end bg-black/40'
const PANEL_CLS =
  'max-h-[90dvh] overflow-y-auto rounded-t-3xl bg-popover px-5 pb-8 pt-5'
const CLOSE_BUTTON_CLS = 'rounded-lg p-1 text-muted-foreground hover:text-foreground'

export function BottomSheet({
  title,
  onClose,
  children,
  contentClassName,
}: BottomSheetProps) {
  return (
    <div className={BACKDROP_CLS} onClick={onClose}>
      <div
        className={cn(PANEL_CLS, contentClassName)}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-base font-bold text-foreground">{title}</h2>
          <button onClick={onClose} className={CLOSE_BUTTON_CLS}>
            <X className="size-5" />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}

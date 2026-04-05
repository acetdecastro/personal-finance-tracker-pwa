import { useEffect } from 'react'
import { X } from 'lucide-react'
import { cn } from '#/lib/utils/cn'
import { Button } from './Button'

interface BottomSheetProps {
  title: string
  onClose: () => void
  children: React.ReactNode
  contentClassName?: string
}

const BACKDROP_CLS = 'fixed inset-0 z-50 flex flex-col justify-end bg-black/40'
const PANEL_CLS =
  'flex max-h-[90dvh] flex-col rounded-tl-3xl rounded-tr-3xl bg-popover'
const CLOSE_BUTTON_CLS =
  'rounded-lg p-1 text-muted-foreground hover:text-foreground'

export function BottomSheet({
  title,
  onClose,
  children,
  contentClassName,
}: BottomSheetProps) {
  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [])

  return (
    <div className={BACKDROP_CLS} onClick={onClose}>
      <div className={PANEL_CLS} onClick={(e) => e.stopPropagation()}>
        {/* Header — never scrolls */}
        <div className="flex shrink-0 items-center justify-between px-5 pt-5 pb-4">
          <h2 className="text-foreground text-base font-bold">{title}</h2>
          <Button
            onClick={onClose}
            className={CLOSE_BUTTON_CLS}
            variant="inline-primary"
          >
            <X className="size-5" />
          </Button>
        </div>
        {/* Scrollable body — scrollbar stays below the rounded header */}
        <div
          className={cn(
            'sheet-scroll mr-1 min-h-0 flex-1 overflow-x-hidden overflow-y-auto pt-2 pr-3 pb-8 pl-4.5',
            contentClassName,
          )}
        >
          {children}
        </div>
      </div>
    </div>
  )
}

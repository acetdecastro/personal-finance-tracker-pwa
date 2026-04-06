import { useEffect } from 'react'
import { X } from 'lucide-react'
import { cn } from '#/lib/utils/cn'
import { useBodyScrollLock } from '#/lib/hooks/use-body-scroll-lock'
import { Button } from './Button'

interface BottomSheetProps {
  title: string
  onClose: () => void
  children: React.ReactNode
  contentClassName?: string
}

const BACKDROP_CLS =
  'fixed inset-0 z-50 flex flex-col justify-end bg-black/40 cursor-pointer'
const PANEL_CLS =
  'flex max-h-[90dvh] flex-col rounded-tl-3xl rounded-tr-3xl bg-popover cursor-auto dark:border-primary/40 border-border/60 border-t'
const CLOSE_BUTTON_CLS =
  'rounded-lg p-1 text-muted-foreground hover:text-foreground'

export function BottomSheet({
  title,
  onClose,
  children,
  contentClassName,
}: BottomSheetProps) {
  useBodyScrollLock('hidden')

  // When this sheet unmounts, absorb the next click/touchend at the document
  // capture phase so ghost clicks don't reach background elements.
  useEffect(() => {
    return () => {
      const absorb = (e: Event) => {
        e.stopPropagation()
        e.preventDefault()
      }
      document.addEventListener('click', absorb, { capture: true, once: true })
      document.addEventListener('touchend', absorb, {
        capture: true,
        once: true,
      })
      // Safety: remove if no event fires within 300 ms
      const timer = setTimeout(() => {
        document.removeEventListener('click', absorb, true)
        document.removeEventListener('touchend', absorb, true)
      }, 300)

      void timer
    }
  }, [])

  function dismiss(e: { preventDefault: () => void }) {
    e.preventDefault()
    onClose()
  }

  return (
    <div
      className={BACKDROP_CLS}
      // onPointerDown: modern browsers — preventDefault cancels the ghost click
      onPointerDown={(e) => {
        if (e.target === e.currentTarget) dismiss(e)
      }}
      // onClick: iOS Safari requires an onClick handler to treat a div as a
      // touch target; without it, taps pass through to elements below.
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div
        className={PANEL_CLS}
        // Stop both pointer and click events so backdrop handlers never fire
        // when the user interacts with panel content.
        onPointerDown={(e) => e.stopPropagation()}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header — never scrolls */}
        <div className="flex shrink-0 items-center justify-between px-5 pt-5 pb-4">
          <h2 className="text-foreground text-base font-bold">{title}</h2>
          <Button
            onPointerDown={(e) => {
              e.stopPropagation()
              dismiss(e)
            }}
            onClick={(e) => {
              e.stopPropagation()
              onClose() // keyboard fallback (Enter / Space)
            }}
            className={CLOSE_BUTTON_CLS}
            variant="inline-primary"
          >
            <X className="size-5" />
          </Button>
        </div>
        {/* Scrollable body */}
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

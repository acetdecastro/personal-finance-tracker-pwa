import { useEffect, useRef, useState } from 'react'
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
  'fixed inset-0 z-50 flex flex-col justify-end bg-black/40'
const PANEL_CLS =
  'flex max-h-[90dvh] flex-col rounded-tl-3xl rounded-tr-3xl bg-popover cursor-auto dark:border-primary/30 border-border/60 border-t animate-sheet-slide-up'
const CLOSE_BUTTON_CLS =
  'rounded-lg p-1 text-muted-foreground hover:text-foreground'

export function BottomSheet({
  title,
  onClose,
  children,
  contentClassName,
}: BottomSheetProps) {
  useBodyScrollLock('hidden')

  const panelRef = useRef<HTMLDivElement>(null)
  const dragStartY = useRef(0)
  const [dragY, setDragY] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [isDismissing, setIsDismissing] = useState(false)

  function startDismiss() {
    setIsDismissing(true)
  }

  function handlePointerDown(e: React.PointerEvent<HTMLDivElement>) {
    dragStartY.current = e.clientY
    setIsDragging(true)
    e.currentTarget.setPointerCapture(e.pointerId)
  }

  function handlePointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (!isDragging) return
    setDragY(Math.max(0, e.clientY - dragStartY.current))
  }

  function handlePointerUp() {
    if (!isDragging) return
    setIsDragging(false)
    const threshold = (panelRef.current?.offsetHeight ?? 0) * 0.3
    if (dragY > threshold) {
      startDismiss()
    } else {
      setDragY(0)
    }
  }

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

  return (
    <div
      className={cn(BACKDROP_CLS, isDismissing && 'bg-transparent')}
      // onPointerDown: modern browsers — preventDefault cancels the ghost click
      onPointerDown={(e) => {
        if (e.target === e.currentTarget) {
          e.preventDefault()
          startDismiss()
        }
      }}
      // onClick: iOS Safari requires an onClick handler to treat a div as a
      // touch target; without it, taps pass through to elements below.
      onClick={(e) => {
        if (e.target === e.currentTarget) startDismiss()
      }}
    >
      <div
        ref={panelRef}
        className={PANEL_CLS}
        style={{
          transform: isDismissing
            ? 'translateY(110%)'
            : `translateY(${dragY}px)`,
          transition:
            isDragging && !isDismissing
              ? 'none'
              : 'transform 0.25s cubic-bezier(0.32, 0.72, 0, 1)',
        }}
        onTransitionEnd={(e) => {
          if (isDismissing && e.propertyName === 'transform') onClose()
        }}
        // Stop both pointer and click events so backdrop handlers never fire
        // when the user interacts with panel content.
        onPointerDown={(e) => e.stopPropagation()}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drag handle area — full header is the drag target */}
        <div
          className="shrink-0 cursor-grab touch-none select-none active:cursor-grabbing"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
        >
          {/* Thumb indicator */}
          <div className="flex justify-center pt-1.5 pb-1">
            <div className="bg-muted-foreground/25 h-1 w-10 rounded-full" />
          </div>
          {/* Title + close row */}
          <div className="flex items-center justify-between px-5 pt-2 pb-4">
            <h2 className="text-foreground text-base font-bold">{title}</h2>
            <Button
              onPointerDown={(e) => {
                e.stopPropagation()
                e.preventDefault()
                startDismiss()
              }}
              onClick={(e) => {
                e.stopPropagation()
                startDismiss() // keyboard fallback (Enter / Space)
              }}
              className={CLOSE_BUTTON_CLS}
              variant="inline-primary"
            >
              <X className="size-5" />
            </Button>
          </div>
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

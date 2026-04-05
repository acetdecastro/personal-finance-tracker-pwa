import type { ElementType, ReactNode } from 'react'
import { cn } from '#/lib/utils/cn'
import { getCurrencyTextSizeClass } from '#/lib/format/number.utils'

interface AccountRowProps {
  label: string
  subLabel?: string | null
  amountLabel: string
  Icon?: ElementType
  onPress?: () => void
  className?: string
}

export function AccountRow({
  label,
  subLabel,
  amountLabel,
  onPress,
  className,
}: AccountRowProps) {
  const content: ReactNode = (
    <>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-foreground truncate text-xs font-semibold">
              {label}
            </p>
            {subLabel && (
              <p className="text-muted-foreground/70 mt-0.5 truncate text-[10px]">
                {subLabel}
              </p>
            )}
          </div>

          <div className="shrink-0 text-right">
            <p
              title={amountLabel}
              className={cn(
                'text-foreground max-w-34 truncate font-bold tabular-nums',
                getCurrencyTextSizeClass(amountLabel, 'list'),
              )}
            >
              {amountLabel}
            </p>
          </div>
        </div>
      </div>
    </>
  )

  if (onPress) {
    return (
      <button
        type="button"
        onClick={onPress}
        className={cn(
          'focus-visible:ring-ring focus-visible:ring-offset-background flex w-full items-start gap-3 rounded-2xl py-1 text-left transition outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
          className,
        )}
      >
        {content}
      </button>
    )
  }

  return (
    <div className={cn('flex items-start gap-3 rounded-2xl py-1', className)}>
      {content}
    </div>
  )
}

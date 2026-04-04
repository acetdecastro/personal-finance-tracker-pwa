import type { ButtonHTMLAttributes } from 'react'
import { cn } from '#/lib/utils/cn'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:
    | 'primary'
    | 'secondary'
    | 'inline-primary'
    | 'inline-secondary'
    | 'icon'
    | 'fab'
  fullWidth?: boolean
}

const VARIANT_CLS: Record<NonNullable<ButtonProps['variant']>, string> = {
  primary:
    'rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground transition active:scale-[0.98] disabled:opacity-50',
  secondary:
    'rounded-xl bg-muted py-3 text-sm font-semibold text-secondary-foreground transition active:scale-[0.98] disabled:opacity-60',
  'inline-primary':
    'inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold text-primary transition hover:bg-primary-subtle',
  'inline-secondary':
    'inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold text-secondary-foreground transition hover:bg-muted',
  icon: 'rounded-lg p-1 text-muted-foreground transition hover:text-foreground',
  fab: 'fixed bottom-24 right-5 z-30 flex size-14 items-center justify-center rounded-2xl bg-primary shadow-lg transition active:scale-90',
}

export function Button({
  variant = 'primary',
  fullWidth = false,
  className,
  type = 'button',
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        VARIANT_CLS[variant],
        fullWidth && variant !== 'fab' && 'flex-1',
        className,
      )}
      {...props}
    />
  )
}

import { Info } from 'lucide-react'
import { cn } from '#/lib/utils/cn'

interface InfoBannerProps {
  message: string
  className?: string
}

export function InfoBanner({ message, className }: InfoBannerProps) {
  return (
    <div
      className={cn(
        'border-accent/30 bg-accent/10 text-muted-foreground flex gap-2.5 rounded-2xl border px-4 py-3 text-xs',
        className,
      )}
    >
      <Info className="text-accent mt-px size-3.5 shrink-0" />
      <p className="text-accent text-xs">{message}</p>
    </div>
  )
}

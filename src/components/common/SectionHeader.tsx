import { cn } from '#/lib/utils/cn'

interface SectionHeaderProps {
  title: string
  action?: React.ReactNode
  className?: string
}

export function SectionHeader({
  title,
  action,
  className,
}: SectionHeaderProps) {
  return (
    <div className={cn('flex items-center justify-between', className)}>
      <h2 className="text-foreground text-base font-bold tracking-tight">
        {title}
      </h2>
      {action && <div>{action}</div>}
    </div>
  )
}

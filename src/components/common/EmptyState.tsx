import { cn } from '#/lib/utils/cn'

interface EmptyStateProps {
  icon?: React.ReactNode
  title: string
  description?: string
  action?: React.ReactNode
  className?: string
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-3 py-10 text-center',
        className,
      )}
    >
      {icon && (
        <div className="text-muted-foreground/40">{icon}</div>
      )}
      <div className="space-y-1">
        <p className="text-sm font-semibold text-muted-foreground">
          {title}
        </p>
        {description && (
          <p className="text-xs text-muted-foreground/70">
            {description}
          </p>
        )}
      </div>
      {action && <div>{action}</div>}
    </div>
  )
}

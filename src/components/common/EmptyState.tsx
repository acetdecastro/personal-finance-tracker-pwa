interface EmptyStateProps {
  icon?: React.ReactNode
  title: string
  description?: string
  action?: React.ReactNode
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-10 text-center">
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

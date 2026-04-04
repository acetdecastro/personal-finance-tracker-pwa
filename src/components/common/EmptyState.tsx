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
        <div className="text-slate-300 dark:text-slate-600">{icon}</div>
      )}
      <div className="space-y-1">
        <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
          {title}
        </p>
        {description && (
          <p className="text-xs text-slate-400 dark:text-slate-500">
            {description}
          </p>
        )}
      </div>
      {action && <div>{action}</div>}
    </div>
  )
}

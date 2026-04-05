import { cn } from '#/lib/utils/cn'

interface FormFieldProps {
  label: string
  htmlFor?: string
  error?: string
  required?: boolean
  children: React.ReactNode
  hint?: string
  counter?: string
  className?: string
}

export function FormField({
  label,
  htmlFor,
  error,
  required,
  children,
  hint,
  counter,
  className,
}: FormFieldProps) {
  return (
    <div className={cn('space-y-1.5', className)}>
      {htmlFor ? (
        <label
          htmlFor={htmlFor}
          className="text-secondary-foreground block text-sm font-medium"
        >
          {label}
          {required && <span className="text-destructive ml-0.5">*</span>}
        </label>
      ) : (
        <p className="text-secondary-foreground block text-sm font-medium">
          {label}
          {required && <span className="text-destructive ml-0.5">*</span>}
        </p>
      )}
      {children}
      {(hint || error || counter) && (
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            {hint && !error && (
              <p className="text-muted-foreground/70 text-xs">{hint}</p>
            )}
            {error && (
              <p className="text-destructive text-xs font-medium">{error}</p>
            )}
          </div>
          {counter && (
            <p className="text-muted-foreground/70 shrink-0 text-xs">
              {counter}
            </p>
          )}
        </div>
      )}
    </div>
  )
}

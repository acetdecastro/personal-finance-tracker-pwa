import { cn } from '#/lib/utils/cn'

interface FormFieldProps {
  label: string
  error?: string
  required?: boolean
  children: React.ReactNode
  hint?: string
  className?: string
}

export function FormField({
  label,
  error,
  required,
  children,
  hint,
  className,
}: FormFieldProps) {
  return (
    <div className={cn('space-y-1.5', className)}>
      <label className="block text-sm font-medium text-secondary-foreground">
        {label}
        {required && <span className="ml-0.5 text-destructive">*</span>}
      </label>
      {children}
      {hint && !error && (
        <p className="text-xs text-muted-foreground/70">{hint}</p>
      )}
      {error && (
        <p className="text-xs font-medium text-destructive">{error}</p>
      )}
    </div>
  )
}

import { RefreshCw } from 'lucide-react'
import type { RecurringRule } from '#/types/domain'
import { formatPhpCurrency } from '#/lib/format/number.utils'
import { formatDisplayDate } from '#/lib/dates'
import { cn } from '#/lib/utils/cn'

interface RecurringRuleListProps {
  rules: RecurringRule[]
  onSelect?: (rule: RecurringRule) => void
}

const CADENCE_LABELS: Record<string, string> = {
  'semi-monthly': 'Semi-monthly',
  monthly: 'Monthly',
  weekly: 'Weekly',
  custom: 'Custom',
}

export function RecurringRuleList({ rules, onSelect }: RecurringRuleListProps) {
  return (
    <div className="space-y-2">
      {rules.map((rule) => (
        <button
          type="button"
          key={rule.id}
          onClick={() => onSelect?.(rule)}
          className="flex w-full items-center gap-3 rounded-2xl bg-card p-4 text-left transition hover:bg-muted/50"
        >
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-muted">
            <RefreshCw className="size-5 text-muted-foreground" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-foreground">
              {rule.name}
            </p>
            <p className="text-xs text-muted-foreground/70">
              {rule.type === 'income' ? 'Income' : 'Expense'} ·{' '}
              {CADENCE_LABELS[rule.cadence]} · Next{' '}
              {formatDisplayDate(rule.nextOccurrenceDate)}
            </p>
          </div>
          <div className="shrink-0 text-right">
            <p
              className={cn(
                'text-sm font-bold',
                rule.type === 'income' ? 'text-primary' : 'text-foreground',
              )}
            >
              {rule.type === 'income' ? '+' : '-'}{formatPhpCurrency(rule.amount)}
            </p>
            <p className="text-[11px] text-muted-foreground/70">
              Expected
            </p>
            {!rule.isActive && (
              <p className="text-xs text-muted-foreground/70">Inactive</p>
            )}
            {onSelect && (
              <p className="text-[11px] font-medium text-primary">
                Edit
              </p>
            )}
          </div>
        </button>
      ))}
    </div>
  )
}

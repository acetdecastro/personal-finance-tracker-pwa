import { RefreshCw } from 'lucide-react'
import type { RecurringRule } from '#/types/domain'
import { formatPhpCurrency } from '#/lib/format/number.utils'
import { formatDisplayDate } from '#/lib/dates'

interface RecurringRuleListProps {
  rules: RecurringRule[]
}

const CADENCE_LABELS: Record<string, string> = {
  'semi-monthly': 'Semi-monthly',
  monthly: 'Monthly',
  weekly: 'Weekly',
  custom: 'Custom',
}

export function RecurringRuleList({ rules }: RecurringRuleListProps) {
  return (
    <div className="space-y-2">
      {rules.map((rule) => (
        <div
          key={rule.id}
          className="flex items-center gap-3 rounded-2xl bg-white p-4 dark:bg-zinc-900"
        >
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 dark:bg-zinc-800">
            <RefreshCw className="size-5 text-slate-500 dark:text-slate-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">
              {rule.name}
            </p>
            <p className="text-xs text-slate-400 dark:text-slate-500">
              {CADENCE_LABELS[rule.cadence]} · Next{' '}
              {formatDisplayDate(rule.nextOccurrenceDate)}
            </p>
          </div>
          <div className="text-right shrink-0">
            <p className={`text-sm font-bold ${
              rule.type === 'income'
                ? 'text-emerald-700 dark:text-emerald-400'
                : 'text-slate-900 dark:text-slate-100'
            }`}>
              {rule.type === 'income' ? '+' : '-'}{formatPhpCurrency(rule.amount)}
            </p>
            {!rule.isActive && (
              <p className="text-xs text-slate-400 dark:text-slate-500">Inactive</p>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

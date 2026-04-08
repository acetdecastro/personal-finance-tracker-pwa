import { RefreshCw } from 'lucide-react'
import type { Category, RecurringRule } from '#/types/domain'
import { formatPhpCurrency } from '#/lib/format/number.utils'
import { formatCompactDisplayDate } from '#/lib/dates'
import { TransactionRow } from '#/features/transactions/components/TransactionRow'
import { getNextUpcomingOccurrenceDate } from '#/services/forecast/recurring-expansion.service'

interface RecurringRuleListProps {
  rules: RecurringRule[]
  categories?: Category[]
  onSelect?: (rule: RecurringRule) => void
}

const CADENCE_LABELS: Record<string, string> = {
  'semi-monthly': 'Semi-monthly',
  monthly: 'Monthly',
  weekly: 'Weekly',
  custom: 'Custom',
}

export function RecurringRuleList({
  rules,
  categories = [],
  onSelect,
}: RecurringRuleListProps) {
  const categoryMap = new Map(categories.map((c) => [c.id, c.name]))

  return (
    <div className="space-y-4">
      {rules.map((rule) => {
        const amountLabel = `${rule.type === 'income' ? '+' : '-'}${formatPhpCurrency(rule.amount)}`
        const categoryName = categoryMap.get(rule.categoryId)
        const nextOccurrenceDate = rule.isActive
          ? getNextUpcomingOccurrenceDate(rule, new Date())
          : rule.nextOccurrenceDate
        const dateLabelPrefix =
          rule.type === 'expense' ? 'Due on' : 'Next occurrence on'
        const subLabelParts = [
          rule.type === 'income' ? 'Income' : 'Expense',
          ...(categoryName ? [categoryName] : []),
          CADENCE_LABELS[rule.cadence],
        ]

        if (!rule.isActive) {
          subLabelParts.push('Inactive')
        }

        return (
          <TransactionRow
            key={rule.id}
            className="bg-card p-4 shadow"
            label={rule.name}
            subLabel={subLabelParts.join(' · ')}
            amountLabel={amountLabel}
            rightSecondaryLabel={`${dateLabelPrefix} ${formatCompactDisplayDate(nextOccurrenceDate)}`}
            amountColor={
              rule.type === 'income' ? 'text-primary' : 'text-warning'
            }
            Icon={RefreshCw}
            iconColor="text-muted-foreground"
            iconBg="bg-muted"
            onPress={onSelect ? () => onSelect(rule) : undefined}
          />
        )
      })}
    </div>
  )
}

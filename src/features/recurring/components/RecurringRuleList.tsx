import type { ReactNode } from 'react'
import { RefreshCw } from 'lucide-react'
import type { Category, RecurringRule } from '#/types/domain'
import { formatPhpCurrency } from '#/lib/format/number.utils'
import { formatAppDateTime } from '#/lib/dates'
import { TransactionRow } from '#/features/transactions/components/TransactionRow'
import { supportsSecondSalaryAmount } from '../lib/salary-rule'
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
        const categoryName = categoryMap.get(rule.categoryId)
        const hasSecondSalaryAmount =
          rule.secondAmount !== null &&
          supportsSecondSalaryAmount({
            type: rule.type,
            categoryId: rule.categoryId,
            cadence: rule.cadence,
          })
        const amountLabel = hasSecondSalaryAmount
          ? `${formatPhpCurrency(rule.amount)} First · ${formatPhpCurrency(rule.secondAmount)} Second`
          : `${rule.type === 'income' ? '+' : '-'}${formatPhpCurrency(rule.amount)}`
        const amountContent: ReactNode | undefined = hasSecondSalaryAmount ? (
          <>
            <span>{formatPhpCurrency(rule.amount)}</span>
            <span className="text-muted-foreground/70 align-super text-[6.3px] font-medium">
              1st
            </span>
            <span className="text-muted-foreground/70 px-0.5">·</span>
            <span>{formatPhpCurrency(rule.secondAmount)}</span>
            <span className="text-muted-foreground/70 align-super text-[6.3px] font-medium">
              2nd
            </span>
          </>
        ) : undefined
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
            amountContent={amountContent}
            rightSecondaryLabel={`${dateLabelPrefix} ${formatAppDateTime(nextOccurrenceDate)}`}
            amountColor={
              rule.type === 'income' ? 'text-primary' : 'text-destructive'
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

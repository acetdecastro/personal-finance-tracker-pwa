import { useFiltersStore } from '#/stores/filters-store'
import { cn } from '#/lib/utils/cn'
import type { TransactionType } from '#/types/domain'

const FILTER_TABS: { label: string; value: TransactionType | null }[] = [
  { label: 'All', value: null },
  { label: 'Expense', value: 'expense' },
  { label: 'Income', value: 'income' },
]

export function TransactionFilterBar() {
  const { transactionType, setTransactionType } = useFiltersStore()

  return (
    <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
      {FILTER_TABS.map((tab) => (
        <button
          key={tab.label}
          onClick={() => setTransactionType(tab.value)}
          className={cn(
            'shrink-0 rounded-full px-4 py-1.5 text-xs font-semibold transition',
            transactionType === tab.value
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted text-secondary-foreground',
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}

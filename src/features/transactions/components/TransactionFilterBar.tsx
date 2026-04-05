import { useFiltersStore } from '#/stores/filters-store'
import { cn } from '#/lib/utils/cn'
import type { TransactionType } from '#/types/domain'

const FILTER_TABS: { label: string; value: TransactionType | null }[] = [
  { label: 'All', value: null },
  { label: 'Income', value: 'income' },
  { label: 'Expense', value: 'expense' },
  { label: 'Transfer', value: 'transfer' },
]

export function TransactionFilterBar() {
  const { transactionType, setTransactionType } = useFiltersStore()

  return (
    <div className="no-scrollbar flex gap-2 overflow-x-auto p-1">
      {FILTER_TABS.map((tab) => (
        <button
          key={tab.label}
          onClick={() => setTransactionType(tab.value)}
          className={cn(
            'focus-visible:ring-ring focus-visible:ring-offset-background shrink-0 rounded-full px-4 py-1.5 text-xs font-semibold transition outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
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

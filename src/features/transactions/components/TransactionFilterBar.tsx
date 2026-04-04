import { useFiltersStore } from '#/stores/filters-store'
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
          className={`shrink-0 rounded-full px-4 py-1.5 text-xs font-semibold transition ${
            transactionType === tab.value
              ? 'bg-emerald-700 text-white dark:bg-emerald-600'
              : 'bg-slate-100 text-slate-600 dark:bg-zinc-800 dark:text-slate-300'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}

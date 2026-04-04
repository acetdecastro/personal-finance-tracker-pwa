import { ArrowDownLeft, ArrowUpRight, ArrowLeftRight, Trash2 } from 'lucide-react'
import type { Account, Category, Transaction } from '#/types/domain'
import { formatPhpCurrency } from '#/lib/format/number.utils'
import { formatDisplayDate } from '#/lib/dates'

interface TransactionListProps {
  transactions: Transaction[]
  accounts: Account[]
  categories: Category[]
  onDelete?: (id: string) => void
}

const TYPE_CONFIG = {
  income: {
    Icon: ArrowDownLeft,
    color: 'text-emerald-700 dark:text-emerald-400',
    bg: 'bg-emerald-50 dark:bg-emerald-950/30',
    sign: '+',
    amountColor: 'text-emerald-700 dark:text-emerald-400',
  },
  expense: {
    Icon: ArrowUpRight,
    color: 'text-slate-500 dark:text-slate-400',
    bg: 'bg-slate-100 dark:bg-zinc-800',
    sign: '-',
    amountColor: 'text-slate-900 dark:text-slate-100',
  },
  transfer: {
    Icon: ArrowLeftRight,
    color: 'text-teal-600 dark:text-teal-400',
    bg: 'bg-teal-50 dark:bg-teal-950/30',
    sign: '',
    amountColor: 'text-teal-600 dark:text-teal-400',
  },
} as const

export function TransactionList({
  transactions,
  accounts,
  categories,
  onDelete,
}: TransactionListProps) {
  const accountMap = new Map(accounts.map((a) => [a.id, a]))
  const categoryMap = new Map(categories.map((c) => [c.id, c]))

  return (
    <div className="space-y-1">
      {transactions.map((t) => {
        const cfg = TYPE_CONFIG[t.type]
        const Icon = cfg.Icon
        const categoryName = t.categoryId ? categoryMap.get(t.categoryId)?.name : null
        const accountName = t.accountId ? accountMap.get(t.accountId)?.name : null

        return (
          <div
            key={t.id}
            className="flex items-center gap-3 rounded-2xl p-4 hover:bg-slate-50 dark:hover:bg-zinc-800/50"
          >
            <div className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${cfg.bg}`}>
              <Icon className={`size-5 ${cfg.color}`} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">
                {categoryName ?? t.note ?? t.type}
              </p>
              <p className="text-xs text-slate-400 dark:text-slate-500">
                {accountName}
                {accountName && t.transactionDate ? ' · ' : ''}
                {formatDisplayDate(t.transactionDate)}
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <p className={`text-sm font-bold ${cfg.amountColor}`}>
                {cfg.sign}{formatPhpCurrency(t.amount)}
              </p>
              {onDelete && (
                <button
                  onClick={() => onDelete(t.id)}
                  className="rounded-lg p-1 text-slate-300 transition hover:text-red-500 dark:text-slate-600 dark:hover:text-red-400"
                  aria-label="Delete transaction"
                >
                  <Trash2 className="size-4" />
                </button>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

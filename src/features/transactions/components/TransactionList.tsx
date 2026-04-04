import { ArrowDownLeft, ArrowUpRight, ArrowLeftRight, Trash2 } from 'lucide-react'
import type { Account, Category, Transaction } from '#/types/domain'
import { formatPhpCurrency } from '#/lib/format/number.utils'
import { formatDisplayDate } from '#/lib/dates'
import { cn } from '#/lib/utils/cn'

interface TransactionListProps {
  transactions: Transaction[]
  accounts: Account[]
  categories: Category[]
  onDelete?: (id: string) => void
}

const TYPE_CONFIG = {
  income: {
    Icon: ArrowDownLeft,
    color: 'text-primary',
    bg: 'bg-primary-subtle',
    sign: '+',
    amountColor: 'text-primary',
  },
  expense: {
    Icon: ArrowUpRight,
    color: 'text-muted-foreground',
    bg: 'bg-muted',
    sign: '-',
    amountColor: 'text-foreground',
  },
  transfer: {
    Icon: ArrowLeftRight,
    color: 'text-accent',
    bg: 'bg-accent-subtle',
    sign: '',
    amountColor: 'text-accent',
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
            className="flex items-center gap-3 rounded-2xl p-4 hover:bg-muted/50"
          >
            <div
              className={cn(
                'flex size-10 shrink-0 items-center justify-center rounded-xl',
                cfg.bg,
              )}
            >
              <Icon className={cn('size-5', cfg.color)} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-foreground">
                {categoryName ?? t.note ?? t.type}
              </p>
              <p className="text-xs text-muted-foreground/70">
                {accountName}
                {accountName && t.transactionDate ? ' · ' : ''}
                {formatDisplayDate(t.transactionDate)}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <p className={cn('text-sm font-bold', cfg.amountColor)}>
                {cfg.sign}{formatPhpCurrency(t.amount)}
              </p>
              {onDelete && (
                <button
                  onClick={() => onDelete(t.id)}
                  className="rounded-lg p-1 text-muted-foreground/40 transition hover:text-destructive"
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

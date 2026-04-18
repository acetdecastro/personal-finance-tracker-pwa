import { ArrowUpRight, ArrowUp, ArrowDown } from 'lucide-react'
import type { Account, Category, Goal, Transaction } from '#/types/domain'
import { formatPhpCurrency } from '#/lib/format/number.utils'
import { formatAppDateLabel, formatAppTime, getAppDateKey } from '#/lib/dates'
import { TransactionRow } from './TransactionRow'

interface TransactionListProps {
  transactions: Transaction[]
  accounts: Account[]
  categories: Category[]
  goals?: Goal[]
  onSelect?: (transaction: Transaction) => void
}

export const TYPE_CONFIG = {
  income: {
    Icon: ArrowUp,
    color: 'text-primary',
    bg: 'bg-primary-subtle',
    sign: '+',
    amountColor: 'text-primary',
  },
  expense: {
    Icon: ArrowDown,
    color: 'text-muted-foreground',
    bg: 'bg-muted',
    sign: '-',
    amountColor: 'text-warning',
  },
  transfer: {
    Icon: ArrowUpRight,
    color: 'text-accent',
    bg: 'bg-accent-subtle',
    sign: '',
    amountColor: 'text-accent',
  },
} as const

function getTransactionLabel(
  transaction: Transaction,
  categoryName: string | null,
  goalMap: Map<string, Goal>,
) {
  if (transaction.type === 'transfer') {
    if (transaction.goalId) {
      return `${transaction.goalTransferDirection === 'out' ? 'Goal Transfer Out' : 'Goal Savings'} · ${goalMap.get(transaction.goalId)?.name ?? 'Deleted Goal'}`
    }

    if (transaction.note) {
      return transaction.note
    }

    if (categoryName) {
      return categoryName
    }

    return 'Transfer'
  }

  if (categoryName) {
    return categoryName
  }

  if (transaction.note) {
    return transaction.note
  }

  return transaction.type
}

function getTransactionSubLabel(
  transaction: Transaction,
  accountMap: Map<string, Account>,
) {
  if (transaction.type === 'transfer') {
    const fromAccountName = transaction.fromAccountId
      ? (accountMap.get(transaction.fromAccountId)?.name ?? null)
      : null
    const toAccountName = transaction.toAccountId
      ? (accountMap.get(transaction.toAccountId)?.name ?? null)
      : null

    if (fromAccountName && toAccountName) {
      return `From ${fromAccountName} to ${toAccountName}`
    }

    if (
      transaction.goalId &&
      transaction.goalTransferDirection === 'out' &&
      toAccountName
    ) {
      return `To ${toAccountName}`
    }

    if (fromAccountName) {
      return `From ${fromAccountName}`
    }

    if (toAccountName) {
      return `To ${toAccountName}`
    }

    return 'Transfer'
  }

  return transaction.accountId
    ? (accountMap.get(transaction.accountId)?.name ?? null)
    : null
}

interface TransactionGroup {
  dateKey: string
  label: string
  items: Transaction[]
}

function groupByDate(transactions: Transaction[]): TransactionGroup[] {
  const groups: TransactionGroup[] = []

  for (const t of transactions) {
    const dateKey = getAppDateKey(t.transactionDate)
    const last = groups.at(-1)
    if (last?.dateKey === dateKey) {
      last.items.push(t)
    } else {
      groups.push({
        dateKey,
        label: formatAppDateLabel(t.transactionDate).toUpperCase(),
        items: [t],
      })
    }
  }

  return groups
}

export function TransactionList({
  transactions,
  accounts,
  categories,
  goals = [],
  onSelect,
}: TransactionListProps) {
  const accountMap = new Map(accounts.map((a) => [a.id, a]))
  const categoryMap = new Map(categories.map((c) => [c.id, c]))
  const goalMap = new Map(goals.map((goal) => [goal.id, goal]))

  const groups = groupByDate(transactions)

  return (
    <div className="space-y-6">
      {groups.map((group) => (
        <div key={group.dateKey}>
          <p className="text-foreground px-2 pt-1 pb-2 text-sm font-semibold tracking-widest">
            {group.label}
          </p>
          <div className="space-y-3">
            {group.items.map((t) => {
              const cfg = TYPE_CONFIG[t.type]
              const Icon = cfg.Icon
              const categoryName = t.categoryId
                ? (categoryMap.get(t.categoryId)?.name ?? null)
                : null
              const subLabel = getTransactionSubLabel(t, accountMap)
              const amountLabel = `${cfg.sign}${formatPhpCurrency(t.amount)}`

              return (
                <TransactionRow
                  key={t.id}
                  className="bg-card p-4 shadow"
                  label={getTransactionLabel(t, categoryName, goalMap)}
                  subLabel={subLabel}
                  amountLabel={amountLabel}
                  amountColor={cfg.amountColor}
                  rightSecondaryLabel={formatAppTime(t.transactionDate)}
                  Icon={Icon}
                  iconColor={cfg.color}
                  iconBg={cfg.bg}
                  onPress={onSelect ? () => onSelect(t) : undefined}
                />
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}

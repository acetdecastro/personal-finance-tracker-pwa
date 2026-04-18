import { formatAppDateTime } from '#/lib/dates'
import { formatPhpCurrency } from '#/lib/format/number.utils'
import type { Account, Category, Goal, Transaction } from '#/types/domain'

interface TransferDetailsProps {
  transaction: Transaction
  accounts: Account[]
  categories: Category[]
  goals?: Goal[]
}

function getTransferLabel(transaction: Transaction, goals: Goal[]) {
  if (!transaction.goalId) {
    return 'Transfer'
  }

  const goalName =
    goals.find((goal) => goal.id === transaction.goalId)?.name ?? 'Deleted Goal'

  return transaction.goalTransferDirection === 'out'
    ? `Goal Transfer Out · ${goalName}`
    : `Goal Savings · ${goalName}`
}

export function TransferDetails({
  transaction,
  accounts,
  categories,
  goals = [],
}: TransferDetailsProps) {
  const categoryName = transaction.categoryId
    ? (categories.find((category) => category.id === transaction.categoryId)
        ?.name ?? 'Transfer')
    : 'Transfer'
  const fromAccountName = transaction.fromAccountId
    ? (accounts.find((account) => account.id === transaction.fromAccountId)
        ?.name ?? 'Unknown account')
    : null
  const toAccountName = transaction.toAccountId
    ? (accounts.find((account) => account.id === transaction.toAccountId)
        ?.name ?? 'Unknown account')
    : null
  const goalName = transaction.goalId
    ? (goals.find((goal) => goal.id === transaction.goalId)?.name ??
      'Deleted Goal')
    : null

  return (
    <div className="space-y-4">
      <div className="bg-card rounded-2xl p-4">
        <p className="text-accent mt-2 text-xl font-bold">
          {formatPhpCurrency(transaction.amount)}
        </p>
        <p className="text-muted-foreground/70 mt-1 text-sm">
          {getTransferLabel(transaction, goals)}
        </p>
      </div>

      <div className="bg-card space-y-3 rounded-2xl p-4">
        <DetailRow
          label="Date and Time"
          value={formatAppDateTime(transaction.transactionDate)}
        />
        <DetailRow label="Category" value={categoryName} />
        {fromAccountName && (
          <DetailRow label="From Account" value={fromAccountName} />
        )}
        {toAccountName && (
          <DetailRow label="To Account" value={toAccountName} />
        )}
        {goalName && <DetailRow label="Savings Goal" value={goalName} />}
        {transaction.note && (
          <DetailRow label="Note" value={transaction.note} />
        )}
      </div>

      <p className="text-muted-foreground/70 text-xs">
        Transfer entries are read-only.
      </p>
    </div>
  )
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <p className="text-muted-foreground/70 shrink-0 text-[10px] font-bold tracking-widest uppercase">
        {label}
      </p>
      <p className="text-foreground text-right text-sm font-medium">{value}</p>
    </div>
  )
}

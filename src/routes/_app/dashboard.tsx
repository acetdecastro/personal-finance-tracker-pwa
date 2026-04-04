import { createFileRoute } from '@tanstack/react-router'
import { TrendingUp, Wallet, CalendarClock, ShieldCheck } from 'lucide-react'
import { SectionHeader } from '#/components/common/SectionHeader'
import { EmptyState } from '#/components/common/EmptyState'
import { TransactionList } from '#/features/transactions/components/TransactionList'
import { GoalCard } from '#/features/goals/components/GoalCard'
import { useTransactions } from '#/features/transactions/hooks/use-transactions'
import { useAccounts } from '#/features/accounts/hooks/use-accounts'
import { useCategories } from '#/features/categories/hooks/use-categories'
import { useRecurringRules } from '#/features/recurring/hooks/use-recurring-rules'
import { useGoals } from '#/features/goals/hooks/use-goals'
import { formatPhpCurrency } from '#/lib/format/number.utils'
import { formatDisplayDate } from '#/lib/dates'

export const Route = createFileRoute('/_app/dashboard')({
  component: DashboardRoute,
})

function DashboardRoute() {
  const { data: transactions = [] } = useTransactions()
  const { data: accounts = [] } = useAccounts()
  const { data: categories = [] } = useCategories()
  const { data: recurringRules = [] } = useRecurringRules()
  const { data: goals = [] } = useGoals()

  const recentTransactions = transactions.slice(0, 5)

  // Next salary: first active income recurring rule, ordered by nextOccurrenceDate
  const nextSalaryRule =
    recurringRules
      .filter((r) => r.type === 'income' && r.isActive)
      .sort((a, b) => a.nextOccurrenceDate.localeCompare(b.nextOccurrenceDate))
      .at(0) ?? null

  const primaryGoal = goals.at(0) ?? null

  return (
    <div className="space-y-6">
      {/* Balance hero — placeholder until Codex wires balance engine */}
      <div className="rounded-3xl bg-gradient-to-br from-emerald-700 to-emerald-800 p-6 dark:from-emerald-800 dark:to-emerald-900">
        <p className="mb-1 text-[11px] font-bold uppercase tracking-widest text-white/70">
          Total Balance
        </p>
        <p className="text-4xl font-extrabold tracking-tight text-white">
          {formatPhpCurrency(0)}
        </p>
        <p className="mt-1 text-xs text-white/50">
          Balance calculation coming in Phase 2
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-3">
        <SummaryCard
          label="Safe to Spend"
          value={formatPhpCurrency(0)}
          Icon={ShieldCheck}
          color="text-emerald-700 dark:text-emerald-400"
          bgColor="bg-emerald-50 dark:bg-emerald-950/30"
          note="Phase 2"
        />
        <SummaryCard
          label="Next Salary"
          value={nextSalaryRule ? formatDisplayDate(nextSalaryRule.nextOccurrenceDate) : '—'}
          Icon={CalendarClock}
          color="text-teal-600 dark:text-teal-400"
          bgColor="bg-teal-50 dark:bg-teal-950/30"
        />
        <SummaryCard
          label="In 7 Days"
          value={formatPhpCurrency(0)}
          Icon={TrendingUp}
          color="text-slate-500 dark:text-slate-400"
          bgColor="bg-slate-100 dark:bg-zinc-800"
          note="Phase 2"
        />
        <SummaryCard
          label="In 30 Days"
          value={formatPhpCurrency(0)}
          Icon={Wallet}
          color="text-slate-500 dark:text-slate-400"
          bgColor="bg-slate-100 dark:bg-zinc-800"
          note="Phase 2"
        />
      </div>

      {/* Goal */}
      {primaryGoal && (
        <div className="space-y-3">
          <SectionHeader title="Savings Goal" />
          <GoalCard goal={primaryGoal} />
        </div>
      )}

      {/* Recent transactions */}
      <div className="space-y-3">
        <SectionHeader title="Recent Activity" />
        {recentTransactions.length === 0 ? (
          <EmptyState
            title="No transactions yet"
            description="Add your first transaction from the Transactions tab."
          />
        ) : (
          <TransactionList
            transactions={recentTransactions}
            accounts={accounts}
            categories={categories}
          />
        )}
      </div>
    </div>
  )
}

interface SummaryCardProps {
  label: string
  value: string
  Icon: React.ElementType
  color: string
  bgColor: string
  note?: string
}

function SummaryCard({ label, value, Icon, color, bgColor, note }: SummaryCardProps) {
  return (
    <div className="rounded-2xl bg-white p-4 dark:bg-zinc-900">
      <div className={`mb-2 flex size-8 items-center justify-center rounded-xl ${bgColor}`}>
        <Icon className={`size-4 ${color}`} />
      </div>
      <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
        {label}
      </p>
      <p className="mt-0.5 text-base font-bold text-slate-900 dark:text-slate-100">{value}</p>
      {note && <p className="text-[10px] text-slate-300 dark:text-slate-600">{note}</p>}
    </div>
  )
}

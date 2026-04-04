import { createFileRoute } from '@tanstack/react-router'
import {
  ArrowDownLeft,
  ArrowLeftRight,
  ArrowUpRight,
  CalendarClock,
  Receipt,
  ShieldCheck,
  Target,
  TrendingUp,
  Wallet,
} from 'lucide-react'
import { SectionHeader } from '#/components/common/SectionHeader'
import { EmptyState } from '#/components/common/EmptyState'
import { BudgetList } from '#/features/budgets/components/BudgetList'
import { GoalCard } from '#/features/goals/components/GoalCard'
import { useDashboardData } from '#/features/dashboard/hooks/use-dashboard-data'
import { formatPhpCurrency } from '#/lib/format/number.utils'
import { formatDisplayDate } from '#/lib/dates'
import type {
  DashboardRecentTransactionDto,
  UpcomingBillDto,
} from '#/types/dto'

export const Route = createFileRoute('/_app/dashboard')({
  component: DashboardRoute,
})

function DashboardRoute() {
  const { data: dashboardData, isLoading } = useDashboardData()

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="rounded-3xl bg-card p-6 text-sm text-muted-foreground">
          Loading your dashboard…
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="rounded-3xl bg-linear-to-br from-emerald-700 to-emerald-800 p-6 dark:from-emerald-800 dark:to-emerald-900">
        <p className="mb-1 text-[11px] font-bold uppercase tracking-widest text-white/70">
          Total Balance
        </p>
        <p className="text-4xl font-extrabold tracking-tight text-white">
          {formatPhpCurrency(dashboardData?.currentBalance ?? 0)}
        </p>
        <p className="mt-1 text-xs text-white/50">
          Live total from accounts and posted transactions
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <SummaryCard
          label="Safe to Spend"
          value={formatPhpCurrency(dashboardData?.safeToSpend ?? 0)}
          Icon={ShieldCheck}
          color="text-primary"
          bgColor="bg-primary-subtle"
        />
        <SummaryCard
          label="Next Salary"
          value={
            dashboardData?.nextSalaryDate
              ? formatDisplayDate(dashboardData.nextSalaryDate)
              : '—'
          }
          Icon={CalendarClock}
          color="text-accent"
          bgColor="bg-accent-subtle"
        />
        <SummaryCard
          label="In 7 Days"
          value={formatPhpCurrency(dashboardData?.projectedBalance7d ?? 0)}
          Icon={TrendingUp}
          color="text-muted-foreground"
          bgColor="bg-muted"
        />
        <SummaryCard
          label="In 30 Days"
          value={formatPhpCurrency(dashboardData?.projectedBalance30d ?? 0)}
          Icon={Wallet}
          color="text-muted-foreground"
          bgColor="bg-muted"
        />
      </div>

      <div className="space-y-3">
        <SectionHeader title="Upcoming Bills" />
        {!dashboardData || dashboardData.upcomingBills.length === 0 ? (
          <EmptyState
            title="No upcoming bills"
            description="Recurring expenses will appear here once you add them in Settings."
          />
        ) : (
          <UpcomingBillsList bills={dashboardData.upcomingBills} />
        )}
      </div>

      {dashboardData?.goal && (
        <div className="space-y-3">
          <SectionHeader title="Savings Goal" />
          <GoalCard goal={dashboardData.goal} />
        </div>
      )}

      <div className="space-y-3">
        <SectionHeader title="Budget Health" />
        {!dashboardData || dashboardData.budgets.length === 0 ? (
          <EmptyState
            title="No budgets yet"
            description="Set monthly limits in Budget to see your spending health here."
          />
        ) : (
          <BudgetList budgets={dashboardData.budgets.slice(0, 3)} />
        )}
      </div>

      {dashboardData?.goal && (
        <div className="rounded-2xl bg-card p-4">
          <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-muted-foreground/70">
            <Target className="size-3.5" />
            Goal Progress
          </div>
          <p className="text-sm text-secondary-foreground">
            You still need{' '}
            <span className="font-semibold text-foreground">
              {formatPhpCurrency(dashboardData.goal.remainingAmount)}
            </span>{' '}
            to complete {dashboardData.goal.name}.
          </p>
        </div>
      )}

      <div className="space-y-3">
        <SectionHeader title="Recent Activity" />
        {!dashboardData || dashboardData.recentTransactions.length === 0 ? (
          <EmptyState
            title="No transactions yet"
            description="Add your first transaction from the Transactions tab."
          />
        ) : (
          <RecentActivityList
            transactions={dashboardData.recentTransactions}
          />
        )}
      </div>
    </div>
  )
}

const ACTIVITY_TYPE_CONFIG = {
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

function UpcomingBillsList({ bills }: { bills: UpcomingBillDto[] }) {
  return (
    <div className="space-y-2">
      {bills.map((bill) => (
        <div
          key={bill.id}
          className="flex items-center justify-between rounded-2xl bg-card p-4"
        >
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-muted">
              <Receipt className="size-5 text-muted-foreground" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-foreground">
                {bill.name}
              </p>
              <p className="text-xs text-muted-foreground/70">
                Due {formatDisplayDate(bill.date)}
              </p>
            </div>
          </div>
          <p className="shrink-0 text-sm font-bold text-foreground">
            {formatPhpCurrency(bill.amount)}
          </p>
        </div>
      ))}
    </div>
  )
}

function RecentActivityList({
  transactions,
}: {
  transactions: DashboardRecentTransactionDto[]
}) {
  return (
    <div className="space-y-1">
      {transactions.map((transaction) => {
        const config = ACTIVITY_TYPE_CONFIG[transaction.type]
        const Icon = config.Icon

        return (
          <div
            key={transaction.id}
            className="flex items-center gap-3 rounded-2xl bg-card p-4"
          >
            <div className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${config.bg}`}>
              <Icon className={`size-5 ${config.color}`} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-foreground">
                {transaction.categoryName ?? transaction.note ?? transaction.type}
              </p>
              <p className="text-xs text-muted-foreground/70">
                {transaction.accountName ?? 'Unassigned'}
                {' · '}
                {formatDisplayDate(transaction.transactionDate)}
              </p>
            </div>
            <p className={`shrink-0 text-sm font-bold ${config.amountColor}`}>
              {config.sign}
              {formatPhpCurrency(transaction.amount)}
            </p>
          </div>
        )
      })}
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
    <div className="rounded-2xl bg-card p-4">
      <div className={`mb-2 flex size-8 items-center justify-center rounded-xl ${bgColor}`}>
        <Icon className={`size-4 ${color}`} />
      </div>
      <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground/70">
        {label}
      </p>
      <p className="mt-0.5 text-base font-bold text-foreground">{value}</p>
      {note && <p className="text-[10px] text-muted-foreground/40">{note}</p>}
    </div>
  )
}

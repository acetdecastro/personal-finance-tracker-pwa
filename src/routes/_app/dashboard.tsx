import { createFileRoute, Link } from '@tanstack/react-router'
import { SectionHeader } from '#/components/common/SectionHeader'
import { EmptyState } from '#/components/common/EmptyState'
import { BudgetList } from '#/features/budgets/components/BudgetList'
import { GoalCard } from '#/features/goals/components/GoalCard'
import { TransactionRow } from '#/features/transactions/components/TransactionRow'
import { useDashboardData } from '#/features/dashboard/hooks/use-dashboard-data'
import {
  formatPhpCurrency,
  getCurrencyTextSizeClass,
} from '#/lib/format/number.utils'
import { formatCompactDisplayDate, formatDisplayDate } from '#/lib/dates'
import { cn } from '#/lib/utils/cn'
import type {
  DashboardRecentTransactionDto,
  UpcomingBillDto,
} from '#/types/dto'
import { TYPE_CONFIG } from '#/features/transactions/components/TransactionList'

export const Route = createFileRoute('/_app/dashboard')({
  component: DashboardRoute,
})

function DashboardRoute() {
  const { data: dashboardData, isLoading } = useDashboardData()
  const totalBalanceLabel = formatPhpCurrency(
    dashboardData?.currentBalance ?? 0,
  )

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="bg-card text-muted-foreground rounded-3xl p-6 text-sm">
          Loading your dashboard…
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="rounded-3xl bg-linear-to-br from-emerald-800 to-lime-600/90 p-6 shadow-lg">
        <p className="mb-1 text-[11px] font-bold tracking-widest text-white/70 uppercase">
          Total Balance
        </p>
        <p
          title={totalBalanceLabel}
          className={cn(
            'truncate font-extrabold tracking-tight text-white tabular-nums',
            getCurrencyTextSizeClass(totalBalanceLabel, 'hero'),
          )}
        >
          {totalBalanceLabel}
        </p>
        <p className="mt-1 text-xs text-white/50">
          Live total from accounts and posted transactions
        </p>
      </div>

      <div className="space-y-3">
        <SummaryCard
          label="Safe to Spend"
          value={formatPhpCurrency(dashboardData?.safeToSpend ?? 0)}
          description="Available after buffers and fixed bills."
        />
        <SummaryCard
          label="Next Salary"
          value={
            dashboardData?.nextSalaryDate
              ? formatDisplayDate(dashboardData.nextSalaryDate)
              : '—'
          }
          description="Next expected income date."
        />
        <SummaryCard
          label="In 7 Days"
          value={formatPhpCurrency(dashboardData?.projectedBalance7d ?? 0)}
          description="Projected balance in one week."
        />
        <SummaryCard
          label="In 30 Days"
          value={formatPhpCurrency(dashboardData?.projectedBalance30d ?? 0)}
          description="Projected balance in one month."
        />
      </div>

      <div className="space-y-3">
        <SectionHeader
          title="Upcoming expenses"
          action={<SeeAllLink to="/settings" />}
        />
        {!dashboardData || dashboardData.upcomingBills.length === 0 ? (
          <EmptyState
            title="No upcoming expenses"
            description="Recurring expenses will appear here once you add them in Settings."
          />
        ) : (
          <UpcomingBillsList bills={dashboardData.upcomingBills.slice(0, 3)} />
        )}
      </div>

      <div className="space-y-3">
        <div className="space-y-3">
          <SectionHeader
            title="Savings Goals"
            action={<SeeAllLink to="/budget" />}
          />
          {!dashboardData || dashboardData.goals.length === 0 ? (
            <EmptyState
              title="No goals yet"
              description="Goals will appear here once you add them in Budget."
            />
          ) : (
            <div className="space-y-3">
              {dashboardData.goals.slice(0, 3).map((goal) => (
                <GoalCard key={goal.id} goal={goal} />
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="space-y-3">
        <SectionHeader
          title="Budget Health"
          action={<SeeAllLink to="/budget" />}
        />
        {!dashboardData || dashboardData.budgets.length === 0 ? (
          <EmptyState
            title="No budgets yet"
            description="Set monthly limits in Budget to see your spending health here."
          />
        ) : (
          <BudgetList budgets={dashboardData.budgets.slice(0, 3)} />
        )}
      </div>

      <div className="space-y-3">
        <SectionHeader
          title="Recent Transactions"
          action={<SeeAllLink to="/transactions" />}
        />
        {!dashboardData || dashboardData.recentTransactions.length === 0 ? (
          <EmptyState
            title="No transactions yet"
            description="Add your first transaction from the Transactions tab."
          />
        ) : (
          <RecentTransactionsList
            transactions={dashboardData.recentTransactions.slice(0, 3)}
          />
        )}
      </div>
    </div>
  )
}

function SeeAllLink({ to }: { to: string }) {
  return (
    <Link
      to={to}
      className="text-foreground text-sm font-semibold transition-opacity hover:opacity-70"
    >
      See all
    </Link>
  )
}

function UpcomingBillsList({ bills }: { bills: UpcomingBillDto[] }) {
  return (
    <div className="space-y-3">
      {bills.map((bill) => (
        <div
          key={bill.id}
          className="bg-card flex items-start justify-between rounded-2xl p-4 shadow"
        >
          <div className="flex min-w-0 items-center gap-3">
            <div className="min-w-0">
              <p className="text-foreground truncate text-xs font-semibold">
                {bill.name}
              </p>
              <p className="text-muted-foreground/70 text-[10px]">
                Due {formatDisplayDate(bill.date)}
              </p>
            </div>
          </div>
          <p
            title={formatPhpCurrency(bill.amount)}
            className={cn(
              'text-foreground max-w-34 shrink-0 truncate text-right font-bold tabular-nums',
              getCurrencyTextSizeClass(formatPhpCurrency(bill.amount), 'list'),
            )}
          >
            {formatPhpCurrency(bill.amount)}
          </p>
        </div>
      ))}
    </div>
  )
}

function RecentTransactionsList({
  transactions,
}: {
  transactions: DashboardRecentTransactionDto[]
}) {
  return (
    <div className="space-y-4">
      {transactions.map((transaction) => {
        const config = TYPE_CONFIG[transaction.type]
        const Icon = config.Icon
        const label =
          transaction.type === 'transfer'
            ? (transaction.note ?? transaction.categoryName ?? 'Transfer')
            : (transaction.categoryName ?? transaction.note ?? transaction.type)
        const subLabel =
          transaction.type === 'transfer'
            ? transaction.note?.startsWith('Goal Transfer Out')
              ? transaction.accountName
                ? `To ${transaction.accountName}`
                : 'Transfer'
              : transaction.accountName
                ? `From ${transaction.accountName}`
                : 'Transfer'
            : (transaction.accountName ?? 'Unassigned')

        return (
          <TransactionRow
            key={transaction.id}
            className="bg-card p-4 shadow"
            label={label}
            subLabel={subLabel}
            amountLabel={`${config.sign}${formatPhpCurrency(transaction.amount)}`}
            rightSecondaryLabel={formatCompactDisplayDate(
              transaction.transactionDate,
            )}
            amountColor={config.amountColor}
            Icon={Icon}
            iconColor={config.color}
            iconBg={config.bg}
          />
        )
      })}
    </div>
  )
}

interface SummaryCardProps {
  label: string
  value: string
  description?: string
  Icon?: React.ElementType
  color?: string
  bgColor?: string
  note?: string
}

function SummaryCard({ label, value, description, note }: SummaryCardProps) {
  return (
    <div className="bg-card rounded-2xl p-4 shadow">
      <div className="flex items-center gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0 flex-1">
              <p className="text-foreground text-[10px] font-bold tracking-widest uppercase">
                {label}
              </p>
              {description && (
                <p className="text-muted-foreground/70 mt-0.5 line-clamp-3 text-[10px] leading-snug">
                  {description}
                </p>
              )}
              {note && (
                <p className="text-muted-foreground/70 mt-1 text-[10px]">
                  {note}
                </p>
              )}
            </div>
            <p
              title={value}
              className={cn(
                'text-foreground max-w-36 shrink-0 truncate text-right font-bold tabular-nums',
                getCurrencyTextSizeClass(value, 'summary'),
              )}
            >
              {value}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

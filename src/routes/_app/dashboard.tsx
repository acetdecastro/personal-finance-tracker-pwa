import { useState } from 'react'
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { ChevronLeft, ChevronRight, Lightbulb, Plus } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '#/components/common/Button'
import { BottomSheet } from '#/components/common/BottomSheet'
import { SectionHeader } from '#/components/common/SectionHeader'
import { EmptyState } from '#/components/common/EmptyState'
import { BudgetList } from '#/features/budgets/components/BudgetList'
import { BudgetForm } from '#/features/budgets/components/BudgetForm'
import { GoalCard } from '#/features/goals/components/GoalCard'
import { GoalForm } from '#/features/goals/components/GoalForm'
import { TransactionRow } from '#/features/transactions/components/TransactionRow'
import { TransactionForm } from '#/features/transactions/components/TransactionForm'
import { useDashboardData } from '#/features/dashboard/hooks/use-dashboard-data'
import { useUser } from '#/features/user/hooks/use-user'
import {
  useBudgetPageData,
  useCreateBudget,
} from '#/features/budgets/hooks/use-budgets'
import { useCreateGoal } from '#/features/goals/hooks/use-goals'
import {
  useTransactionFormOptions,
  useCreateTransaction,
} from '#/features/transactions/hooks/use-transactions'
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
import type { CreateBudgetInput } from '#/features/budgets/schemas/budget.schemas'
import type { CreateGoalInput } from '#/features/goals/schemas/goal.schemas'
import type { CreateTransactionInput } from '#/features/transactions/schemas/transaction.schemas'
import { TYPE_CONFIG } from '#/features/transactions/components/TransactionList'

export const Route = createFileRoute('/_app/dashboard')({
  component: DashboardRoute,
})

const DASHBOARD_TIPS = [
  'Add recurring transactions in settings for salary and bills so your dashboardprojections stay useful.',
  'Use account safety buffers to protect money you do not want Safe to Spend to touch.',
  'Create monthly budgets for your biggest expense categories to catch overspending early.',
  'Add savings to goals so your goal progress matches your real balances.',
  'Export a JSON backup regularly in settings since your data is stored locally on this device.',
  'You can import your JSON backup from the onboarding screen or settings.',
] as const

function getGreeting() {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 18) return 'Good afternoon'
  return 'Good evening'
}

function DashboardRoute() {
  const navigate = useNavigate()
  const { data: dashboardData, isLoading } = useDashboardData()
  const { data: user } = useUser()
  const { data: budgetPageData } = useBudgetPageData()
  const { data: transactionFormOptions } = useTransactionFormOptions()
  const createBudget = useCreateBudget()
  const createGoal = useCreateGoal()
  const createTransaction = useCreateTransaction()
  const [tipIndex, setTipIndex] = useState(0)
  const [openSheet, setOpenSheet] = useState<
    null | 'budget' | 'goal' | 'transaction'
  >(null)
  const totalBalanceLabel = formatPhpCurrency(
    dashboardData?.currentBalance ?? 0,
  )

  async function handleBudgetSubmit(values: CreateBudgetInput) {
    await createBudget.mutateAsync(values)
    toast.success('Budget created')
    setOpenSheet(null)
  }

  async function handleGoalSubmit(values: CreateGoalInput) {
    await createGoal.mutateAsync(values)
    toast.success('Goal created')
    setOpenSheet(null)
  }

  async function handleTransactionSubmit(values: CreateTransactionInput) {
    await createTransaction.mutateAsync(values)
    toast.success('Transaction added')
    setOpenSheet(null)
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="text-muted-foreground rounded-3xl p-6 text-sm">
          Loading your dashboard…
        </div>
      </div>
    )
  }

  const billsEmpty = !dashboardData || dashboardData.upcomingBills.length === 0
  const goalsEmpty = !dashboardData || dashboardData.goals.length === 0
  const budgetsEmpty = !dashboardData || dashboardData.budgets.length === 0
  const transactionsEmpty =
    !dashboardData || dashboardData.recentTransactions.length === 0

  return (
    <div className="space-y-6">
      {user?.name && (
        <div>
          <p className="text-muted-foreground text-xs">{getGreeting()},</p>
          <h1 className="text-foreground text-xl font-bold tracking-tight">
            {user.name}
          </h1>
        </div>
      )}

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
          action={
            <SectionAction
              isEmpty={billsEmpty}
              to="/settings"
              onAdd={() => void navigate({ to: '/settings' })}
            />
          }
        />
        {billsEmpty ? (
          <EmptyState
            title="No upcoming expenses"
            description="Recurring expenses will appear here once you add them in Settings."
          />
        ) : (
          <UpcomingBillsList bills={dashboardData.upcomingBills.slice(0, 3)} />
        )}
      </div>

      <div className="space-y-3">
        <SectionHeader
          title="Savings Goals"
          action={
            <SectionAction
              isEmpty={goalsEmpty}
              to="/budget"
              onAdd={() => setOpenSheet('goal')}
            />
          }
        />
        {goalsEmpty ? (
          <EmptyState
            title="No goals yet"
            description="Goals will appear here once you add them in the Budget tab."
          />
        ) : (
          <div className="space-y-3">
            {dashboardData.goals.slice(0, 3).map((goal) => (
              <GoalCard key={goal.id} goal={goal} />
            ))}
          </div>
        )}
      </div>

      <div className="space-y-3">
        <SectionHeader
          title="Budget Health"
          action={
            <SectionAction
              isEmpty={budgetsEmpty}
              to="/budget"
              onAdd={() => setOpenSheet('budget')}
            />
          }
        />
        {budgetsEmpty ? (
          <EmptyState
            title="No budgets yet"
            description="Add monthly limits in the Budget tab to see your spending health here."
          />
        ) : (
          <BudgetList budgets={dashboardData.budgets.slice(0, 3)} />
        )}
      </div>

      <div className="space-y-3">
        <SectionHeader
          title="Recent Transactions"
          action={
            <SectionAction
              isEmpty={transactionsEmpty}
              to="/transactions"
              onAdd={() => setOpenSheet('transaction')}
            />
          }
        />
        {transactionsEmpty ? (
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

      <div className="space-y-3">
        <TipBox
          tip={DASHBOARD_TIPS[tipIndex]}
          current={tipIndex + 1}
          total={DASHBOARD_TIPS.length}
          onPrevious={() =>
            setTipIndex((current) =>
              current === 0 ? DASHBOARD_TIPS.length - 1 : current - 1,
            )
          }
          onNext={() =>
            setTipIndex((current) =>
              current === DASHBOARD_TIPS.length - 1 ? 0 : current + 1,
            )
          }
        />
      </div>

      {openSheet === 'budget' && (
        <BottomSheet onClose={() => setOpenSheet(null)} title="Add Budget">
          <BudgetForm
            categories={budgetPageData?.expenseCategoryOptions ?? []}
            onSubmit={handleBudgetSubmit}
            onCancel={() => setOpenSheet(null)}
            submitLabel="Create Budget"
          />
        </BottomSheet>
      )}

      {openSheet === 'goal' && (
        <BottomSheet onClose={() => setOpenSheet(null)} title="Add Goal">
          <GoalForm
            onSubmit={handleGoalSubmit}
            onCancel={() => setOpenSheet(null)}
            submitLabel="Create Goal"
          />
        </BottomSheet>
      )}

      {openSheet === 'transaction' && transactionFormOptions && (
        <BottomSheet onClose={() => setOpenSheet(null)} title="Add Transaction">
          <TransactionForm
            formOptions={transactionFormOptions}
            onSubmit={handleTransactionSubmit}
            onCancel={() => setOpenSheet(null)}
            submitLabel="Add Transaction"
          />
        </BottomSheet>
      )}
    </div>
  )
}

function SectionAction({
  isEmpty,
  to,
  onAdd,
}: {
  isEmpty: boolean
  to: string
  onAdd: () => void
}) {
  if (isEmpty) {
    return (
      <Button
        type="button"
        onClick={onAdd}
        variant="inline-primary"
        // className="text-foreground text-sm font-semibold transition-opacity hover:opacity-70"
      >
        <Plus className="size-3.5" />
        Add
      </Button>
    )
  }
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

interface TipBoxProps {
  tip: string
  current: number
  total: number
  onPrevious: () => void
  onNext: () => void
}

function TipBox({ tip, current, total, onPrevious, onNext }: TipBoxProps) {
  return (
    <div className="bg-card rounded-2xl p-4 shadow">
      <div className="flex items-start gap-3">
        <div className="bg-primary-subtle flex size-10 shrink-0 items-center justify-center rounded-xl">
          <Lightbulb className="text-primary size-4" />
        </div>
        <div className="min-w-0 flex-1 space-y-3">
          <div className="space-y-1">
            <p className="text-foreground text-sm font-semibold">Quick tip</p>
            <p className="text-muted-foreground text-sm leading-relaxed">
              {tip}
            </p>
          </div>
          <div className="flex items-center justify-between gap-3">
            <p className="text-muted-foreground text-xs">
              {current} of {total}
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="icon"
                className="bg-muted hover:bg-muted rounded-lg p-2"
                onClick={onPrevious}
                aria-label="Previous tip"
              >
                <ChevronLeft className="size-4" />
              </Button>
              <Button
                variant="icon"
                className="bg-muted hover:bg-muted rounded-lg p-2"
                onClick={onNext}
                aria-label="Next tip"
              >
                <ChevronRight className="size-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

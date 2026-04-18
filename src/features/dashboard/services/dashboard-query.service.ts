import type { FinanceTrackerDatabase } from '#/db/dexie'
import { parseISO } from 'date-fns'
import { db } from '#/db/dexie'
import { createAccountRepository } from '#/features/accounts/services/account.repository'
import { createBudgetRepository } from '#/features/budgets/services/budget.repository'
import { calculateBudgetSnapshots } from '#/features/budgets/services/budget.service'
import { createCategoryRepository } from '#/features/categories/services/category.repository'
import { createGoalRepository } from '#/features/goals/services/goal.repository'
import { calculateGoalSnapshots } from '#/features/goals/services/goal.service'
import { createRecurringRuleRepository } from '#/features/recurring/services/recurring-rule.repository'
import { createTransactionRepository } from '#/features/transactions/services/transaction.repository'
import { calculateForecastSummary } from '#/services/forecast/forecast.service'
import { seedCoreData } from '#/services/seed/seed.service'
import { isSameAppMonth } from '#/lib/dates'
import type { DashboardData, DashboardRecentTransactionDto } from '#/types/dto'

interface GetDashboardDataOptions {
  now?: Date | string
}

const BALANCE_MAINTENANCE_NOTES = new Set([
  'Balance adjustment',
  'Balance top-up',
])

function toDate(value: Date | string | undefined): Date {
  if (!value) {
    return new Date()
  }

  return value instanceof Date ? value : parseISO(value)
}

function isBalanceMaintenanceTransaction(note: string | null): boolean {
  return note ? BALANCE_MAINTENANCE_NOTES.has(note) : false
}

export function createDashboardQueryService(
  database: FinanceTrackerDatabase = db,
) {
  const accountRepository = createAccountRepository(database)
  const budgetRepository = createBudgetRepository(database)
  const categoryRepository = createCategoryRepository(database)
  const goalRepository = createGoalRepository(database)
  const recurringRuleRepository = createRecurringRuleRepository(database)
  const transactionRepository = createTransactionRepository(database)

  return {
    async getDashboardData(
      options: GetDashboardDataOptions = {},
    ): Promise<DashboardData> {
      await seedCoreData(database)

      const [
        accounts,
        budgets,
        categories,
        goals,
        recurringRules,
        transactions,
      ] = await Promise.all([
        accountRepository.list(),
        budgetRepository.list(),
        categoryRepository.list(),
        goalRepository.list(),
        recurringRuleRepository.list(),
        transactionRepository.list(),
      ])

      const forecast = calculateForecastSummary({
        accounts,
        transactions,
        recurringRules,
        now: options.now,
      })

      const accountMap = new Map(
        accounts.map((account) => [account.id, account.name]),
      )
      const categoryMap = new Map(
        categories.map((category) => [category.id, category.name]),
      )
      const goalMap = new Map(goals.map((goal) => [goal.id, goal.name]))
      const monthReference = toDate(options.now)
      const monthlyTotals = transactions.reduce(
        (totals, transaction) => {
          if (
            !isSameAppMonth(transaction.transactionDate, monthReference) ||
            isBalanceMaintenanceTransaction(transaction.note)
          ) {
            return totals
          }

          if (transaction.type === 'income') {
            totals.inflow += transaction.amount
          }

          if (transaction.type === 'expense') {
            totals.outflow += transaction.amount
          }

          return totals
        },
        { inflow: 0, outflow: 0 },
      )

      const recentTransactions: DashboardRecentTransactionDto[] = transactions
        .slice(0, 5)
        .map((transaction) => ({
          id: transaction.id,
          type: transaction.type,
          amount: transaction.amount,
          categoryName: transaction.categoryId
            ? (categoryMap.get(transaction.categoryId) ?? null)
            : null,
          accountName: transaction.accountId
            ? (accountMap.get(transaction.accountId) ?? null)
            : transaction.toAccountId
              ? (accountMap.get(transaction.toAccountId) ?? null)
              : transaction.fromAccountId
                ? (accountMap.get(transaction.fromAccountId) ?? null)
                : null,
          note: transaction.goalId
            ? `${transaction.goalTransferDirection === 'out' ? 'Goal Transfer Out' : 'Goal Savings'} · ${goalMap.get(transaction.goalId) ?? 'Deleted Goal'}`
            : transaction.note,
          transactionDate: transaction.transactionDate,
        }))

      return {
        currentBalance: forecast.currentBalance,
        monthlyInflow: monthlyTotals.inflow,
        monthlyOutflow: monthlyTotals.outflow,
        safeToSpend: forecast.safeToSpend,
        nextSalaryDate: forecast.nextSalaryDate,
        projectedBalance7d: forecast.projectedBalance7d,
        projectedBalance14d: forecast.projectedBalance14d,
        projectedBalance30d: forecast.projectedBalance30d,
        lowestProjectedBalance30d: forecast.lowestProjectedBalance30d,
        upcomingBills: forecast.expenseOccurrences
          .slice(0, 5)
          .map((occurrence) => ({
            id: occurrence.id,
            name: occurrence.name,
            amount: occurrence.amount,
            date: occurrence.date,
          })),
        budgets: calculateBudgetSnapshots({
          budgets,
          categories,
          transactions,
          referenceDate: options.now,
        }),
        goals: calculateGoalSnapshots(goals, transactions),
        recentTransactions,
      }
    },
  }
}

export const dashboardQueryService = createDashboardQueryService()

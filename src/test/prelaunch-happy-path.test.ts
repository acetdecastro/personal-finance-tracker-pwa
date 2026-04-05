import { afterEach, describe, expect, it } from 'vitest'
import { createBudgetRepository } from '#/features/budgets/services/budget.repository'
import { createBudgetPageQueryService } from '#/features/budgets/services/budget-page-query.service'
import { createDashboardQueryService } from '#/features/dashboard/services/dashboard-query.service'
import { createGoalManagementService } from '#/features/goals/services/goal-management.service'
import { createGoalRepository } from '#/features/goals/services/goal.repository'
import { createOnboardingService } from '#/features/onboarding/services/onboarding.service'
import { createTransactionRepository } from '#/features/transactions/services/transaction.repository'
import { DEFAULT_TRANSFER_CATEGORIES } from '#/services/seed/seed-data'
import { createTestDatabase, destroyTestDatabase } from './test-db'

const databases: ReturnType<typeof createTestDatabase>[] = []

afterEach(async () => {
  await Promise.all(
    databases.splice(0).map((database) => destroyTestDatabase(database)),
  )
})

describe('prelaunch happy path', () => {
  it('covers onboarding, budgeting, transactions, goal transfers, and dashboard updates', async () => {
    const database = createTestDatabase()
    databases.push(database)

    const onboardingService = createOnboardingService(database)
    const budgetRepository = createBudgetRepository(database)
    const goalRepository = createGoalRepository(database)
    const transactionRepository = createTransactionRepository(database)
    const budgetPageQueryService = createBudgetPageQueryService(database)
    const dashboardQueryService = createDashboardQueryService(database)
    const goalManagementService = createGoalManagementService(database)

    const onboarding = await onboardingService.complete({
      userName: 'Test User',
      primaryAccount: {
        name: 'Main Wallet',
        type: 'ewallet',
        initialBalance: 5000,
        safetyBuffer: 1000,
        isArchived: false,
      },
      salary: {
        name: 'Salary',
        amount: 15000,
        cadence: 'semi-monthly',
        semiMonthlyDays: [15, 30],
        monthlyDay: null,
        weeklyInterval: null,
        nextOccurrenceDate: '2026-04-15T00:00:00.000Z',
      },
      recurringExpenses: [],
    })

    await budgetRepository.create({
      categoryId: 'category-expense-food',
      amount: 2000,
      periodType: 'monthly',
    })

    const goal = await goalRepository.create({
      name: 'Emergency Fund',
      targetAmount: 10000,
      currentAmount: 0,
      targetDate: null,
    })

    await transactionRepository.create({
      type: 'expense',
      amount: 500,
      categoryId: 'category-expense-food',
      accountId: onboarding.primaryAccount.id,
      fromAccountId: null,
      toAccountId: null,
      goalId: null,
      goalTransferDirection: null,
      note: 'Groceries',
      transactionDate: '2026-04-05T00:00:00.000Z',
      recurringRuleId: null,
    })

    const budgetPageAfterExpense =
      await budgetPageQueryService.getBudgetPageData({
        now: '2026-04-05T00:00:00.000Z',
      })

    expect(budgetPageAfterExpense.budgetSnapshots[0]).toMatchObject({
      categoryName: 'Food',
      spentAmount: 500,
      remainingAmount: 1500,
    })

    await transactionRepository.create({
      type: 'transfer',
      amount: 1000,
      categoryId: DEFAULT_TRANSFER_CATEGORIES[0].id,
      accountId: null,
      fromAccountId: onboarding.primaryAccount.id,
      toAccountId: null,
      goalId: goal.id,
      goalTransferDirection: 'in',
      note: `Goal Savings · ${goal.name}`,
      transactionDate: '2026-04-06T00:00:00.000Z',
      recurringRuleId: null,
    })

    const dashboardAfterTransferIn =
      await dashboardQueryService.getDashboardData({
        now: '2026-04-06T00:00:00.000Z',
      })

    expect(dashboardAfterTransferIn.currentBalance).toBe(3500)
    expect(
      dashboardAfterTransferIn.goals.find((item) => item.id === goal.id),
    ).toMatchObject({
      currentAmount: 1000,
      remainingAmount: 9000,
      percentComplete: 10,
    })

    await transactionRepository.create({
      type: 'transfer',
      amount: 1000,
      categoryId: DEFAULT_TRANSFER_CATEGORIES[0].id,
      accountId: null,
      fromAccountId: null,
      toAccountId: onboarding.primaryAccount.id,
      goalId: goal.id,
      goalTransferDirection: 'out',
      note: `Goal Transfer Out · ${goal.name}`,
      transactionDate: '2026-04-07T00:00:00.000Z',
      recurringRuleId: null,
    })

    const dashboardAfterTransferOut =
      await dashboardQueryService.getDashboardData({
        now: '2026-04-07T00:00:00.000Z',
      })
    const goalUsage = await goalManagementService.getUsage(goal.id)

    expect(dashboardAfterTransferOut.currentBalance).toBe(4500)
    expect(
      dashboardAfterTransferOut.goals.find((item) => item.id === goal.id),
    ).toMatchObject({
      currentAmount: 0,
      remainingAmount: 10000,
      percentComplete: 0,
    })
    expect(goalUsage).toMatchObject({
      goalId: goal.id,
      currentAmount: 0,
      linkedTransferCount: 2,
      canDelete: true,
      deleteNotice:
        'Linked transfer history will remain and be labeled as Deleted Goal.',
    })
  })
})

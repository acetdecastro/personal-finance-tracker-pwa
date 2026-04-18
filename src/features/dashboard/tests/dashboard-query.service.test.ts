import { afterEach, describe, expect, it } from 'vitest'
import { createAccountRepository } from '#/features/accounts/services/account.repository'
import { createBudgetRepository } from '#/features/budgets/services/budget.repository'
import { createGoalRepository } from '#/features/goals/services/goal.repository'
import { createRecurringRuleRepository } from '#/features/recurring/services/recurring-rule.repository'
import { createTransactionRepository } from '#/features/transactions/services/transaction.repository'
import { seedCoreData } from '#/services/seed/seed.service'
import { DEFAULT_TRANSFER_CATEGORIES } from '#/services/seed/seed-data'
import { createDashboardQueryService } from '../services/dashboard-query.service'
import { createTestDatabase, destroyTestDatabase } from '#/test/test-db'

const databases: ReturnType<typeof createTestDatabase>[] = []

afterEach(async () => {
  await Promise.all(
    databases.splice(0).map((database) => destroyTestDatabase(database)),
  )
})

describe('dashboardQueryService', () => {
  it('assembles dashboard data from persisted accounts, transactions, recurring rules, budgets, goals, and settings', async () => {
    const database = createTestDatabase()
    databases.push(database)

    const accountRepository = createAccountRepository(database)
    const transactionRepository = createTransactionRepository(database)
    const recurringRuleRepository = createRecurringRuleRepository(database)
    const budgetRepository = createBudgetRepository(database)
    const goalRepository = createGoalRepository(database)
    const dashboardQueryService = createDashboardQueryService(database)

    await seedCoreData(database)

    const account = await accountRepository.create({
      name: 'Main Wallet',
      type: 'ewallet',
      initialBalance: 1000,
      safetyBuffer: 500,
      isArchived: false,
    })

    await transactionRepository.create({
      type: 'expense',
      amount: 200,
      categoryId: 'category-expense-food',
      accountId: account.id,
      fromAccountId: null,
      toAccountId: null,
      note: 'Groceries',
      transactionDate: '2026-04-03T00:00:00.000Z',
      recurringRuleId: null,
    })

    await recurringRuleRepository.create({
      name: 'Salary',
      type: 'income',
      amount: 5000,
      categoryId: 'category-income-salary',
      accountId: account.id,
      cadence: 'semi-monthly',
      semiMonthlyDays: [15, 30],
      monthlyDay: null,
      weeklyInterval: null,
      nextOccurrenceDate: '2026-04-15T00:00:00.000Z',
      isActive: true,
    })

    await recurringRuleRepository.create({
      name: 'Rent',
      type: 'expense',
      amount: 3000,
      categoryId: 'category-expense-rent',
      accountId: account.id,
      cadence: 'monthly',
      semiMonthlyDays: null,
      monthlyDay: 10,
      weeklyInterval: null,
      nextOccurrenceDate: '2026-04-10T00:00:00.000Z',
      isActive: true,
    })

    await budgetRepository.create({
      categoryId: 'category-expense-food',
      amount: 1000,
      periodType: 'monthly',
    })

    await goalRepository.create({
      name: 'Emergency Fund',
      targetAmount: 10000,
      currentAmount: 2000,
      targetDate: null,
    })

    const dashboardData = await dashboardQueryService.getDashboardData({
      now: '2026-04-05T00:00:00.000Z',
    })

    expect(dashboardData.currentBalance).toBe(800)
    expect(dashboardData.safeToSpend).toBe(-2700)
    expect(dashboardData.nextSalaryDate).toBe('2026-04-15T00:00:00.000Z')
    expect(dashboardData.upcomingBills[0]?.name).toBe('Rent')
    expect(dashboardData.budgets[0]?.spentAmount).toBe(200)
    expect(dashboardData.goals[0]?.percentComplete).toBe(20)
    expect(dashboardData.recentTransactions[0]?.categoryName).toBe('Food')
  })

  it('labels linked transfer history against a missing goal as Deleted Goal', async () => {
    const database = createTestDatabase()
    databases.push(database)

    const accountRepository = createAccountRepository(database)
    const transactionRepository = createTransactionRepository(database)
    const dashboardQueryService = createDashboardQueryService(database)

    await seedCoreData(database)

    const account = await accountRepository.create({
      name: 'Main Wallet',
      type: 'ewallet',
      initialBalance: 1000,
      safetyBuffer: 0,
      isArchived: false,
    })

    await transactionRepository.create({
      type: 'transfer',
      amount: 300,
      categoryId: DEFAULT_TRANSFER_CATEGORIES[0].id,
      accountId: null,
      fromAccountId: account.id,
      toAccountId: null,
      goalId: 'deleted-goal-id',
      note: 'Goal Savings · Old Name',
      transactionDate: '2026-04-05T00:00:00.000Z',
      recurringRuleId: null,
    })

    const dashboardData = await dashboardQueryService.getDashboardData({
      now: '2026-04-05T00:00:00.000Z',
    })

    expect(dashboardData.recentTransactions[0]?.note).toBe(
      'Goal Savings · Deleted Goal',
    )
  })

  it('summarizes current-month inflow and outflow without counting transfers or balance maintenance transactions', async () => {
    const database = createTestDatabase()
    databases.push(database)

    const accountRepository = createAccountRepository(database)
    const transactionRepository = createTransactionRepository(database)
    const dashboardQueryService = createDashboardQueryService(database)

    await seedCoreData(database)

    const checking = await accountRepository.create({
      name: 'Checking',
      type: 'bank',
      initialBalance: 1000,
      safetyBuffer: 0,
      isArchived: false,
    })
    const savings = await accountRepository.create({
      name: 'Savings',
      type: 'bank',
      initialBalance: 0,
      safetyBuffer: 0,
      isArchived: false,
    })

    await transactionRepository.create({
      type: 'income',
      amount: 12000,
      categoryId: 'category-income-salary',
      accountId: checking.id,
      fromAccountId: null,
      toAccountId: null,
      note: 'Salary',
      transactionDate: '2026-04-15T00:00:00.000Z',
      recurringRuleId: null,
    })
    await transactionRepository.create({
      type: 'expense',
      amount: 3500,
      categoryId: 'category-expense-food',
      accountId: checking.id,
      fromAccountId: null,
      toAccountId: null,
      note: 'Groceries',
      transactionDate: '2026-04-16T00:00:00.000Z',
      recurringRuleId: null,
    })
    await transactionRepository.create({
      type: 'income',
      amount: 9000,
      categoryId: 'category-income-salary',
      accountId: checking.id,
      fromAccountId: null,
      toAccountId: null,
      note: 'Previous salary',
      transactionDate: '2026-03-15T00:00:00.000Z',
      recurringRuleId: null,
    })
    await transactionRepository.create({
      type: 'expense',
      amount: 1500,
      categoryId: 'category-expense-food',
      accountId: checking.id,
      fromAccountId: null,
      toAccountId: null,
      note: 'Previous groceries',
      transactionDate: '2026-03-16T00:00:00.000Z',
      recurringRuleId: null,
    })
    await transactionRepository.create({
      type: 'transfer',
      amount: 2000,
      categoryId: DEFAULT_TRANSFER_CATEGORIES[0].id,
      accountId: null,
      fromAccountId: checking.id,
      toAccountId: savings.id,
      note: 'Move to savings',
      transactionDate: '2026-04-17T00:00:00.000Z',
      recurringRuleId: null,
    })
    await transactionRepository.create({
      type: 'income',
      amount: 5000,
      categoryId: 'category-income-other-income',
      accountId: checking.id,
      fromAccountId: null,
      toAccountId: null,
      note: 'Balance top-up',
      transactionDate: '2026-04-17T01:00:00.000Z',
      recurringRuleId: null,
    })
    await transactionRepository.create({
      type: 'income',
      amount: 2500,
      categoryId: 'category-income-other-income',
      accountId: checking.id,
      fromAccountId: null,
      toAccountId: null,
      note: 'Balance adjustment',
      transactionDate: '2026-04-17T02:00:00.000Z',
      recurringRuleId: null,
    })
    await transactionRepository.create({
      type: 'expense',
      amount: 1200,
      categoryId: 'category-expense-miscellaneous',
      accountId: checking.id,
      fromAccountId: null,
      toAccountId: null,
      note: 'Balance adjustment',
      transactionDate: '2026-04-17T03:00:00.000Z',
      recurringRuleId: null,
    })

    const dashboardData = await dashboardQueryService.getDashboardData({
      now: '2026-04-18T00:00:00.000Z',
    })

    expect(dashboardData.monthlyInflow).toBe(12000)
    expect(dashboardData.monthlyOutflow).toBe(3500)
  })
})

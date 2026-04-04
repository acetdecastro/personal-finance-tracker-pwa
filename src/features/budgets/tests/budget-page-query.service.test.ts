import { afterEach, describe, expect, it } from 'vitest'
import { createBudgetRepository } from '#/features/budgets/services/budget.repository'
import { createGoalRepository } from '#/features/goals/services/goal.repository'
import { createTransactionRepository } from '#/features/transactions/services/transaction.repository'
import { seedCoreData } from '#/services/seed/seed.service'
import { createBudgetPageQueryService } from '../services/budget-page-query.service'
import { createTestDatabase, destroyTestDatabase } from '#/test/test-db'

const databases: ReturnType<typeof createTestDatabase>[] = []

afterEach(async () => {
  await Promise.all(
    databases.splice(0).map((database) => destroyTestDatabase(database)),
  )
})

describe('budgetPageQueryService', () => {
  it('returns budget snapshots, expense category options, and primary goal snapshot for the budget page', async () => {
    const database = createTestDatabase()
    databases.push(database)

    const budgetRepository = createBudgetRepository(database)
    const goalRepository = createGoalRepository(database)
    const transactionRepository = createTransactionRepository(database)
    const budgetPageQueryService = createBudgetPageQueryService(database)

    await seedCoreData(database)

    await budgetRepository.create({
      categoryId: 'category-expense-food',
      amount: 1000,
      periodType: 'monthly',
    })

    await transactionRepository.create({
      type: 'expense',
      amount: 350,
      categoryId: 'category-expense-food',
      accountId: 'account-1',
      fromAccountId: null,
      toAccountId: null,
      note: 'Groceries',
      transactionDate: '2026-04-08T00:00:00.000Z',
      recurringRuleId: null,
    })

    await goalRepository.create({
      name: 'Emergency Fund',
      targetAmount: 10000,
      currentAmount: 3000,
      targetDate: null,
    })

    const result = await budgetPageQueryService.getBudgetPageData({
      now: '2026-04-20T00:00:00.000Z',
    })

    expect(result.budgetSnapshots[0]?.spentAmount).toBe(350)
    expect(result.budgetSnapshots[0]?.categoryName).toBe('Food')
    expect(result.primaryGoal?.percentComplete).toBe(30)
    expect(
      result.expenseCategoryOptions.some((option) => option.label === 'Food'),
    ).toBe(true)
  })
})

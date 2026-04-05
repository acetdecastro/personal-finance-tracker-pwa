import { afterEach, describe, expect, it } from 'vitest'
import { createAccountRepository } from '#/features/accounts/services/account.repository'
import { createBudgetRepository } from '#/features/budgets/services/budget.repository'
import { createGoalRepository } from '#/features/goals/services/goal.repository'
import { createRecurringRuleRepository } from '#/features/recurring/services/recurring-rule.repository'
import { createTransactionRepository } from '#/features/transactions/services/transaction.repository'
import { createUserSettingsRepository } from '#/features/settings/services/user-settings.repository'
import { seedCoreData } from '#/services/seed/seed.service'
import { DEFAULT_TRANSFER_CATEGORIES } from '#/services/seed/seed-data'
import { createTestDatabase, destroyTestDatabase } from '#/test/test-db'
import { resetAllAppData } from './data-reset.service'

const databases: ReturnType<typeof createTestDatabase>[] = []

afterEach(async () => {
  await Promise.all(
    databases.splice(0).map((database) => destroyTestDatabase(database)),
  )
})

describe('resetAllAppData', () => {
  it('clears user data and reseeds required defaults', async () => {
    const database = createTestDatabase()
    databases.push(database)

    const accountRepository = createAccountRepository(database)
    const budgetRepository = createBudgetRepository(database)
    const goalRepository = createGoalRepository(database)
    const recurringRuleRepository = createRecurringRuleRepository(database)
    const transactionRepository = createTransactionRepository(database)
    const userSettingsRepository = createUserSettingsRepository(database)

    await seedCoreData(database)

    const account = await accountRepository.create({
      name: 'Cash',
      type: 'cash',
      initialBalance: 1000,
      safetyBuffer: 100,
      isArchived: false,
    })
    const destinationAccount = await accountRepository.create({
      name: 'Savings',
      type: 'bank',
      initialBalance: 0,
      safetyBuffer: 0,
      isArchived: false,
    })

    await transactionRepository.create({
      type: 'transfer',
      amount: 100,
      categoryId: DEFAULT_TRANSFER_CATEGORIES[0].id,
      accountId: null,
      fromAccountId: account.id,
      toAccountId: destinationAccount.id,
      goalId: null,
      goalTransferDirection: null,
      note: 'Move money',
      transactionDate: '2026-04-05T00:00:00.000Z',
      recurringRuleId: null,
    })

    await budgetRepository.create({
      categoryId: 'category-expense-food',
      amount: 1000,
      periodType: 'monthly',
    })

    await goalRepository.create({
      name: 'Emergency Fund',
      targetAmount: 10000,
      currentAmount: 0,
      targetDate: null,
    })

    await recurringRuleRepository.create({
      name: 'Salary',
      type: 'income',
      amount: 10000,
      categoryId: 'category-income-salary',
      accountId: account.id,
      cadence: 'monthly',
      semiMonthlyDays: null,
      monthlyDay: 15,
      weeklyInterval: null,
      nextOccurrenceDate: '2026-04-15T00:00:00.000Z',
      isActive: true,
    })

    await userSettingsRepository.update({
      hasCompletedOnboarding: true,
      theme: 'dark',
    })

    await resetAllAppData(database)

    expect(await database.accounts.count()).toBe(0)
    expect(await database.transactions.count()).toBe(0)
    expect(await database.budgets.count()).toBe(0)
    expect(await database.goals.count()).toBe(0)
    expect(await database.recurringRules.count()).toBe(0)
    expect(await database.categories.count()).toBe(12)

    const settings = await database.userSettings.get('primary')
    expect(settings).toMatchObject({
      id: 'primary',
      hasCompletedOnboarding: false,
      currency: 'PHP',
      theme: 'system',
    })
  })
})

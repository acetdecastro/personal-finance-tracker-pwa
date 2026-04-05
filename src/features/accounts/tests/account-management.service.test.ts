import { afterEach, describe, expect, it } from 'vitest'
import { createRecurringRuleRepository } from '#/features/recurring/services/recurring-rule.repository'
import { createTransactionRepository } from '#/features/transactions/services/transaction.repository'
import { seedCoreData } from '#/services/seed/seed.service'
import { DEFAULT_TRANSFER_CATEGORIES } from '#/services/seed/seed-data'
import { createTestDatabase, destroyTestDatabase } from '#/test/test-db'
import { createAccountRepository } from '../services/account.repository'
import { createAccountManagementService } from '../services/account-management.service'

const databases: ReturnType<typeof createTestDatabase>[] = []

afterEach(async () => {
  await Promise.all(
    databases.splice(0).map((database) => destroyTestDatabase(database)),
  )
})

describe('accountManagementService', () => {
  it('allows deleting an unreferenced account', async () => {
    const database = createTestDatabase()
    databases.push(database)

    const accountRepository = createAccountRepository(database)
    const accountManagementService = createAccountManagementService(database)

    const account = await accountRepository.create({
      name: 'Pocket Cash',
      type: 'cash',
      initialBalance: 500,
      safetyBuffer: 0,
      isArchived: false,
    })

    const usage = await accountManagementService.getUsage(account.id)
    expect(usage?.canDelete).toBe(true)

    await accountManagementService.remove(account.id)

    await expect(accountRepository.getById(account.id)).resolves.toBeUndefined()
  })

  it('prevents deleting a referenced account and reports usage counts', async () => {
    const database = createTestDatabase()
    databases.push(database)

    const accountRepository = createAccountRepository(database)
    const transactionRepository = createTransactionRepository(database)
    const recurringRuleRepository = createRecurringRuleRepository(database)
    const accountManagementService = createAccountManagementService(database)

    await seedCoreData(database)

    const account = await accountRepository.create({
      name: 'Main Bank',
      type: 'bank',
      initialBalance: 1000,
      safetyBuffer: 100,
      isArchived: false,
    })

    await transactionRepository.create({
      type: 'expense',
      amount: 250,
      categoryId: 'category-expense-food',
      accountId: account.id,
      fromAccountId: null,
      toAccountId: null,
      note: 'Groceries',
      transactionDate: '2026-04-05T00:00:00.000Z',
      recurringRuleId: null,
    })

    await recurringRuleRepository.create({
      name: 'Rent',
      type: 'expense',
      amount: 800,
      categoryId: 'category-expense-rent',
      accountId: account.id,
      cadence: 'monthly',
      semiMonthlyDays: null,
      monthlyDay: 5,
      weeklyInterval: null,
      nextOccurrenceDate: '2026-05-05T00:00:00.000Z',
      isActive: true,
    })

    const usage = await accountManagementService.getUsage(account.id)

    expect(usage).toEqual({
      accountId: account.id,
      transactionCount: 1,
      recurringRuleCount: 1,
      totalReferences: 2,
      canDelete: false,
    })

    await expect(accountManagementService.remove(account.id)).rejects.toThrow(
      'can only be archived',
    )
  })

  it('counts transfer source and destination accounts as referenced', async () => {
    const database = createTestDatabase()
    databases.push(database)

    const accountRepository = createAccountRepository(database)
    const transactionRepository = createTransactionRepository(database)
    const accountManagementService = createAccountManagementService(database)

    await seedCoreData(database)

    const sourceAccount = await accountRepository.create({
      name: 'Source Bank',
      type: 'bank',
      initialBalance: 1000,
      safetyBuffer: 0,
      isArchived: false,
    })

    const destinationAccount = await accountRepository.create({
      name: 'Destination Wallet',
      type: 'ewallet',
      initialBalance: 300,
      safetyBuffer: 0,
      isArchived: false,
    })

    await transactionRepository.create({
      type: 'transfer',
      amount: 200,
      categoryId: DEFAULT_TRANSFER_CATEGORIES[0].id,
      accountId: null,
      fromAccountId: sourceAccount.id,
      toAccountId: destinationAccount.id,
      goalId: null,
      note: 'Move funds',
      transactionDate: '2026-04-05T00:00:00.000Z',
      recurringRuleId: null,
    })

    const sourceUsage = await accountManagementService.getUsage(
      sourceAccount.id,
    )
    const destinationUsage = await accountManagementService.getUsage(
      destinationAccount.id,
    )

    expect(sourceUsage).toMatchObject({
      accountId: sourceAccount.id,
      transactionCount: 1,
      canDelete: false,
    })
    expect(destinationUsage).toMatchObject({
      accountId: destinationAccount.id,
      transactionCount: 1,
      canDelete: false,
    })
  })

  it('counts goal-savings transfer source accounts as referenced', async () => {
    const database = createTestDatabase()
    databases.push(database)

    const accountRepository = createAccountRepository(database)
    const transactionRepository = createTransactionRepository(database)
    const accountManagementService = createAccountManagementService(database)

    await seedCoreData(database)

    const account = await accountRepository.create({
      name: 'Savings Source',
      type: 'bank',
      initialBalance: 5000,
      safetyBuffer: 0,
      isArchived: false,
    })

    await transactionRepository.create({
      type: 'transfer',
      amount: 1000,
      categoryId: DEFAULT_TRANSFER_CATEGORIES[0].id,
      accountId: null,
      fromAccountId: account.id,
      toAccountId: null,
      goalId: 'goal-1',
      note: 'Goal Savings · Emergency Fund',
      transactionDate: '2026-04-05T00:00:00.000Z',
      recurringRuleId: null,
    })

    const usage = await accountManagementService.getUsage(account.id)

    expect(usage).toMatchObject({
      accountId: account.id,
      transactionCount: 1,
      canDelete: false,
    })
  })
})

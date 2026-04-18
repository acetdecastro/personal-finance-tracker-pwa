import { afterEach, describe, expect, it } from 'vitest'
import { createAccountRepository } from '#/features/accounts/services/account.repository'
import { createRecurringRuleRepository } from '#/features/recurring/services/recurring-rule.repository'
import { createTransactionService } from '../services/transaction.service'
import { createTestDatabase, destroyTestDatabase } from '#/test/test-db'

const databases: ReturnType<typeof createTestDatabase>[] = []

afterEach(async () => {
  await Promise.all(
    databases.splice(0).map((database) => destroyTestDatabase(database)),
  )
})

describe('transactionService', () => {
  it('returns active account and category options for transaction forms', async () => {
    const database = createTestDatabase()
    databases.push(database)
    const accountRepository = createAccountRepository(database)
    const recurringRuleRepository = createRecurringRuleRepository(database)
    const transactionService = createTransactionService(database)

    const account = await accountRepository.create({
      name: 'Cash Wallet',
      type: 'cash',
      initialBalance: 500,
      safetyBuffer: 0,
      isArchived: false,
    })

    await accountRepository.create({
      name: 'Old Account',
      type: 'bank',
      initialBalance: 0,
      safetyBuffer: 0,
      isArchived: true,
    })

    await recurringRuleRepository.create({
      name: 'Salary',
      type: 'income',
      amount: 12500,
      secondAmount: null,
      categoryId: 'category-income-salary',
      accountId: account.id,
      cadence: 'semi-monthly',
      semiMonthlyDays: [15, 30],
      monthlyDay: null,
      weeklyInterval: null,
      nextOccurrenceDate: '2026-04-15T00:00:00.000Z',
      isActive: true,
    })

    const options = await transactionService.getFormOptions()

    expect(options.accountOptions).toHaveLength(1)
    expect(
      options.expenseCategoryOptions.some((option) => option.label === 'Food'),
    ).toBe(true)
    expect(
      options.incomeCategoryOptions.some((option) => option.label === 'Salary'),
    ).toBe(true)
    expect(options.incomeRecurringTransactionOptions[0]?.label).toBe('Salary')
  })

  it('creates, updates, lists, and deletes transactions through the service layer', async () => {
    const database = createTestDatabase()
    databases.push(database)
    const accountRepository = createAccountRepository(database)
    const transactionService = createTransactionService(database)

    const account = await accountRepository.create({
      name: 'Bank',
      type: 'bank',
      initialBalance: 5000,
      safetyBuffer: 0,
      isArchived: false,
    })

    const created = await transactionService.create({
      type: 'expense',
      amount: 200,
      categoryId: 'category-expense-food',
      accountId: account.id,
      fromAccountId: null,
      toAccountId: null,
      goalId: null,
      goalTransferDirection: null,
      note: 'Dinner',
      transactionDate: '2026-04-04T12:00:00.000Z',
      recurringRuleId: null,
      coveredRecurringOccurrenceDate: null,
    })

    const updated = await transactionService.update(created.id, {
      note: 'Dinner with friends',
      amount: 250,
    })

    const listed = await transactionService.list({
      type: 'expense',
      accountId: account.id,
    })

    expect(updated.note).toBe('Dinner with friends')
    expect(listed).toHaveLength(1)

    await transactionService.remove(created.id)

    expect(await transactionService.list()).toHaveLength(0)
  })

  it('returns posted transactions in cursor-paginated pages', async () => {
    const database = createTestDatabase()
    databases.push(database)
    const accountRepository = createAccountRepository(database)
    const transactionService = createTransactionService(database)

    const account = await accountRepository.create({
      name: 'Bank',
      type: 'bank',
      initialBalance: 5000,
      safetyBuffer: 0,
      isArchived: false,
    })

    for (let index = 0; index < 25; index += 1) {
      await transactionService.create({
        type: index % 2 === 0 ? 'expense' : 'income',
        amount: 100 + index,
        categoryId:
          index % 2 === 0
            ? 'category-expense-food'
            : 'category-income-other-income',
        accountId: account.id,
        fromAccountId: null,
        toAccountId: null,
        goalId: null,
        goalTransferDirection: null,
        note: `Transaction ${index}`,
        transactionDate: `2026-04-${String(index + 1).padStart(2, '0')}T00:00:00.000Z`,
        recurringRuleId: null,
        coveredRecurringOccurrenceDate: null,
      })
    }

    const firstPage = await transactionService.listPage({
      limit: 10,
    })
    const secondPage = await transactionService.listPage({
      limit: 10,
      cursor: firstPage.nextCursor,
    })

    expect(firstPage.items).toHaveLength(10)
    expect(firstPage.nextCursor).not.toBeNull()
    expect(secondPage.items).toHaveLength(5)
    expect(secondPage.nextCursor).toBeNull()
    expect(
      new Set([...firstPage.items, ...secondPage.items].map((tx) => tx.id))
        .size,
    ).toBe(25)
  })

  it('uses transaction id as a cursor tie-breaker for same-day transactions', async () => {
    const database = createTestDatabase()
    databases.push(database)
    const accountRepository = createAccountRepository(database)
    const transactionService = createTransactionService(database)

    const account = await accountRepository.create({
      name: 'Bank',
      type: 'bank',
      initialBalance: 5000,
      safetyBuffer: 0,
      isArchived: false,
    })

    for (let index = 0; index < 3; index += 1) {
      await transactionService.create({
        type: 'expense',
        amount: 100 + index,
        categoryId: 'category-expense-food',
        accountId: account.id,
        fromAccountId: null,
        toAccountId: null,
        goalId: null,
        goalTransferDirection: null,
        note: `Same-day transaction ${index}`,
        transactionDate: '2026-04-18T00:00:00.000Z',
        recurringRuleId: null,
        coveredRecurringOccurrenceDate: null,
      })
    }

    const firstPage = await transactionService.listPage({
      limit: 2,
      filters: { type: 'expense' },
    })
    const secondPage = await transactionService.listPage({
      limit: 2,
      filters: { type: 'expense' },
      cursor: firstPage.nextCursor,
    })

    expect(firstPage.items).toHaveLength(2)
    expect(secondPage.items).toHaveLength(1)
    expect(
      new Set([...firstPage.items, ...secondPage.items].map((tx) => tx.id))
        .size,
    ).toBe(3)
  })
})

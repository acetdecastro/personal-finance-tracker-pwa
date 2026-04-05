import { afterEach, describe, expect, it } from 'vitest'
import { DEFAULT_TRANSFER_CATEGORIES } from '#/services/seed/seed-data'
import { createTestDatabase, destroyTestDatabase } from '#/test/test-db'
import { createTransactionRepository } from '#/features/transactions/services/transaction.repository'
import { createGoalRepository } from '../services/goal.repository'
import { createGoalManagementService } from '../services/goal-management.service'

const databases: ReturnType<typeof createTestDatabase>[] = []

afterEach(async () => {
  await Promise.all(
    databases.splice(0).map((database) => destroyTestDatabase(database)),
  )
})

describe('goalManagementService', () => {
  it('blocks deleting a goal with remaining funds', async () => {
    const database = createTestDatabase()
    databases.push(database)

    const goalRepository = createGoalRepository(database)
    const goalManagementService = createGoalManagementService(database)

    const goal = await goalRepository.create({
      name: 'Emergency Fund',
      targetAmount: 10000,
      currentAmount: 500,
      targetDate: null,
    })

    const usage = await goalManagementService.getUsage(goal.id)

    expect(usage).toMatchObject({
      goalId: goal.id,
      currentAmount: 500,
      canDelete: false,
    })
    await expect(goalManagementService.remove(goal.id)).rejects.toThrow(
      'A goal can only be deleted when its saved amount is 0.',
    )
  })

  it('allows deleting a zero-fund goal with no linked transfers', async () => {
    const database = createTestDatabase()
    databases.push(database)

    const goalRepository = createGoalRepository(database)
    const goalManagementService = createGoalManagementService(database)

    const goal = await goalRepository.create({
      name: 'Travel Fund',
      targetAmount: 5000,
      currentAmount: 0,
      targetDate: null,
    })

    const usage = await goalManagementService.getUsage(goal.id)

    expect(usage).toMatchObject({
      goalId: goal.id,
      linkedTransferCount: 0,
      currentAmount: 0,
      canDelete: true,
      deleteNotice: null,
    })

    await expect(goalManagementService.remove(goal.id)).resolves.toBeUndefined()
    await expect(goalRepository.getById(goal.id)).resolves.toBeUndefined()
  })

  it('allows deleting a zero-fund goal with linked transfer history and shows the retention notice', async () => {
    const database = createTestDatabase()
    databases.push(database)

    const goalRepository = createGoalRepository(database)
    const transactionRepository = createTransactionRepository(database)
    const goalManagementService = createGoalManagementService(database)

    const goal = await goalRepository.create({
      name: 'Travel Fund',
      targetAmount: 5000,
      currentAmount: 0,
      targetDate: null,
    })

    await transactionRepository.create({
      type: 'transfer',
      amount: 750,
      categoryId: DEFAULT_TRANSFER_CATEGORIES[0].id,
      accountId: null,
      fromAccountId: 'account-1',
      toAccountId: null,
      goalId: goal.id,
      goalTransferDirection: 'in',
      note: 'Goal Savings · Travel Fund',
      transactionDate: '2026-04-05T00:00:00.000Z',
      recurringRuleId: null,
    })

    await transactionRepository.create({
      type: 'transfer',
      amount: 750,
      categoryId: DEFAULT_TRANSFER_CATEGORIES[0].id,
      accountId: null,
      fromAccountId: null,
      toAccountId: 'account-1',
      goalId: goal.id,
      goalTransferDirection: 'out',
      note: 'Goal Transfer Out · Travel Fund',
      transactionDate: '2026-04-06T00:00:00.000Z',
      recurringRuleId: null,
    })

    const usage = await goalManagementService.getUsage(goal.id)

    expect(usage).toMatchObject({
      goalId: goal.id,
      linkedTransferCount: 2,
      currentAmount: 0,
      canDelete: true,
      deleteNotice:
        'Linked transfer history will remain and be labeled as Deleted Goal.',
    })
  })
})

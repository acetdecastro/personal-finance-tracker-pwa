import { describe, expect, it } from 'vitest'
import { DEFAULT_TRANSFER_CATEGORIES } from '#/services/seed/seed-data'
import {
  createTransactionInputSchema,
  transactionSchema,
} from '../schemas/transaction.schemas'

describe('transaction schemas', () => {
  it('accepts a standard expense transaction', () => {
    const parsed = createTransactionInputSchema.parse({
      type: 'expense',
      amount: 350,
      categoryId: crypto.randomUUID(),
      accountId: crypto.randomUUID(),
      fromAccountId: null,
      toAccountId: null,
      goalTransferDirection: null,
      note: 'Lunch',
      transactionDate: '2026-04-04T00:00:00.000Z',
      recurringRuleId: null,
    })

    expect(parsed.type).toBe('expense')
  })

  it('rejects covered recurring occurrence dates without a linked recurring rule', () => {
    expect(() =>
      createTransactionInputSchema.parse({
        type: 'expense',
        amount: 350,
        categoryId: crypto.randomUUID(),
        accountId: crypto.randomUUID(),
        fromAccountId: null,
        toAccountId: null,
        goalTransferDirection: null,
        note: 'Lunch',
        transactionDate: '2026-04-04T00:00:00.000Z',
        recurringRuleId: null,
        coveredRecurringOccurrenceDate: '2026-04-17T00:00:00.000Z',
      }),
    ).toThrow()
  })

  it('rejects transfer records that still carry category or accountId', () => {
    expect(() =>
      createTransactionInputSchema.parse({
        type: 'transfer',
        amount: 100,
        categoryId: DEFAULT_TRANSFER_CATEGORIES[0].id,
        accountId: crypto.randomUUID(),
        fromAccountId: crypto.randomUUID(),
        toAccountId: crypto.randomUUID(),
        goalTransferDirection: null,
        note: null,
        transactionDate: '2026-04-04T00:00:00.000Z',
        recurringRuleId: null,
      }),
    ).toThrow()
  })

  it('accepts a persisted transfer shape', () => {
    const id = crypto.randomUUID()

    expect(
      transactionSchema.parse({
        id,
        type: 'transfer',
        amount: 100,
        categoryId: DEFAULT_TRANSFER_CATEGORIES[0].id,
        accountId: null,
        fromAccountId: crypto.randomUUID(),
        toAccountId: crypto.randomUUID(),
        goalTransferDirection: null,
        note: null,
        transactionDate: '2026-04-04T00:00:00.000Z',
        recurringRuleId: null,
        createdAt: '2026-04-04T00:00:00.000Z',
        updatedAt: '2026-04-04T00:00:00.000Z',
      }).id,
    ).toBe(id)
  })

  it('accepts goal-linked transfer in and out shapes', () => {
    const transferIn = createTransactionInputSchema.parse({
      type: 'transfer',
      amount: 100,
      categoryId: DEFAULT_TRANSFER_CATEGORIES[0].id,
      accountId: null,
      fromAccountId: crypto.randomUUID(),
      toAccountId: null,
      goalId: crypto.randomUUID(),
      goalTransferDirection: 'in',
      note: 'Goal Savings · Emergency Fund',
      transactionDate: '2026-04-04T00:00:00.000Z',
      recurringRuleId: null,
    })

    const transferOut = createTransactionInputSchema.parse({
      type: 'transfer',
      amount: 100,
      categoryId: DEFAULT_TRANSFER_CATEGORIES[0].id,
      accountId: null,
      fromAccountId: null,
      toAccountId: crypto.randomUUID(),
      goalId: crypto.randomUUID(),
      goalTransferDirection: 'out',
      note: 'Goal Transfer Out · Emergency Fund',
      transactionDate: '2026-04-04T00:00:00.000Z',
      recurringRuleId: null,
    })

    expect(transferIn.goalTransferDirection).toBe('in')
    expect(transferOut.goalTransferDirection).toBe('out')
  })
})

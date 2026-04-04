import { describe, expect, it } from 'vitest'
import { expandRecurringOccurrences } from './recurring-expansion.service'
import type { RecurringRule, Transaction } from '#/types/domain'

function createRule(
  overrides: Partial<RecurringRule> = {},
): RecurringRule {
  return {
    id: 'rule-1',
    name: 'Salary',
    type: 'income',
    amount: 1000,
    categoryId: 'category-income-salary',
    accountId: 'account-1',
    cadence: 'semi-monthly',
    semiMonthlyDays: [15, 30],
    monthlyDay: null,
    weeklyInterval: null,
    nextOccurrenceDate: '2026-04-15T00:00:00.000Z',
    isActive: true,
    createdAt: '2026-04-01T00:00:00.000Z',
    updatedAt: '2026-04-01T00:00:00.000Z',
    ...overrides,
  }
}

describe('expandRecurringOccurrences', () => {
  it('expands semi-monthly occurrences inside the forecast window', () => {
    const occurrences = expandRecurringOccurrences({
      rules: [createRule()],
      fromDate: '2026-04-10T00:00:00.000Z',
      endDate: '2026-05-20T00:00:00.000Z',
    })

    expect(occurrences.map((occurrence) => occurrence.date)).toEqual([
      '2026-04-15T00:00:00.000Z',
      '2026-04-30T00:00:00.000Z',
      '2026-05-15T00:00:00.000Z',
    ])
  })

  it('skips occurrences already represented by posted recurring transactions', () => {
    const postedTransactions: Transaction[] = [
      {
        id: 'tx-1',
        type: 'income',
        amount: 1000,
        categoryId: 'category-income-salary',
        accountId: 'account-1',
        fromAccountId: null,
        toAccountId: null,
        note: null,
        transactionDate: '2026-04-15T12:00:00.000Z',
        recurringRuleId: 'rule-1',
        createdAt: '2026-04-15T12:00:00.000Z',
        updatedAt: '2026-04-15T12:00:00.000Z',
      },
    ]

    const occurrences = expandRecurringOccurrences({
      rules: [createRule()],
      transactions: postedTransactions,
      fromDate: '2026-04-10T00:00:00.000Z',
      endDate: '2026-04-30T00:00:00.000Z',
    })

    expect(occurrences.map((occurrence) => occurrence.date)).toEqual([
      '2026-04-30T00:00:00.000Z',
    ])
  })
})

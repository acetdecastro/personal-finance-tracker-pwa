import { describe, expect, it } from 'vitest'
import {
  expandRecurringOccurrences,
  getNextUpcomingOccurrenceDate,
} from './recurring-expansion.service'
import type { RecurringRule, Transaction } from '#/types/domain'

function createRule(overrides: Partial<RecurringRule> = {}): RecurringRule {
  return {
    id: 'rule-1',
    name: 'Salary',
    type: 'income',
    amount: 1000,
    secondAmount: null,
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

  it('skips an occurrence when a linked transaction covers it early', () => {
    const postedTransactions: Transaction[] = [
      {
        id: 'tx-early',
        type: 'expense',
        amount: 1000,
        categoryId: 'category-expense-rent',
        accountId: 'account-1',
        fromAccountId: null,
        toAccountId: null,
        note: 'Internet bill paid early',
        transactionDate: '2026-04-04T12:00:00.000Z',
        recurringRuleId: 'rule-1',
        coveredRecurringOccurrenceDate: '2026-04-15T00:00:00.000Z',
        createdAt: '2026-04-04T12:00:00.000Z',
        updatedAt: '2026-04-04T12:00:00.000Z',
      },
    ]

    const occurrences = expandRecurringOccurrences({
      rules: [
        createRule({
          type: 'expense',
          categoryId: 'category-expense-rent',
        }),
      ],
      transactions: postedTransactions,
      fromDate: '2026-04-10T00:00:00.000Z',
      endDate: '2026-04-30T00:00:00.000Z',
    })

    expect(occurrences.map((occurrence) => occurrence.date)).toEqual([
      '2026-04-30T00:00:00.000Z',
    ])
  })

  it('uses the first and second salary amounts for semi-monthly salary rules', () => {
    const occurrences = expandRecurringOccurrences({
      rules: [
        createRule({
          amount: 25000,
          secondAmount: 27500,
        }),
      ],
      fromDate: '2026-04-10T00:00:00.000Z',
      endDate: '2026-05-20T00:00:00.000Z',
    })

    expect(
      occurrences.map((occurrence) => ({
        date: occurrence.date,
        amount: occurrence.amount,
      })),
    ).toEqual([
      { date: '2026-04-15T00:00:00.000Z', amount: 25000 },
      { date: '2026-04-30T00:00:00.000Z', amount: 27500 },
      { date: '2026-05-15T00:00:00.000Z', amount: 25000 },
    ])
  })

  it('computes the next monthly occurrence after the stored date has passed', () => {
    const nextDate = getNextUpcomingOccurrenceDate(
      createRule({
        cadence: 'monthly',
        monthlyDay: 17,
        semiMonthlyDays: null,
        nextOccurrenceDate: '2026-04-17T00:00:00.000Z',
      }),
      '2026-04-18T00:00:00.000Z',
    )

    expect(nextDate).toBe('2026-05-17T00:00:00.000Z')
  })

  it('keeps the stored occurrence when it is still upcoming', () => {
    const nextDate = getNextUpcomingOccurrenceDate(
      createRule({
        cadence: 'monthly',
        monthlyDay: 17,
        semiMonthlyDays: null,
        nextOccurrenceDate: '2026-04-17T00:00:00.000Z',
      }),
      '2026-04-10T00:00:00.000Z',
    )

    expect(nextDate).toBe('2026-04-17T00:00:00.000Z')
  })
})

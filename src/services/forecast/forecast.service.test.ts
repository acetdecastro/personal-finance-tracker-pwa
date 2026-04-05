import { describe, expect, it } from 'vitest'
import {
  calculateCurrentBalance,
  calculateForecastSummary,
} from './forecast.service'
import type { Account, RecurringRule, Transaction } from '#/types/domain'

const account: Account = {
  id: 'account-1',
  name: 'Main Wallet',
  type: 'ewallet',
  initialBalance: 1000,
  safetyBuffer: 100,
  isArchived: false,
  createdAt: '2026-04-01T00:00:00.000Z',
  updatedAt: '2026-04-01T00:00:00.000Z',
}

const transactions: Transaction[] = [
  {
    id: 'tx-income',
    type: 'income',
    amount: 500,
    categoryId: 'category-income-salary',
    accountId: 'account-1',
    fromAccountId: null,
    toAccountId: null,
    goalTransferDirection: null,
    note: null,
    transactionDate: '2026-04-01T00:00:00.000Z',
    recurringRuleId: null,
    createdAt: '2026-04-01T00:00:00.000Z',
    updatedAt: '2026-04-01T00:00:00.000Z',
  },
  {
    id: 'tx-expense',
    type: 'expense',
    amount: 200,
    categoryId: 'category-expense-food',
    accountId: 'account-1',
    fromAccountId: null,
    toAccountId: null,
    goalTransferDirection: null,
    note: null,
    transactionDate: '2026-04-02T00:00:00.000Z',
    recurringRuleId: null,
    createdAt: '2026-04-02T00:00:00.000Z',
    updatedAt: '2026-04-02T00:00:00.000Z',
  },
]

const recurringRules: RecurringRule[] = [
  {
    id: 'salary-rule',
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
  },
  {
    id: 'bill-rule',
    name: 'Rent',
    type: 'expense',
    amount: 300,
    categoryId: 'category-expense-rent',
    accountId: 'account-1',
    cadence: 'monthly',
    semiMonthlyDays: null,
    monthlyDay: 10,
    weeklyInterval: null,
    nextOccurrenceDate: '2026-04-10T00:00:00.000Z',
    isActive: true,
    createdAt: '2026-04-01T00:00:00.000Z',
    updatedAt: '2026-04-01T00:00:00.000Z',
  },
]

describe('forecast.service', () => {
  it('calculates current balance from accounts and posted transactions', () => {
    expect(calculateCurrentBalance([account], transactions)).toBe(1300)
  })

  it('calculates forecast totals and safe-to-spend values', () => {
    const summary = calculateForecastSummary({
      accounts: [account],
      transactions,
      recurringRules,
      now: '2026-04-05T00:00:00.000Z',
    })

    expect(summary.currentBalance).toBe(1300)
    expect(summary.nextSalaryDate).toBe('2026-04-15T00:00:00.000Z')
    expect(summary.totalUpcomingFixedExpensesBeforeNextSalary).toBe(300)
    expect(summary.safeToSpend).toBe(900)
    expect(summary.projectedBalance7d).toBe(1000)
    expect(summary.projectedBalance14d).toBe(2000)
    expect(summary.projectedBalance30d).toBe(3000)
    expect(summary.lowestProjectedBalance30d).toBe(1000)
  })

  it('subtracts goal savings in and adds goal transfers out', () => {
    const goalTransactions: Transaction[] = [
      {
        id: 'tx-goal-in',
        type: 'transfer',
        amount: 300,
        categoryId: 'category-transfer-transfer',
        accountId: null,
        fromAccountId: 'account-1',
        toAccountId: null,
        goalId: 'goal-1',
        goalTransferDirection: 'in',
        note: 'Goal Savings · Emergency Fund',
        transactionDate: '2026-04-03T00:00:00.000Z',
        recurringRuleId: null,
        createdAt: '2026-04-03T00:00:00.000Z',
        updatedAt: '2026-04-03T00:00:00.000Z',
      },
      {
        id: 'tx-goal-out',
        type: 'transfer',
        amount: 100,
        categoryId: 'category-transfer-transfer',
        accountId: null,
        fromAccountId: null,
        toAccountId: 'account-1',
        goalId: 'goal-1',
        goalTransferDirection: 'out',
        note: 'Goal Transfer Out · Emergency Fund',
        transactionDate: '2026-04-04T00:00:00.000Z',
        recurringRuleId: null,
        createdAt: '2026-04-04T00:00:00.000Z',
        updatedAt: '2026-04-04T00:00:00.000Z',
      },
    ]

    expect(calculateCurrentBalance([account], goalTransactions)).toBe(800)
  })
})

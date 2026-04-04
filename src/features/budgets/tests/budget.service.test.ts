import { describe, expect, it } from 'vitest'
import { calculateBudgetSnapshots } from '../services/budget.service'
import type { Budget, Category, Transaction } from '#/types/domain'

describe('budget.service', () => {
  it('calculates monthly budget snapshots from expense transactions only', () => {
    const budgets: Budget[] = [
      {
        id: 'budget-1',
        categoryId: 'category-expense-food',
        amount: 1000,
        periodType: 'monthly',
        createdAt: '2026-04-01T00:00:00.000Z',
        updatedAt: '2026-04-01T00:00:00.000Z',
      },
    ]

    const categories: Category[] = [
      {
        id: 'category-expense-food',
        name: 'Food',
        type: 'expense',
        isSystem: true,
        createdAt: '2026-04-01T00:00:00.000Z',
        updatedAt: '2026-04-01T00:00:00.000Z',
      },
    ]

    const transactions: Transaction[] = [
      {
        id: 'expense-1',
        type: 'expense',
        amount: 250,
        categoryId: 'category-expense-food',
        accountId: 'account-1',
        fromAccountId: null,
        toAccountId: null,
        note: null,
        transactionDate: '2026-04-03T00:00:00.000Z',
        recurringRuleId: null,
        createdAt: '2026-04-03T00:00:00.000Z',
        updatedAt: '2026-04-03T00:00:00.000Z',
      },
      {
        id: 'income-1',
        type: 'income',
        amount: 500,
        categoryId: 'category-income-salary',
        accountId: 'account-1',
        fromAccountId: null,
        toAccountId: null,
        note: null,
        transactionDate: '2026-04-03T00:00:00.000Z',
        recurringRuleId: null,
        createdAt: '2026-04-03T00:00:00.000Z',
        updatedAt: '2026-04-03T00:00:00.000Z',
      },
    ]

    const snapshots = calculateBudgetSnapshots({
      budgets,
      categories,
      transactions,
      referenceDate: '2026-04-20T00:00:00.000Z',
    })

    expect(snapshots).toEqual([
      {
        budgetId: 'budget-1',
        categoryId: 'category-expense-food',
        categoryName: 'Food',
        budgetAmount: 1000,
        spentAmount: 250,
        remainingAmount: 750,
        percentUsed: 25,
        isOverBudget: false,
      },
    ])
  })
})

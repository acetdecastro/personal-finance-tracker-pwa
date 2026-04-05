import { describe, expect, it } from 'vitest'
import {
  calculateGoalSnapshot,
  calculateGoalSnapshots,
} from '../services/goal.service'
import type { Goal, Transaction } from '#/types/domain'

describe('goal.service', () => {
  it('calculates a goal snapshot from the stored goal record', () => {
    const goal: Goal = {
      id: 'goal-1',
      name: 'Emergency Fund',
      targetAmount: 10000,
      currentAmount: 2500,
      targetDate: null,
      createdAt: '2026-04-01T00:00:00.000Z',
      updatedAt: '2026-04-01T00:00:00.000Z',
    }

    expect(calculateGoalSnapshot(goal)).toEqual({
      id: 'goal-1',
      name: 'Emergency Fund',
      targetAmount: 10000,
      currentAmount: 2500,
      remainingAmount: 7500,
      percentComplete: 25,
      targetDate: null,
    })
  })

  it('returns null when no goal exists', () => {
    expect(calculateGoalSnapshot(null)).toBeNull()
  })

  it('calculates snapshots for all saved goals', () => {
    const goals: Goal[] = [
      {
        id: 'goal-1',
        name: 'Emergency Fund',
        targetAmount: 10000,
        currentAmount: 2500,
        targetDate: null,
        createdAt: '2026-04-01T00:00:00.000Z',
        updatedAt: '2026-04-01T00:00:00.000Z',
      },
      {
        id: 'goal-2',
        name: 'Travel Fund',
        targetAmount: 5000,
        currentAmount: 1000,
        targetDate: null,
        createdAt: '2026-04-01T00:00:00.000Z',
        updatedAt: '2026-04-01T00:00:00.000Z',
      },
    ]

    expect(calculateGoalSnapshots(goals)).toHaveLength(2)
  })

  it('includes linked transfer contributions in the goal current amount', () => {
    const goal: Goal = {
      id: 'goal-1',
      name: 'Emergency Fund',
      targetAmount: 10000,
      currentAmount: 2500,
      targetDate: null,
      createdAt: '2026-04-01T00:00:00.000Z',
      updatedAt: '2026-04-01T00:00:00.000Z',
    }
    const transactions: Transaction[] = [
      {
        id: 'txn-1',
        type: 'transfer',
        amount: 500,
        categoryId: 'category-transfer-transfer',
        accountId: null,
        fromAccountId: 'account-1',
        toAccountId: null,
        goalId: 'goal-1',
        goalTransferDirection: 'in',
        note: 'Goal Savings · Emergency Fund',
        transactionDate: '2026-04-02T00:00:00.000Z',
        recurringRuleId: null,
        createdAt: '2026-04-02T00:00:00.000Z',
        updatedAt: '2026-04-02T00:00:00.000Z',
      },
    ]

    expect(calculateGoalSnapshot(goal, transactions)?.currentAmount).toBe(3000)
  })

  it('subtracts linked transfer-out amounts from the goal current amount', () => {
    const goal: Goal = {
      id: 'goal-1',
      name: 'Emergency Fund',
      targetAmount: 10000,
      currentAmount: 2500,
      targetDate: null,
      createdAt: '2026-04-01T00:00:00.000Z',
      updatedAt: '2026-04-01T00:00:00.000Z',
    }
    const transactions: Transaction[] = [
      {
        id: 'txn-1',
        type: 'transfer',
        amount: 500,
        categoryId: 'category-transfer-transfer',
        accountId: null,
        fromAccountId: null,
        toAccountId: 'account-1',
        goalId: 'goal-1',
        goalTransferDirection: 'out',
        note: 'Goal Transfer Out · Emergency Fund',
        transactionDate: '2026-04-02T00:00:00.000Z',
        recurringRuleId: null,
        createdAt: '2026-04-02T00:00:00.000Z',
        updatedAt: '2026-04-02T00:00:00.000Z',
      },
    ]

    expect(calculateGoalSnapshot(goal, transactions)?.currentAmount).toBe(2000)
  })
})

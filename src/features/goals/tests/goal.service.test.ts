import { describe, expect, it } from 'vitest'
import { calculateGoalSnapshot } from '../services/goal.service'
import type { Goal } from '#/types/domain'

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
})

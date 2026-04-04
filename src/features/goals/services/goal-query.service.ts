import type { FinanceTrackerDatabase } from '#/db/dexie'
import { db } from '#/db/dexie'
import { createGoalRepository } from './goal.repository'
import { calculateGoalSnapshot } from './goal.service'

export function createGoalQueryService(database: FinanceTrackerDatabase = db) {
  const goalRepository = createGoalRepository(database)

  return {
    async getPrimaryGoalSnapshot() {
      const goals = await goalRepository.list()
      return calculateGoalSnapshot(goals[0])
    },
  }
}

export const goalQueryService = createGoalQueryService()

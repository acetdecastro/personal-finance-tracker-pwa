import type { FinanceTrackerDatabase } from '#/db/dexie'
import { db } from '#/db/dexie'
import { createTransactionRepository } from '#/features/transactions/services/transaction.repository'
import { createGoalRepository } from './goal.repository'
import { calculateGoalSnapshots } from './goal.service'

export function createGoalQueryService(database: FinanceTrackerDatabase = db) {
  const goalRepository = createGoalRepository(database)
  const transactionRepository = createTransactionRepository(database)

  return {
    async listGoalSnapshots() {
      const [goals, transactions] = await Promise.all([
        goalRepository.list(),
        transactionRepository.list(),
      ])
      return calculateGoalSnapshots(goals, transactions)
    },
  }
}

export const goalQueryService = createGoalQueryService()

import type { FinanceTrackerDatabase } from '#/db/dexie'
import { db } from '#/db/dexie'
import type { GoalUsageDto } from '#/types/dto'
import { createTransactionRepository } from '#/features/transactions/services/transaction.repository'
import { createGoalRepository } from './goal.repository'
import { calculateGoalSnapshot } from './goal.service'

const GOAL_DELETE_BLOCKED_REASON =
  'A goal can only be deleted when its saved amount is 0. Transfer funds out first.'

const GOAL_DELETE_NOTICE =
  'Linked transfer history will remain and be labeled as Deleted Goal.'

export function createGoalManagementService(
  database: FinanceTrackerDatabase = db,
) {
  const goalRepository = createGoalRepository(database)
  const transactionRepository = createTransactionRepository(database)

  async function listUsage(): Promise<GoalUsageDto[]> {
    const [goals, transactions] = await Promise.all([
      goalRepository.list(),
      transactionRepository.list(),
    ])

    return goals.map((goal) => {
      const currentAmount =
        calculateGoalSnapshot(goal, transactions)?.currentAmount ?? 0
      const linkedTransferCount = transactions.filter(
        (transaction) =>
          transaction.type === 'transfer' && transaction.goalId === goal.id,
      ).length
      const canDelete = currentAmount === 0

      return {
        goalId: goal.id,
        currentAmount,
        linkedTransferCount,
        canDelete,
        deleteBlockedReason: canDelete ? null : GOAL_DELETE_BLOCKED_REASON,
        deleteNotice:
          canDelete && linkedTransferCount > 0 ? GOAL_DELETE_NOTICE : null,
      }
    })
  }

  return {
    listUsage,

    async getUsage(goalId: string): Promise<GoalUsageDto | undefined> {
      const usage = await listUsage()
      return usage.find((item) => item.goalId === goalId)
    },

    async remove(goalId: string) {
      const usage = await this.getUsage(goalId)

      if (!usage) {
        throw new Error(`Goal not found: ${goalId}`)
      }

      if (!usage.canDelete) {
        throw new Error(GOAL_DELETE_BLOCKED_REASON)
      }

      await goalRepository.remove(goalId)
    },
  }
}

export const goalManagementService = createGoalManagementService()

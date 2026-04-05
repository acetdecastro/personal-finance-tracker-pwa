import type { FinanceTrackerDatabase } from '#/db/dexie'
import { db } from '#/db/dexie'
import {
  createEntityId,
  createTimestamps,
  touchUpdatedAt,
} from '#/lib/utils/entity'
import type { Goal } from '#/types/domain'
import {
  createGoalInputSchema,
  goalListSchema,
  goalSchema,
  updateGoalInputSchema,
} from '../schemas/goal.schemas'
import type { CreateGoalInput, UpdateGoalInput } from '../schemas/goal.schemas'

export function createGoalRepository(database: FinanceTrackerDatabase = db) {
  return {
    async list(): Promise<Goal[]> {
      return goalListSchema.parse(await database.goals.toArray())
    },

    async getById(id: string): Promise<Goal | undefined> {
      const goal = await database.goals.get(id)
      return goal ? goalSchema.parse(goal) : undefined
    },

    async create(input: CreateGoalInput): Promise<Goal> {
      const values = createGoalInputSchema.parse(input)
      const goal = goalSchema.parse({
        id: createEntityId(),
        ...values,
        ...createTimestamps(),
      })

      await database.goals.add(goal)

      return goal
    },

    async update(id: string, changes: UpdateGoalInput): Promise<Goal> {
      const existing = await this.getById(id)

      if (!existing) {
        throw new Error(`Goal not found: ${id}`)
      }

      const nextGoal = goalSchema.parse({
        ...existing,
        ...updateGoalInputSchema.parse(changes),
        ...touchUpdatedAt(),
      })

      await database.goals.put(nextGoal)

      return nextGoal
    },

    async remove(id: string): Promise<void> {
      await database.goals.delete(id)
    },

    async put(goal: Goal): Promise<Goal> {
      const validated = goalSchema.parse(goal)
      await database.goals.put(validated)
      return validated
    },
  }
}

export const goalRepository = createGoalRepository()

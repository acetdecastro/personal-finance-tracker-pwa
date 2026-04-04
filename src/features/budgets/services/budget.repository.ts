import type { FinanceTrackerDatabase } from '#/db/dexie'
import { db } from '#/db/dexie'
import { createEntityId, createTimestamps, touchUpdatedAt } from '#/lib/utils/entity'
import type { Budget } from '#/types/domain'
import {
  budgetListSchema,
  budgetSchema,
  createBudgetInputSchema,
  updateBudgetInputSchema,
} from '../schemas/budget.schemas'
import type {
  CreateBudgetInput,
  UpdateBudgetInput,
} from '../schemas/budget.schemas'

export function createBudgetRepository(database: FinanceTrackerDatabase = db) {
  return {
    async list(): Promise<Budget[]> {
      return budgetListSchema.parse(await database.budgets.toArray())
    },

    async getById(id: string): Promise<Budget | undefined> {
      const budget = await database.budgets.get(id)
      return budget ? budgetSchema.parse(budget) : undefined
    },

    async create(input: CreateBudgetInput): Promise<Budget> {
      const values = createBudgetInputSchema.parse(input)
      const budget = budgetSchema.parse({
        id: createEntityId(),
        ...values,
        ...createTimestamps(),
      })

      await database.budgets.add(budget)

      return budget
    },

    async update(id: string, changes: UpdateBudgetInput): Promise<Budget> {
      const existing = await this.getById(id)

      if (!existing) {
        throw new Error(`Budget not found: ${id}`)
      }

      const nextBudget = budgetSchema.parse({
        ...existing,
        ...updateBudgetInputSchema.parse(changes),
        ...touchUpdatedAt(),
      })

      await database.budgets.put(nextBudget)

      return nextBudget
    },

    async put(budget: Budget): Promise<Budget> {
      const validated = budgetSchema.parse(budget)
      await database.budgets.put(validated)
      return validated
    },
  }
}

export const budgetRepository = createBudgetRepository()

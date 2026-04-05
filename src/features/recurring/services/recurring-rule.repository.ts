import type { FinanceTrackerDatabase } from '#/db/dexie'
import { db } from '#/db/dexie'
import {
  createEntityId,
  createTimestamps,
  touchUpdatedAt,
} from '#/lib/utils/entity'
import type { RecurringRule } from '#/types/domain'
import {
  createRecurringRuleInputSchema,
  recurringRuleListSchema,
  recurringRuleSchema,
  updateRecurringRuleInputSchema,
} from '../schemas/recurring-rule.schemas'
import type {
  CreateRecurringRuleInput,
  UpdateRecurringRuleInput,
} from '../schemas/recurring-rule.schemas'

export function createRecurringRuleRepository(
  database: FinanceTrackerDatabase = db,
) {
  return {
    async list(): Promise<RecurringRule[]> {
      return recurringRuleListSchema.parse(
        await database.recurringRules.orderBy('nextOccurrenceDate').toArray(),
      )
    },

    async getById(id: string): Promise<RecurringRule | undefined> {
      const recurringRule = await database.recurringRules.get(id)
      return recurringRule
        ? recurringRuleSchema.parse(recurringRule)
        : undefined
    },

    async create(input: CreateRecurringRuleInput): Promise<RecurringRule> {
      const values = createRecurringRuleInputSchema.parse(input)
      const recurringRule = recurringRuleSchema.parse({
        id: createEntityId(),
        ...values,
        ...createTimestamps(),
      })

      await database.recurringRules.add(recurringRule)

      return recurringRule
    },

    async update(
      id: string,
      changes: UpdateRecurringRuleInput,
    ): Promise<RecurringRule> {
      const existing = await this.getById(id)

      if (!existing) {
        throw new Error(`Recurring rule not found: ${id}`)
      }

      const nextRecurringRule = recurringRuleSchema.parse({
        ...existing,
        ...updateRecurringRuleInputSchema.parse(changes),
        ...touchUpdatedAt(),
      })

      await database.recurringRules.put(nextRecurringRule)

      return nextRecurringRule
    },

    async put(recurringRule: RecurringRule): Promise<RecurringRule> {
      const validated = recurringRuleSchema.parse(recurringRule)
      await database.recurringRules.put(validated)
      return validated
    },
  }
}

export const recurringRuleRepository = createRecurringRuleRepository()

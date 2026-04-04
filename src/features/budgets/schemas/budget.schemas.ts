import { z } from 'zod'
import {
  entityIdSchema,
  positiveMoneySchema,
  timestampFieldsSchema,
} from '#/lib/utils/schema'

export const budgetPeriodTypeSchema = z.enum(['monthly'])

export const createBudgetInputSchema = z.object({
  categoryId: entityIdSchema,
  amount: positiveMoneySchema,
  periodType: budgetPeriodTypeSchema.default('monthly'),
})

export const updateBudgetInputSchema = createBudgetInputSchema.partial()

export const budgetSchema = z.object({
  id: entityIdSchema,
  categoryId: entityIdSchema,
  amount: positiveMoneySchema,
  periodType: budgetPeriodTypeSchema,
  ...timestampFieldsSchema.shape,
})

export const budgetListSchema = z.array(budgetSchema)

export type CreateBudgetInput = z.infer<typeof createBudgetInputSchema>
export type UpdateBudgetInput = z.infer<typeof updateBudgetInputSchema>

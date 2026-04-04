import { z } from 'zod'
import {
  nonNegativeMoneySchema,
  positiveMoneySchema,
  storedDateSchema,
  timestampFieldsSchema,
  trimmedNameSchema,
  entityIdSchema,
} from '#/lib/utils/schema'

export const createGoalInputSchema = z.object({
  name: trimmedNameSchema,
  targetAmount: positiveMoneySchema,
  currentAmount: nonNegativeMoneySchema.nullable().default(null),
  targetDate: storedDateSchema.nullable().default(null),
})

export const updateGoalInputSchema = createGoalInputSchema.partial()

export const goalSchema = z.object({
  id: entityIdSchema,
  name: trimmedNameSchema,
  targetAmount: positiveMoneySchema,
  currentAmount: nonNegativeMoneySchema.nullable(),
  targetDate: storedDateSchema.nullable(),
  ...timestampFieldsSchema.shape,
})

export const goalListSchema = z.array(goalSchema)

export type CreateGoalInput = z.infer<typeof createGoalInputSchema>
export type UpdateGoalInput = z.infer<typeof updateGoalInputSchema>

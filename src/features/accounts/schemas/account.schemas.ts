import { z } from 'zod'
import {
  entityIdSchema,
  nonNegativeMoneySchema,
  timestampFieldsSchema,
  trimmedNameSchema,
} from '#/lib/utils/schema'

export const accountTypeSchema = z.enum(['cash', 'bank', 'ewallet', 'other'])

export const createAccountInputSchema = z.object({
  name: trimmedNameSchema,
  type: accountTypeSchema,
  initialBalance: nonNegativeMoneySchema,
  safetyBuffer: nonNegativeMoneySchema.default(0),
  isArchived: z.boolean().default(false),
})

export const updateAccountInputSchema = createAccountInputSchema.partial()

export const accountSchema = z.object({
  id: entityIdSchema,
  name: trimmedNameSchema,
  type: accountTypeSchema,
  initialBalance: nonNegativeMoneySchema,
  safetyBuffer: nonNegativeMoneySchema,
  isArchived: z.boolean(),
  ...timestampFieldsSchema.shape,
})

export const accountListSchema = z.array(accountSchema)

export type CreateAccountInput = z.infer<typeof createAccountInputSchema>
export type UpdateAccountInput = z.infer<typeof updateAccountInputSchema>

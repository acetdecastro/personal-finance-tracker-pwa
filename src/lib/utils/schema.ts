import { isStoredDateString } from '#/lib/dates'
import { z } from 'zod'

export const ENTITY_NAME_MAX_LENGTH = 30
export const MONEY_MAX_AMOUNT = 99_999_999

export const entityIdSchema = z.string().trim().min(1).max(120)

export const storedDateSchema = z.string().refine(isStoredDateString, {
  message: 'Expected a complete ISO datetime string',
})

export const timestampFieldsSchema = z.object({
  createdAt: storedDateSchema,
  updatedAt: storedDateSchema,
})

export const trimmedNameSchema = z
  .string()
  .trim()
  .min(1, 'Name is required')
  .max(
    ENTITY_NAME_MAX_LENGTH,
    `Name must be ${ENTITY_NAME_MAX_LENGTH} characters or fewer`,
  )

export const optionalNoteSchema = z.string().trim().max(500).nullable()

export const moneySchema = z
  .number()
  .finite()
  .max(
    MONEY_MAX_AMOUNT,
    `Amount can't be greater than ${MONEY_MAX_AMOUNT.toLocaleString()}`,
  )

export const nonNegativeMoneySchema = moneySchema.min(0)

export const positiveMoneySchema = moneySchema.positive()

export const dayOfMonthSchema = z.number().int().min(1).max(31)

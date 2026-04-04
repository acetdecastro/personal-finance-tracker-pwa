import { isStoredDateString } from '#/lib/dates'
import { z } from 'zod'

export const entityIdSchema = z.string().trim().min(1).max(120)

export const storedDateSchema = z.string().refine(isStoredDateString, {
  message: 'Expected a complete ISO datetime string',
})

export const timestampFieldsSchema = z.object({
  createdAt: storedDateSchema,
  updatedAt: storedDateSchema,
})

export const trimmedNameSchema = z.string().trim().min(1).max(120)

export const optionalNoteSchema = z
  .string()
  .trim()
  .max(500)
  .nullable()

export const moneySchema = z.number().finite()

export const nonNegativeMoneySchema = z.number().finite().min(0)

export const positiveMoneySchema = z.number().finite().positive()

export const dayOfMonthSchema = z.number().int().min(1).max(31)

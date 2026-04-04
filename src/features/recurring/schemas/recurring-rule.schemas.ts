import { z } from 'zod'
import {
  dayOfMonthSchema,
  entityIdSchema,
  positiveMoneySchema,
  storedDateSchema,
  timestampFieldsSchema,
  trimmedNameSchema,
} from '#/lib/utils/schema'

export const recurringRuleTypeSchema = z.enum(['income', 'expense'])
export const recurringCadenceSchema = z.enum([
  'weekly',
  'semi-monthly',
  'monthly',
  'custom',
])
export const supportedRecurringCadenceSchema = z.enum([
  'weekly',
  'semi-monthly',
  'monthly',
])

const recurringRuleBaseSchema = z.object({
  name: trimmedNameSchema,
  type: recurringRuleTypeSchema,
  amount: positiveMoneySchema,
  categoryId: entityIdSchema,
  accountId: entityIdSchema,
  cadence: supportedRecurringCadenceSchema,
  semiMonthlyDays: z.array(dayOfMonthSchema).length(2).nullable(),
  monthlyDay: dayOfMonthSchema.nullable(),
  weeklyInterval: z.number().int().min(1).max(4).nullable(),
  nextOccurrenceDate: storedDateSchema,
  isActive: z.boolean().default(true),
})

function validateRecurringCadence<T extends z.ZodTypeAny>(schema: T) {
  return schema.superRefine((value, ctx) => {
    if (value.cadence === 'weekly') {
      if (!value.weeklyInterval) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['weeklyInterval'],
          message: 'Weekly recurring rules require weeklyInterval',
        })
      }

      if (value.monthlyDay || value.semiMonthlyDays) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['monthlyDay'],
          message: 'Weekly recurring rules must not set monthly cadence fields',
        })
      }
    }

    if (value.cadence === 'monthly') {
      if (!value.monthlyDay) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['monthlyDay'],
          message: 'Monthly recurring rules require monthlyDay',
        })
      }

      if (value.weeklyInterval || value.semiMonthlyDays) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['weeklyInterval'],
          message: 'Monthly recurring rules must not set weekly or semi-monthly fields',
        })
      }
    }

    if (value.cadence === 'semi-monthly') {
      if (!value.semiMonthlyDays) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['semiMonthlyDays'],
          message: 'Semi-monthly recurring rules require semiMonthlyDays',
        })
      }

      if (value.weeklyInterval || value.monthlyDay) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['weeklyInterval'],
          message: 'Semi-monthly recurring rules must not set weekly or monthly fields',
        })
      }
    }
  })
}

export const createRecurringRuleInputSchema =
  validateRecurringCadence(recurringRuleBaseSchema)

export const updateRecurringRuleInputSchema = recurringRuleBaseSchema.partial()

export const recurringRuleSchema = validateRecurringCadence(
  z.object({
    id: entityIdSchema,
    ...recurringRuleBaseSchema.shape,
    ...timestampFieldsSchema.shape,
  }),
)

export const recurringRuleListSchema = z.array(recurringRuleSchema)

export type CreateRecurringRuleInput = z.infer<
  typeof createRecurringRuleInputSchema
>
export type UpdateRecurringRuleInput = z.infer<
  typeof updateRecurringRuleInputSchema
>

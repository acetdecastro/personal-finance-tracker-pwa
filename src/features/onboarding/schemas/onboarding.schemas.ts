import { z } from 'zod'
import { createAccountInputSchema } from '#/features/accounts/schemas/account.schemas'
import { supportedRecurringCadenceSchema } from '#/features/recurring/schemas/recurring-rule.schemas'
import { userNameSchema } from '#/features/user/schemas/user.schemas'
import {
  dayOfMonthSchema,
  entityIdSchema,
  nonNegativeMoneySchema,
  positiveMoneySchema,
  storedDateSchema,
  trimmedNameSchema,
} from '#/lib/utils/schema'

const onboardingRecurringDraftShape = {
  name: trimmedNameSchema,
  amount: positiveMoneySchema,
  cadence: supportedRecurringCadenceSchema,
  semiMonthlyDays: z.array(dayOfMonthSchema).length(2).nullable(),
  monthlyDay: dayOfMonthSchema.nullable(),
  weeklyInterval: z.number().int().positive().nullable(),
  nextOccurrenceDate: storedDateSchema,
}

function withRecurringCadenceValidation<T extends z.ZodTypeAny>(schema: T) {
  return schema.superRefine((value, ctx) => {
    if (value.cadence === 'weekly') {
      if (!value.weeklyInterval) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['weeklyInterval'],
          message: 'Weekly recurring entries require weeklyInterval',
        })
      }
    }

    if (value.cadence === 'monthly') {
      if (!value.monthlyDay) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['monthlyDay'],
          message: 'Monthly recurring entries require monthlyDay',
        })
      }
    }

    if (value.cadence === 'semi-monthly') {
      if (!value.semiMonthlyDays) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['semiMonthlyDays'],
          message: 'Semi-monthly recurring entries require semiMonthlyDays',
        })
      }
    }
  })
}

const onboardingRecurringDraftSchema = withRecurringCadenceValidation(
  z.object(onboardingRecurringDraftShape),
)

export const onboardingSalaryInputSchema = withRecurringCadenceValidation(
  z.object({
    ...onboardingRecurringDraftShape,
    name: trimmedNameSchema.default('Salary'),
  }),
)

export const onboardingRecurringExpenseInputSchema =
  withRecurringCadenceValidation(
    z.object({
      ...onboardingRecurringDraftShape,
      categoryId: entityIdSchema,
    }),
  )

export const completeOnboardingInputSchema = z.object({
  userName: userNameSchema,
  primaryAccount: createAccountInputSchema,
  salary: onboardingSalaryInputSchema,
  recurringExpenses: z.array(onboardingRecurringExpenseInputSchema).default([]),
})

export type CompleteOnboardingInput = z.infer<
  typeof completeOnboardingInputSchema
>

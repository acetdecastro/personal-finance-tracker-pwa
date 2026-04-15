import { z } from 'zod'
import {
  entityIdSchema,
  optionalNoteSchema,
  positiveMoneySchema,
  storedDateSchema,
  timestampFieldsSchema,
} from '#/lib/utils/schema'

export const transactionTypeSchema = z.enum(['income', 'expense', 'transfer'])

const transactionBaseSchema = z.object({
  type: transactionTypeSchema,
  amount: positiveMoneySchema,
  categoryId: entityIdSchema.nullable(),
  accountId: entityIdSchema.nullable(),
  fromAccountId: entityIdSchema.nullable(),
  toAccountId: entityIdSchema.nullable(),
  goalId: entityIdSchema.nullable().default(null),
  goalTransferDirection: z.enum(['in', 'out']).nullable().default(null),
  note: optionalNoteSchema,
  transactionDate: storedDateSchema,
  recurringRuleId: entityIdSchema.nullable(),
  coveredRecurringOccurrenceDate: storedDateSchema.nullable().default(null),
})

function validateTransactionShape<T extends z.ZodTypeAny>(schema: T) {
  return schema.superRefine((value, ctx) => {
    if (value.type === 'transfer') {
      if (value.recurringRuleId || value.coveredRecurringOccurrenceDate) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['recurringRuleId'],
          message:
            'Transfer transactions must not be linked to recurring occurrences',
        })
      }

      if (value.goalId) {
        if (!value.categoryId) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['categoryId'],
            message: 'Transfer transactions require the Transfer category',
          })
        }

        const isGoalTransferOut =
          value.goalTransferDirection === 'out' ||
          (!value.goalTransferDirection &&
            Boolean(value.toAccountId) &&
            !value.fromAccountId)

        if (isGoalTransferOut) {
          if (!value.toAccountId) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              path: ['toAccountId'],
              message:
                'Goal transfer-out transactions require a destination account',
            })
          }

          if (value.fromAccountId || value.accountId) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              path: ['fromAccountId'],
              message:
                'Goal transfer-out transactions must not use source account or accountId',
            })
          }
        } else {
          if (!value.fromAccountId) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              path: ['fromAccountId'],
              message: 'Goal contributions require a source account',
            })
          }

          if (value.toAccountId || value.accountId) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              path: ['toAccountId'],
              message:
                'Goal contributions must not use destination account or accountId',
            })
          }
        }

        return
      }

      if (!value.fromAccountId || !value.toAccountId) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['fromAccountId'],
          message:
            'Transfer transactions require both source and destination accounts',
        })
      }

      if (value.accountId) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['accountId'],
          message: 'Transfer transactions must not use accountId',
        })
      }

      if (value.goalTransferDirection) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['goalTransferDirection'],
          message:
            'Only goal-linked transfers may use a goal transfer direction',
        })
      }

      if (!value.categoryId) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['categoryId'],
          message: 'Transfer transactions require the Transfer category',
        })
      }

      return
    }

    if (value.coveredRecurringOccurrenceDate && !value.recurringRuleId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['coveredRecurringOccurrenceDate'],
        message:
          'Covered recurring occurrence date requires a linked recurring transaction',
      })
    }

    if (!value.accountId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['accountId'],
        message: 'Income and expense transactions require accountId',
      })
    }

    if (!value.categoryId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['categoryId'],
        message: 'Income and expense transactions require categoryId',
      })
    }

    if (value.fromAccountId || value.toAccountId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['fromAccountId'],
        message:
          'Income and expense transactions must not use transfer account fields',
      })
    }

    if (value.goalId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['goalId'],
        message: 'Only transfer transactions may be linked to a goal',
      })
    }

    if (value.goalTransferDirection) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['goalTransferDirection'],
        message: 'Only transfer transactions may use a goal transfer direction',
      })
    }
  })
}

export const createTransactionInputSchema = validateTransactionShape(
  transactionBaseSchema,
)

export const updateTransactionInputSchema = transactionBaseSchema.partial()

export const transactionSchema = validateTransactionShape(
  z.object({
    id: entityIdSchema,
    ...transactionBaseSchema.shape,
    ...timestampFieldsSchema.shape,
  }),
)

export const transactionListSchema = z.array(transactionSchema)

export type CreateTransactionInput = z.infer<
  typeof createTransactionInputSchema
>
export type UpdateTransactionInput = z.infer<
  typeof updateTransactionInputSchema
>

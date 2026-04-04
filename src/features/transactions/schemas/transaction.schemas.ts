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
  note: optionalNoteSchema,
  transactionDate: storedDateSchema,
  recurringRuleId: entityIdSchema.nullable(),
})

function validateTransactionShape<T extends z.ZodTypeAny>(schema: T) {
  return schema.superRefine((value, ctx) => {
    if (value.type === 'transfer') {
      if (!value.fromAccountId || !value.toAccountId) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['fromAccountId'],
          message: 'Transfer transactions require both source and destination accounts',
        })
      }

      if (value.accountId || value.categoryId) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['accountId'],
          message: 'Transfer transactions must not use accountId or categoryId',
        })
      }

      return
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
        message: 'Income and expense transactions must not use transfer account fields',
      })
    }
  })
}

export const createTransactionInputSchema =
  validateTransactionShape(transactionBaseSchema)

export const updateTransactionInputSchema = transactionBaseSchema.partial()

export const transactionSchema = validateTransactionShape(
  z.object({
    id: entityIdSchema,
    ...transactionBaseSchema.shape,
    ...timestampFieldsSchema.shape,
  }),
)

export const transactionListSchema = z.array(transactionSchema)

export type CreateTransactionInput = z.infer<typeof createTransactionInputSchema>
export type UpdateTransactionInput = z.infer<typeof updateTransactionInputSchema>

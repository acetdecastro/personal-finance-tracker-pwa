import { z } from 'zod'
import { accountListSchema } from '#/features/accounts/schemas/account.schemas'
import { budgetListSchema } from '#/features/budgets/schemas/budget.schemas'
import { categoryListSchema } from '#/features/categories/schemas/category.schemas'
import { goalListSchema } from '#/features/goals/schemas/goal.schemas'
import { recurringRuleListSchema } from '#/features/recurring/schemas/recurring-rule.schemas'
import { userSettingsListSchema } from '#/features/settings/schemas/user-settings.schemas'
import { transactionListSchema } from '#/features/transactions/schemas/transaction.schemas'
import { userListSchema } from '#/features/user/schemas/user.schemas'
import { storedDateSchema } from '#/lib/utils/schema'

export const exportMetadataSchema = z.object({
  appVersion: z.string().trim().min(1),
  exportedAt: storedDateSchema,
  schemaVersion: z.number().int().positive(),
})

export const exportPayloadSchema = z.object({
  metadata: exportMetadataSchema,
  accounts: accountListSchema,
  categories: categoryListSchema,
  transactions: transactionListSchema,
  recurringRules: recurringRuleListSchema,
  budgets: budgetListSchema,
  goals: goalListSchema,
  userSettings: userSettingsListSchema,
  users: userListSchema,
})

export const importPayloadSchema = exportPayloadSchema.extend({
  users: userListSchema.optional().default([]),
})

export type ExportPayload = z.infer<typeof exportPayloadSchema>
export type ImportPayload = z.infer<typeof importPayloadSchema>

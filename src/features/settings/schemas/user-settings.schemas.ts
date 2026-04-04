import { z } from 'zod'
import {
  nonNegativeMoneySchema,
  timestampFieldsSchema,
} from '#/lib/utils/schema'

export const currencySchema = z.enum(['PHP'])
export const themePreferenceSchema = z.enum(['light', 'dark', 'system'])

export const createUserSettingsInputSchema = z.object({
  id: z.literal('primary').default('primary'),
  currency: currencySchema.default('PHP'),
  theme: themePreferenceSchema.default('system'),
  hasCompletedOnboarding: z.boolean().default(false),
})

export const updateUserSettingsInputSchema = createUserSettingsInputSchema
  .omit({ id: true })
  .partial()

export const userSettingsSchema = z.object({
  id: z.literal('primary'),
  currency: currencySchema,
  theme: themePreferenceSchema,
  hasCompletedOnboarding: z.boolean(),
  ...timestampFieldsSchema.shape,
})

export const userSettingsListSchema = z.array(userSettingsSchema)

export type CreateUserSettingsInput = z.infer<
  typeof createUserSettingsInputSchema
>
export type UpdateUserSettingsInput = z.infer<
  typeof updateUserSettingsInputSchema
>

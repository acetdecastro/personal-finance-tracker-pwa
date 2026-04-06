import { z } from 'zod'
import { createAccountInputSchema } from '#/features/accounts/schemas/account.schemas'
import { userNameSchema } from '#/features/user/schemas/user.schemas'

export const completeOnboardingInputSchema = z.object({
  userName: userNameSchema,
  initialAccount: createAccountInputSchema,
})

export type CompleteOnboardingInput = z.infer<
  typeof completeOnboardingInputSchema
>

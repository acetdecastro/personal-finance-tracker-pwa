import { z } from 'zod'
import { timestampFieldsSchema } from '#/lib/utils/schema'

export const USER_NAME_MAX_LENGTH = 15

export const userNameSchema = z
  .string()
  .trim()
  .min(1, 'Name is required')
  .max(
    USER_NAME_MAX_LENGTH,
    `Name must be ${USER_NAME_MAX_LENGTH} characters or fewer`,
  )

export const userSchema = z.object({
  id: z.literal('primary'),
  name: userNameSchema,
  ...timestampFieldsSchema.shape,
})

export const userListSchema = z.array(userSchema)

export type CreateUserInput = { name: string }

import { z } from 'zod'
import {
  entityIdSchema,
  timestampFieldsSchema,
  trimmedNameSchema,
} from '#/lib/utils/schema'

export const categoryTypeSchema = z.enum(['income', 'expense', 'transfer'])

export const createCategoryInputSchema = z.object({
  name: trimmedNameSchema,
  type: categoryTypeSchema,
  isSystem: z.boolean().default(false),
})

export const updateCategoryInputSchema = createCategoryInputSchema.partial()

export const categorySchema = z.object({
  id: entityIdSchema,
  name: trimmedNameSchema,
  type: categoryTypeSchema,
  isSystem: z.boolean(),
  ...timestampFieldsSchema.shape,
})

export const categoryListSchema = z.array(categorySchema)

export type CreateCategoryInput = z.infer<typeof createCategoryInputSchema>
export type UpdateCategoryInput = z.infer<typeof updateCategoryInputSchema>

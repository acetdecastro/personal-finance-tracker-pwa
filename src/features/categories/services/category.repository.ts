import type { FinanceTrackerDatabase } from '#/db/dexie'
import { db } from '#/db/dexie'
import { createEntityId, createTimestamps, touchUpdatedAt } from '#/lib/utils/entity'
import type { Category, CategoryType } from '#/types/domain'
import {
  categoryListSchema,
  categorySchema,
  createCategoryInputSchema,
  updateCategoryInputSchema,
} from '../schemas/category.schemas'
import type {
  CreateCategoryInput,
  UpdateCategoryInput,
} from '../schemas/category.schemas'

export function createCategoryRepository(
  database: FinanceTrackerDatabase = db,
) {
  return {
    async list(): Promise<Category[]> {
      return categoryListSchema.parse(
        await database.categories.orderBy('createdAt').toArray(),
      )
    },

    async listByType(type: CategoryType): Promise<Category[]> {
      return categoryListSchema.parse(
        await database.categories.where('type').equals(type).sortBy('name'),
      )
    },

    async getById(id: string): Promise<Category | undefined> {
      const category = await database.categories.get(id)
      return category ? categorySchema.parse(category) : undefined
    },

    async create(input: CreateCategoryInput): Promise<Category> {
      const values = createCategoryInputSchema.parse(input)
      const category = categorySchema.parse({
        id: createEntityId(),
        ...values,
        ...createTimestamps(),
      })

      await database.categories.add(category)

      return category
    },

    async createMany(inputs: CreateCategoryInput[]): Promise<Category[]> {
      const categories = inputs.map((input) =>
        categorySchema.parse({
          id: createEntityId(),
          ...createCategoryInputSchema.parse(input),
          ...createTimestamps(),
        }),
      )

      await database.categories.bulkAdd(categories)

      return categories
    },

    async update(id: string, changes: UpdateCategoryInput): Promise<Category> {
      const existing = await this.getById(id)

      if (!existing) {
        throw new Error(`Category not found: ${id}`)
      }

      const nextCategory = categorySchema.parse({
        ...existing,
        ...updateCategoryInputSchema.parse(changes),
        ...touchUpdatedAt(),
      })

      await database.categories.put(nextCategory)

      return nextCategory
    },

    async put(category: Category): Promise<Category> {
      const validated = categorySchema.parse(category)
      await database.categories.put(validated)
      return validated
    },
  }
}

export const categoryRepository = createCategoryRepository()

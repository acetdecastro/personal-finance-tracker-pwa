import type { FinanceTrackerDatabase } from '#/db/dexie'
import { db } from '#/db/dexie'
import { categorySchema } from '#/features/categories/schemas/category.schemas'
import { userSettingsSchema } from '#/features/settings/schemas/user-settings.schemas'
import { createTimestamps } from '#/lib/utils/entity'
import type { SeedRunResult } from '#/types/dto'
import { DEFAULT_CATEGORY_SEED, DEFAULT_USER_SETTINGS } from './seed-data'

export async function seedCoreData(
  database: FinanceTrackerDatabase = db,
): Promise<SeedRunResult> {
  return database.transaction(
    'rw',
    database.categories,
    database.userSettings,
    async () => {
      const existingCategoryIds = new Set(await database.categories.toCollection().primaryKeys())
      const categoriesToCreate = DEFAULT_CATEGORY_SEED.filter(
        (category) => !existingCategoryIds.has(category.id),
      ).map((category) =>
        categorySchema.parse({
          ...category,
          isSystem: true,
          ...createTimestamps(),
        }),
      )

      if (categoriesToCreate.length > 0) {
        await database.categories.bulkAdd(categoriesToCreate)
      }

      let createdUserSettings = 0
      const existingSettings = await database.userSettings.get('primary')

      if (!existingSettings) {
        await database.userSettings.add(
          userSettingsSchema.parse({
            ...DEFAULT_USER_SETTINGS,
            ...createTimestamps(),
          }),
        )
        createdUserSettings = 1
      }

      return {
        createdCategories: categoriesToCreate.length,
        createdUserSettings,
      }
    },
  )
}

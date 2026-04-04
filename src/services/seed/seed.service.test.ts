import { afterEach, describe, expect, it } from 'vitest'
import { createCategoryRepository } from '#/features/categories/services/category.repository'
import { createUserSettingsRepository } from '#/features/settings/services/user-settings.repository'
import { destroyTestDatabase, createTestDatabase } from '#/test/test-db'
import { seedCoreData } from './seed.service'

const databases: ReturnType<typeof createTestDatabase>[] = []

afterEach(async () => {
  await Promise.all(databases.splice(0).map((database) => destroyTestDatabase(database)))
})

describe('seedCoreData', () => {
  it('creates the required categories and default settings on first run', async () => {
    const database = createTestDatabase()
    databases.push(database)
    const categoryRepository = createCategoryRepository(database)
    const userSettingsRepository = createUserSettingsRepository(database)

    const result = await seedCoreData(database)
    const categories = await categoryRepository.list()
    const settings = await userSettingsRepository.get()

    expect(result).toEqual({
      createdCategories: 11,
      createdUserSettings: 1,
    })
    expect(categories).toHaveLength(11)
    expect(settings?.currency).toBe('PHP')
  })

  it('is idempotent across repeated app starts', async () => {
    const database = createTestDatabase()
    databases.push(database)

    await seedCoreData(database)
    const secondRun = await seedCoreData(database)

    expect(secondRun).toEqual({
      createdCategories: 0,
      createdUserSettings: 0,
    })
  })
})

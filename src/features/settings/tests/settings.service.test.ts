import { afterEach, describe, expect, it } from 'vitest'
import { createSettingsService } from '../services/settings.service'
import { createTestDatabase, destroyTestDatabase } from '#/test/test-db'

const databases: ReturnType<typeof createTestDatabase>[] = []

afterEach(async () => {
  await Promise.all(
    databases.splice(0).map((database) => destroyTestDatabase(database)),
  )
})

describe('settingsService', () => {
  it('returns screen data from seeded settings', async () => {
    const database = createTestDatabase()
    databases.push(database)
    const settingsService = createSettingsService(database)

    const settings = await settingsService.getScreenData()

    expect(settings.currency).toBe('PHP')
    expect(settings.theme).toBe('system')
  })

  it('updates theme through the service layer', async () => {
    const database = createTestDatabase()
    databases.push(database)
    const settingsService = createSettingsService(database)

    const updatedTheme = await settingsService.updateTheme('dark')

    expect(updatedTheme.theme).toBe('dark')
  })
})

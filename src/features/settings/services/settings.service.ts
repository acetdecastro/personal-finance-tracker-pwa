import type { FinanceTrackerDatabase } from '#/db/dexie'
import { db } from '#/db/dexie'
import { seedCoreData } from '#/services/seed/seed.service'
import type { SettingsScreenDto } from '#/types/dto'
import type { ThemePreference, UserSettings } from '#/types/domain'
import { createUserSettingsRepository } from './user-settings.repository'

export function mapSettingsToDto(settings: UserSettings): SettingsScreenDto {
  return {
    currency: settings.currency,
    theme: settings.theme,
    hasCompletedOnboarding: settings.hasCompletedOnboarding,
  }
}

export function createSettingsService(database: FinanceTrackerDatabase = db) {
  const userSettingsRepository = createUserSettingsRepository(database)

  return {
    async getScreenData(): Promise<SettingsScreenDto> {
      await seedCoreData(database)

      const settings = await userSettingsRepository.get()

      if (!settings) {
        throw new Error('User settings are not initialized')
      }

      return mapSettingsToDto(settings)
    },
    async updateTheme(theme: ThemePreference): Promise<SettingsScreenDto> {
      await seedCoreData(database)
      const settings = await userSettingsRepository.update({ theme })
      return mapSettingsToDto(settings)
    },
  }
}

export const settingsService = createSettingsService()

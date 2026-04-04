import type { FinanceTrackerDatabase } from '#/db/dexie'
import { db } from '#/db/dexie'
import { createTimestamps, touchUpdatedAt } from '#/lib/utils/entity'
import type { UserSettings } from '#/types/domain'
import {
  createUserSettingsInputSchema,
  userSettingsSchema,
  updateUserSettingsInputSchema,
} from '../schemas/user-settings.schemas'
import type {
  CreateUserSettingsInput,
  UpdateUserSettingsInput,
} from '../schemas/user-settings.schemas'

export function createUserSettingsRepository(
  database: FinanceTrackerDatabase = db,
) {
  return {
    async get(): Promise<UserSettings | undefined> {
      const settings = await database.userSettings.get('primary')
      return settings ? userSettingsSchema.parse(settings) : undefined
    },

    async create(
      input?: Partial<CreateUserSettingsInput>,
    ): Promise<UserSettings> {
      const settings = userSettingsSchema.parse({
        ...createUserSettingsInputSchema.parse(input ?? {}),
        ...createTimestamps(),
      })

      await database.userSettings.put(settings)

      return settings
    },

    async update(changes: UpdateUserSettingsInput): Promise<UserSettings> {
      const existing = await this.get()

      if (!existing) {
        throw new Error('User settings not found')
      }

      const nextSettings = userSettingsSchema.parse({
        ...existing,
        ...updateUserSettingsInputSchema.parse(changes),
        ...touchUpdatedAt(),
      })

      await database.userSettings.put(nextSettings)

      return nextSettings
    },

    async put(settings: UserSettings): Promise<UserSettings> {
      const validated = userSettingsSchema.parse(settings)
      await database.userSettings.put(validated)
      return validated
    },
  }
}

export const userSettingsRepository = createUserSettingsRepository()

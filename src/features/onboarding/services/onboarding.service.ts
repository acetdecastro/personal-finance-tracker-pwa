import type { FinanceTrackerDatabase } from '#/db/dexie'
import { db } from '#/db/dexie'
import { createAccountRepository } from '#/features/accounts/services/account.repository'
import { createUserSettingsRepository } from '#/features/settings/services/user-settings.repository'
import { mapSettingsToDto } from '#/features/settings/services/settings.service'
import { seedCoreData } from '#/services/seed/seed.service'
import { userSchema } from '#/features/user/schemas/user.schemas'
import { createTimestamps } from '#/lib/utils/entity'
import type {
  CompleteOnboardingResultDto,
  OnboardingBootstrapDto,
} from '#/types/dto'
import { completeOnboardingInputSchema } from '../schemas/onboarding.schemas'
import type { CompleteOnboardingInput } from '../schemas/onboarding.schemas'

export const ONBOARDING_ALREADY_COMPLETED_ERROR =
  'Onboarding has already been completed.'

export function createOnboardingService(database: FinanceTrackerDatabase = db) {
  const accountRepository = createAccountRepository(database)
  const userSettingsRepository = createUserSettingsRepository(database)

  return {
    async getBootstrapData(): Promise<OnboardingBootstrapDto> {
      await seedCoreData(database)

      const settings = await userSettingsRepository.get()

      if (!settings) {
        throw new Error('User settings are not initialized')
      }

      return {
        settings: mapSettingsToDto(settings),
      }
    },

    async complete(
      input: CompleteOnboardingInput,
    ): Promise<CompleteOnboardingResultDto> {
      await seedCoreData(database)
      const values = completeOnboardingInputSchema.parse(input)

      return database.transaction(
        'rw',
        database.accounts,
        database.userSettings,
        database.users,
        async () => {
          const existingSettings = await userSettingsRepository.get()

          if (existingSettings?.hasCompletedOnboarding) {
            throw new Error(ONBOARDING_ALREADY_COMPLETED_ERROR)
          }

          const initialAccount = await accountRepository.create(
            values.initialAccount,
          )

          const userSettings = existingSettings
            ? await userSettingsRepository.update({
                hasCompletedOnboarding: true,
              })
            : await userSettingsRepository.create({
                hasCompletedOnboarding: true,
              })

          const user = userSchema.parse({
            id: 'primary',
            name: values.userName,
            ...createTimestamps(),
          })

          await database.users.put(user)

          return {
            initialAccount,
            userSettings,
            user,
          }
        },
      )
    },
  }
}

export const onboardingService = createOnboardingService()

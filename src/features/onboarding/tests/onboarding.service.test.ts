import { afterEach, describe, expect, it } from 'vitest'
import {
  createOnboardingService,
  ONBOARDING_ALREADY_COMPLETED_ERROR,
} from '../services/onboarding.service'
import { createAccountRepository } from '#/features/accounts/services/account.repository'
import { createUserSettingsRepository } from '#/features/settings/services/user-settings.repository'
import { seedCoreData } from '#/services/seed/seed.service'
import { createTestDatabase, destroyTestDatabase } from '#/test/test-db'

const databases: ReturnType<typeof createTestDatabase>[] = []

afterEach(async () => {
  await Promise.all(
    databases.splice(0).map((database) => destroyTestDatabase(database)),
  )
})

describe('onboardingService', () => {
  it('returns seeded bootstrap data for the onboarding flow', async () => {
    const database = createTestDatabase()
    databases.push(database)
    const onboardingService = createOnboardingService(database)

    const bootstrap = await onboardingService.getBootstrapData()

    expect(bootstrap.settings.hasCompletedOnboarding).toBe(false)
  })

  it('completes onboarding by creating the initial records and updating settings', async () => {
    const database = createTestDatabase()
    databases.push(database)
    const onboardingService = createOnboardingService(database)

    const result = await onboardingService.complete({
      userName: 'Alex',
      initialAccount: {
        name: 'Main Wallet',
        type: 'ewallet',
        initialBalance: 2500,
        safetyBuffer: 1000,
        isArchived: false,
      },
    })

    expect(result.initialAccount.name).toBe('Main Wallet')
    expect(result.initialAccount.safetyBuffer).toBe(1000)
    expect(result.userSettings.hasCompletedOnboarding).toBe(true)
    expect(result.user.name).toBe('Alex')
  })

  it('rejects repeat onboarding completion after onboarding has already been completed', async () => {
    const database = createTestDatabase()
    databases.push(database)
    const onboardingService = createOnboardingService(database)
    const accountRepository = createAccountRepository(database)
    const userSettingsRepository = createUserSettingsRepository(database)

    await seedCoreData(database)

    await accountRepository.create({
      name: 'Existing Account',
      type: 'bank',
      initialBalance: 1000,
      safetyBuffer: 100,
      isArchived: false,
    })

    await userSettingsRepository.update({
      hasCompletedOnboarding: true,
    })

    await expect(
      onboardingService.complete({
        userName: 'Alex',
        initialAccount: {
          name: 'Main Wallet',
          type: 'ewallet',
          initialBalance: 2500,
          safetyBuffer: 1000,
          isArchived: false,
        },
      }),
    ).rejects.toThrow(ONBOARDING_ALREADY_COMPLETED_ERROR)

    const accounts = await accountRepository.list()
    expect(accounts).toHaveLength(1)
  })
})

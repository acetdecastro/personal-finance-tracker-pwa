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

    expect(bootstrap.salaryCategoryId).toBe('category-income-salary')
    expect(bootstrap.expenseCategoryOptions.length).toBeGreaterThan(0)
    expect(bootstrap.settings.hasCompletedOnboarding).toBe(false)
  })

  it('completes onboarding by creating the primary records and updating settings', async () => {
    const database = createTestDatabase()
    databases.push(database)
    const onboardingService = createOnboardingService(database)

    const result = await onboardingService.complete({
      userName: 'Alex',
      primaryAccount: {
        name: 'Main Wallet',
        type: 'ewallet',
        initialBalance: 2500,
        safetyBuffer: 1000,
        isArchived: false,
      },
      salary: {
        name: 'Salary',
        amount: 15000,
        cadence: 'semi-monthly',
        semiMonthlyDays: [15, 30],
        monthlyDay: null,
        weeklyInterval: null,
        nextOccurrenceDate: '2026-04-15T00:00:00.000Z',
      },
      recurringExpenses: [
        {
          name: 'Internet',
          amount: 1499,
          categoryId: 'category-expense-utilities',
          cadence: 'monthly',
          semiMonthlyDays: null,
          monthlyDay: 10,
          weeklyInterval: null,
          nextOccurrenceDate: '2026-04-10T00:00:00.000Z',
        },
      ],
    })

    expect(result.primaryAccount.name).toBe('Main Wallet')
    expect(result.salaryRule.categoryId).toBe('category-income-salary')
    expect(result.salaryRule.accountId).toBe(result.primaryAccount.id)
    expect(result.recurringExpenseRules).toHaveLength(1)
    expect(result.recurringExpenseRules[0]?.accountId).toBe(
      result.primaryAccount.id,
    )
    expect(result.primaryAccount.safetyBuffer).toBe(1000)
    expect(result.userSettings.hasCompletedOnboarding).toBe(true)
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
        primaryAccount: {
          name: 'Main Wallet',
          type: 'ewallet',
          initialBalance: 2500,
          safetyBuffer: 1000,
          isArchived: false,
        },
        salary: {
          name: 'Salary',
          amount: 15000,
          cadence: 'semi-monthly',
          semiMonthlyDays: [15, 30],
          monthlyDay: null,
          weeklyInterval: null,
          nextOccurrenceDate: '2026-04-15T00:00:00.000Z',
        },
        recurringExpenses: [],
      }),
    ).rejects.toThrow(ONBOARDING_ALREADY_COMPLETED_ERROR)

    const accounts = await accountRepository.list()
    expect(accounts).toHaveLength(1)
  })
})

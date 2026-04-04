import { afterEach, describe, expect, it } from 'vitest'
import { createOnboardingService } from '../services/onboarding.service'
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
    expect(result.recurringExpenseRules[0]?.accountId).toBe(result.primaryAccount.id)
    expect(result.primaryAccount.safetyBuffer).toBe(1000)
    expect(result.userSettings.hasCompletedOnboarding).toBe(true)
  })
})

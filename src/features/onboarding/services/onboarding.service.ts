import type { FinanceTrackerDatabase } from '#/db/dexie'
import { db } from '#/db/dexie'
import { createAccountRepository } from '#/features/accounts/services/account.repository'
import { createCategoryQueryService } from '#/features/categories/services/category-query.service'
import { createRecurringRuleRepository } from '#/features/recurring/services/recurring-rule.repository'
import { createUserSettingsRepository } from '#/features/settings/services/user-settings.repository'
import { mapSettingsToDto } from '#/features/settings/services/settings.service'
import { seedCoreData } from '#/services/seed/seed.service'
import type { CompleteOnboardingResultDto, OnboardingBootstrapDto } from '#/types/dto'
import { completeOnboardingInputSchema } from '../schemas/onboarding.schemas'
import type { CompleteOnboardingInput } from '../schemas/onboarding.schemas'

export function createOnboardingService(
  database: FinanceTrackerDatabase = db,
) {
  const accountRepository = createAccountRepository(database)
  const recurringRuleRepository = createRecurringRuleRepository(database)
  const userSettingsRepository = createUserSettingsRepository(database)
  const categoryQueryService = createCategoryQueryService(database)

  return {
    async getBootstrapData(): Promise<OnboardingBootstrapDto> {
      await seedCoreData(database)

      const [expenseCategoryOptions, salaryCategory, settings] =
        await Promise.all([
          categoryQueryService.listOptionsByType('expense'),
          categoryQueryService.getSalaryCategory(),
          userSettingsRepository.get(),
        ])

      if (!settings) {
        throw new Error('User settings are not initialized')
      }

      return {
        expenseCategoryOptions,
        salaryCategoryId: salaryCategory?.id ?? null,
        settings: mapSettingsToDto(settings),
      }
    },

    async complete(
      input: CompleteOnboardingInput,
    ): Promise<CompleteOnboardingResultDto> {
      await seedCoreData(database)
      const values = completeOnboardingInputSchema.parse(input)
      const salaryCategory = await categoryQueryService.getSalaryCategory()

      if (!salaryCategory) {
        throw new Error('Salary category is not available')
      }

      return database.transaction(
        'rw',
        database.accounts,
        database.recurringRules,
        database.userSettings,
        async () => {
          const primaryAccount = await accountRepository.create(
            values.primaryAccount,
          )

          const salaryRule = await recurringRuleRepository.create({
            ...values.salary,
            type: 'income',
            categoryId: salaryCategory.id,
            accountId: primaryAccount.id,
            isActive: true,
          })

          const recurringExpenseRules = await Promise.all(
            values.recurringExpenses.map((expense) =>
              recurringRuleRepository.create({
                ...expense,
                type: 'expense',
                accountId: primaryAccount.id,
                isActive: true,
              }),
            ),
          )

          const existingSettings = await userSettingsRepository.get()
          const userSettings = existingSettings
            ? await userSettingsRepository.update({
                hasCompletedOnboarding: true,
              })
            : await userSettingsRepository.create({
                hasCompletedOnboarding: true,
              })

          return {
            primaryAccount,
            salaryRule,
            recurringExpenseRules,
            userSettings,
          }
        },
      )
    },
  }
}

export const onboardingService = createOnboardingService()

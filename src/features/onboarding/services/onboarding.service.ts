import type { FinanceTrackerDatabase } from '#/db/dexie'
import { db } from '#/db/dexie'
import { createAccountRepository } from '#/features/accounts/services/account.repository'
import { createCategoryQueryService } from '#/features/categories/services/category-query.service'
import { createRecurringRuleRepository } from '#/features/recurring/services/recurring-rule.repository'
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
        database.users,
        async () => {
          const existingSettings = await userSettingsRepository.get()

          if (existingSettings?.hasCompletedOnboarding) {
            throw new Error(ONBOARDING_ALREADY_COMPLETED_ERROR)
          }

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
            primaryAccount,
            salaryRule,
            recurringExpenseRules,
            userSettings,
            user,
          }
        },
      )
    },
  }
}

export const onboardingService = createOnboardingService()

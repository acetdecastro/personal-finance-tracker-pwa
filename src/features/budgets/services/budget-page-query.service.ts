import type { FinanceTrackerDatabase } from '#/db/dexie'
import { db } from '#/db/dexie'
import { createBudgetRepository } from '#/features/budgets/services/budget.repository'
import { calculateBudgetSnapshots } from '#/features/budgets/services/budget.service'
import { createCategoryQueryService } from '#/features/categories/services/category-query.service'
import { createCategoryRepository } from '#/features/categories/services/category.repository'
import { createGoalRepository } from '#/features/goals/services/goal.repository'
import { calculateGoalSnapshots } from '#/features/goals/services/goal.service'
import { createTransactionRepository } from '#/features/transactions/services/transaction.repository'
import { seedCoreData } from '#/services/seed/seed.service'
import type { BudgetPageDataDto } from '#/types/dto'

interface GetBudgetPageDataOptions {
  now?: Date | string
}

export function createBudgetPageQueryService(
  database: FinanceTrackerDatabase = db,
) {
  const budgetRepository = createBudgetRepository(database)
  const categoryRepository = createCategoryRepository(database)
  const categoryQueryService = createCategoryQueryService(database)
  const goalRepository = createGoalRepository(database)
  const transactionRepository = createTransactionRepository(database)

  return {
    async getBudgetPageData(
      options: GetBudgetPageDataOptions = {},
    ): Promise<BudgetPageDataDto> {
      await seedCoreData(database)

      const [budgets, categories, transactions, expenseCategoryOptions, goals] =
        await Promise.all([
          budgetRepository.list(),
          categoryRepository.list(),
          transactionRepository.list(),
          categoryQueryService.listOptionsByType('expense'),
          goalRepository.list(),
        ])

      return {
        budgetSnapshots: calculateBudgetSnapshots({
          budgets,
          categories,
          transactions,
          referenceDate: options.now,
        }),
        expenseCategoryOptions,
        goals: calculateGoalSnapshots(goals, transactions),
      }
    },
  }
}

export const budgetPageQueryService = createBudgetPageQueryService()

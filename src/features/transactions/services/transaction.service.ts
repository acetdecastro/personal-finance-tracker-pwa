import type { FinanceTrackerDatabase } from '#/db/dexie'
import { db } from '#/db/dexie'
import { createAccountQueryService } from '#/features/accounts/services/account-query.service'
import { createAccountRepository } from '#/features/accounts/services/account.repository'
import { createCategoryQueryService } from '#/features/categories/services/category-query.service'
import { createCategoryRepository } from '#/features/categories/services/category.repository'
import { createRecurringRuleRepository } from '#/features/recurring/services/recurring-rule.repository'
import { seedCoreData } from '#/services/seed/seed.service'
import type {
  RecurringTransactionOptionDto,
  TransactionFiltersDto,
  TransactionFormOptionsDto,
} from '#/types/dto'
import type { Transaction } from '#/types/domain'
import { createTransactionRepository } from './transaction.repository'
import type {
  CreateTransactionInput,
  UpdateTransactionInput,
} from '../schemas/transaction.schemas'

export function createTransactionService(
  database: FinanceTrackerDatabase = db,
) {
  const transactionRepository = createTransactionRepository(database)
  const accountQueryService = createAccountQueryService(database)
  const accountRepository = createAccountRepository(database)
  const categoryQueryService = createCategoryQueryService(database)
  const categoryRepository = createCategoryRepository(database)
  const recurringRuleRepository = createRecurringRuleRepository(database)

  function buildRecurringTransactionOptions(input: {
    recurringRules: Awaited<ReturnType<typeof recurringRuleRepository.list>>
    accounts: Awaited<ReturnType<typeof accountRepository.list>>
    categories: Awaited<ReturnType<typeof categoryRepository.list>>
    type: 'income' | 'expense'
  }): RecurringTransactionOptionDto[] {
    const accountMap = new Map(input.accounts.map((account) => [account.id, account]))
    const categoryMap = new Map(
      input.categories.map((category) => [category.id, category]),
    )

    return input.recurringRules
      .filter((rule) => rule.isActive && rule.type === input.type)
      .map((rule) => {
        const account = accountMap.get(rule.accountId)
        const category = categoryMap.get(rule.categoryId)

        if (!account || !category) {
          return null
        }

        return {
          value: rule.id,
          label: rule.name,
          type: rule.type,
          categoryId: rule.categoryId,
          categoryLabel: category.name,
          accountId: rule.accountId,
          accountLabel: account.name,
          expectedAmount: rule.amount,
          nextOccurrenceDate: rule.nextOccurrenceDate,
        }
      })
      .filter((option): option is RecurringTransactionOptionDto => option !== null)
      .sort(
        (left, right) =>
          new Date(left.nextOccurrenceDate).getTime() -
          new Date(right.nextOccurrenceDate).getTime(),
      )
  }

  return {
    async list(filters?: TransactionFiltersDto): Promise<Transaction[]> {
      const transactions = await transactionRepository.list()

      if (!filters) {
        return transactions
      }

      return transactions.filter((transaction) => {
        if (filters.type && transaction.type !== filters.type) {
          return false
        }

        if (filters.accountId && transaction.accountId !== filters.accountId) {
          return false
        }

        if (filters.categoryId && transaction.categoryId !== filters.categoryId) {
          return false
        }

        return true
      })
    },

    async create(input: CreateTransactionInput) {
      return transactionRepository.create(input)
    },

    async update(id: string, changes: UpdateTransactionInput) {
      return transactionRepository.update(id, changes)
    },

    async remove(id: string) {
      return transactionRepository.remove(id)
    },

    async getFormOptions(): Promise<TransactionFormOptionsDto> {
      await seedCoreData(database)

      const [
        accountOptions,
        incomeCategoryOptions,
        expenseCategoryOptions,
        recurringRules,
        accounts,
        categories,
      ] =
        await Promise.all([
          accountQueryService.listActiveAccountOptions(),
          categoryQueryService.listOptionsByType('income'),
          categoryQueryService.listOptionsByType('expense'),
          recurringRuleRepository.list(),
          accountRepository.list(),
          categoryRepository.list(),
        ])

      return {
        accountOptions,
        incomeCategoryOptions,
        expenseCategoryOptions,
        incomeRecurringTransactionOptions: buildRecurringTransactionOptions({
          recurringRules,
          accounts,
          categories,
          type: 'income',
        }),
        expenseRecurringTransactionOptions: buildRecurringTransactionOptions({
          recurringRules,
          accounts,
          categories,
          type: 'expense',
        }),
      }
    },
  }
}

export const transactionService = createTransactionService()

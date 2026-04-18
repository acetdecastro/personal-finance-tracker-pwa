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
  TransactionCursorDto,
  TransactionFiltersDto,
  TransactionFormOptionsDto,
  TransactionPageDto,
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
    const accountMap = new Map(
      input.accounts.map((account) => [account.id, account]),
    )
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
      .filter(
        (option): option is RecurringTransactionOptionDto => option !== null,
      )
      .sort(
        (left, right) =>
          new Date(left.nextOccurrenceDate).getTime() -
          new Date(right.nextOccurrenceDate).getTime(),
      )
  }

  function filterTransactions(
    transactions: Transaction[],
    filters?: TransactionFiltersDto,
  ) {
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

        if (
          filters.categoryId &&
          transaction.categoryId !== filters.categoryId
        ) {
          return false
        }

        return true
      })
  }

  function sortTransactionsNewestFirst(transactions: Transaction[]) {
    return [...transactions].sort((left, right) => {
      const dateDiff =
        new Date(right.transactionDate).getTime() -
        new Date(left.transactionDate).getTime()

      if (dateDiff !== 0) {
        return dateDiff
      }

      return right.id.localeCompare(left.id)
    })
  }

  function isAfterCursor(
    transaction: Transaction,
    cursor: TransactionCursorDto,
  ) {
    if (transaction.transactionDate < cursor.transactionDate) {
      return true
    }

    return (
      transaction.transactionDate === cursor.transactionDate &&
      transaction.id < cursor.id
    )
  }

  return {
    async list(filters?: TransactionFiltersDto): Promise<Transaction[]> {
      const transactions = sortTransactionsNewestFirst(
        await transactionRepository.list(),
      )

      return filterTransactions(transactions, filters)
    },

    async listPage(input: {
      filters?: TransactionFiltersDto
      cursor?: TransactionCursorDto | null
      limit?: number
    }): Promise<TransactionPageDto> {
      const limit = input.limit ?? 20
      const transactions = filterTransactions(
        sortTransactionsNewestFirst(await transactionRepository.list()),
        input.filters,
      )
      const cursorFilteredTransactions = input.cursor
        ? transactions.filter((transaction) =>
            isAfterCursor(transaction, input.cursor as TransactionCursorDto),
          )
        : transactions
      const pageItems = cursorFilteredTransactions.slice(0, limit)
      const hasNextPage = cursorFilteredTransactions.length > limit
      const lastItem = pageItems.at(-1)

      return {
        items: pageItems,
        nextCursor:
          hasNextPage && lastItem
            ? {
                transactionDate: lastItem.transactionDate,
                id: lastItem.id,
              }
            : null,
      }
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
        transferCategory,
        recurringRules,
        accounts,
        categories,
      ] = await Promise.all([
        accountQueryService.listActiveAccountOptions(),
        categoryQueryService.listOptionsByType('income'),
        categoryQueryService.listOptionsByType('expense'),
        categoryQueryService.getTransferCategory(),
        recurringRuleRepository.list(),
        accountRepository.list(),
        categoryRepository.list(),
      ])

      return {
        accountOptions,
        incomeCategoryOptions,
        expenseCategoryOptions,
        transferCategoryOption: transferCategory
          ? {
              value: transferCategory.id,
              label: transferCategory.name,
              type: transferCategory.type,
              isSystem: transferCategory.isSystem,
            }
          : null,
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

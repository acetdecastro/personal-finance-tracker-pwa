import type { FinanceTrackerDatabase } from '#/db/dexie'
import { db } from '#/db/dexie'
import {
  createEntityId,
  createTimestamps,
  touchUpdatedAt,
} from '#/lib/utils/entity'
import type { Transaction } from '#/types/domain'
import type {
  TransactionCursorDto,
  TransactionFiltersDto,
  TransactionPageDto,
} from '#/types/dto'
import {
  createTransactionInputSchema,
  transactionListSchema,
  transactionSchema,
  updateTransactionInputSchema,
} from '../schemas/transaction.schemas'
import type {
  CreateTransactionInput,
  UpdateTransactionInput,
} from '../schemas/transaction.schemas'

export function createTransactionRepository(
  database: FinanceTrackerDatabase = db,
) {
  function matchesFilters(
    transaction: Transaction,
    filters?: TransactionFiltersDto,
  ) {
    if (!filters) {
      return true
    }

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
  }

  return {
    async list(): Promise<Transaction[]> {
      return transactionListSchema.parse(
        await database.transactions
          .orderBy('transactionDate')
          .reverse()
          .toArray(),
      )
    },

    async getById(id: string): Promise<Transaction | undefined> {
      const transaction = await database.transactions.get(id)
      return transaction ? transactionSchema.parse(transaction) : undefined
    },

    async listPage(input: {
      filters?: TransactionFiltersDto
      cursor?: TransactionCursorDto | null
      limit?: number
    }): Promise<TransactionPageDto> {
      const limit = input.limit ?? 10
      const collection = input.cursor
        ? database.transactions
            .where('[transactionDate+id]')
            .below([input.cursor.transactionDate, input.cursor.id])
            .reverse()
        : database.transactions.orderBy('[transactionDate+id]').reverse()
      const items = transactionListSchema.parse(
        await collection
          .filter((transaction) =>
            matchesFilters(transaction, input.filters),
          )
          .limit(limit + 1)
          .toArray(),
      )
      const pageItems = items.slice(0, limit)
      const lastItem = pageItems.at(-1)

      return {
        items: pageItems,
        nextCursor:
          items.length > limit && lastItem
            ? {
                transactionDate: lastItem.transactionDate,
                id: lastItem.id,
              }
            : null,
      }
    },

    async create(input: CreateTransactionInput): Promise<Transaction> {
      const values = createTransactionInputSchema.parse(input)
      const transaction = transactionSchema.parse({
        id: createEntityId(),
        ...values,
        ...createTimestamps(),
      })

      await database.transactions.add(transaction)

      return transaction
    },

    async update(
      id: string,
      changes: UpdateTransactionInput,
    ): Promise<Transaction> {
      const existing = await this.getById(id)

      if (!existing) {
        throw new Error(`Transaction not found: ${id}`)
      }

      const nextTransaction = transactionSchema.parse({
        ...existing,
        ...updateTransactionInputSchema.parse(changes),
        ...touchUpdatedAt(),
      })

      await database.transactions.put(nextTransaction)

      return nextTransaction
    },

    async remove(id: string): Promise<void> {
      await database.transactions.delete(id)
    },

    async put(transaction: Transaction): Promise<Transaction> {
      const validated = transactionSchema.parse(transaction)
      await database.transactions.put(validated)
      return validated
    },
  }
}

export const transactionRepository = createTransactionRepository()

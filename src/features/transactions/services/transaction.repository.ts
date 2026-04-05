import type { FinanceTrackerDatabase } from '#/db/dexie'
import { db } from '#/db/dexie'
import {
  createEntityId,
  createTimestamps,
  touchUpdatedAt,
} from '#/lib/utils/entity'
import type { Transaction } from '#/types/domain'
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

import type { FinanceTrackerDatabase } from '#/db/dexie'
import { db } from '#/db/dexie'
import {
  createEntityId,
  createTimestamps,
  touchUpdatedAt,
} from '#/lib/utils/entity'
import type { Account } from '#/types/domain'
import {
  accountListSchema,
  accountSchema,
  createAccountInputSchema,
  updateAccountInputSchema,
} from '../schemas/account.schemas'
import type {
  CreateAccountInput,
  UpdateAccountInput,
} from '../schemas/account.schemas'

export function createAccountRepository(database: FinanceTrackerDatabase = db) {
  return {
    async list(): Promise<Account[]> {
      return accountListSchema.parse(
        await database.accounts.orderBy('createdAt').toArray(),
      )
    },

    async getById(id: string): Promise<Account | undefined> {
      const account = await database.accounts.get(id)
      return account ? accountSchema.parse(account) : undefined
    },

    async create(input: CreateAccountInput): Promise<Account> {
      const values = createAccountInputSchema.parse(input)
      const account = accountSchema.parse({
        id: createEntityId(),
        ...values,
        ...createTimestamps(),
      })

      await database.accounts.add(account)

      return account
    },

    async update(id: string, changes: UpdateAccountInput): Promise<Account> {
      const existing = await this.getById(id)

      if (!existing) {
        throw new Error(`Account not found: ${id}`)
      }

      const nextAccount = accountSchema.parse({
        ...existing,
        ...updateAccountInputSchema.parse(changes),
        ...touchUpdatedAt(),
      })

      await database.accounts.put(nextAccount)

      return nextAccount
    },

    async remove(id: string): Promise<void> {
      await database.accounts.delete(id)
    },

    async put(account: Account): Promise<Account> {
      const validated = accountSchema.parse(account)
      await database.accounts.put(validated)
      return validated
    },
  }
}

export const accountRepository = createAccountRepository()

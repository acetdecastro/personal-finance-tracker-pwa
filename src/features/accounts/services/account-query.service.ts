import type { FinanceTrackerDatabase } from '#/db/dexie'
import { db } from '#/db/dexie'
import type { AccountOptionDto } from '#/types/dto'
import { createAccountRepository } from './account.repository'

function toAccountOption(account: {
  id: string
  name: string
  type: AccountOptionDto['type']
  isArchived: boolean
}): AccountOptionDto {
  return {
    value: account.id,
    label: account.name,
    type: account.type,
    isArchived: account.isArchived,
  }
}

export function createAccountQueryService(
  database: FinanceTrackerDatabase = db,
) {
  const accountRepository = createAccountRepository(database)

  return {
    async listActiveAccounts() {
      const accounts = await accountRepository.list()
      return accounts.filter((account) => !account.isArchived)
    },

    async listActiveAccountOptions(): Promise<AccountOptionDto[]> {
      const accounts = await this.listActiveAccounts()

      return [...accounts]
        .sort((left, right) => left.name.localeCompare(right.name))
        .map(toAccountOption)
    },
  }
}

export const accountQueryService = createAccountQueryService()

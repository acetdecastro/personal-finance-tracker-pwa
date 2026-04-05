import type { FinanceTrackerDatabase } from '#/db/dexie'
import { db } from '#/db/dexie'
import type { AccountUsageDto } from '#/types/dto'
import { createRecurringRuleRepository } from '#/features/recurring/services/recurring-rule.repository'
import { createTransactionRepository } from '#/features/transactions/services/transaction.repository'
import { createAccountRepository } from './account.repository'

export function createAccountManagementService(
  database: FinanceTrackerDatabase = db,
) {
  const accountRepository = createAccountRepository(database)
  const transactionRepository = createTransactionRepository(database)
  const recurringRuleRepository = createRecurringRuleRepository(database)

  async function listUsage(): Promise<AccountUsageDto[]> {
    const [accounts, transactions, recurringRules] = await Promise.all([
      accountRepository.list(),
      transactionRepository.list(),
      recurringRuleRepository.list(),
    ])

    const transactionReferences = new Map<string, Set<string>>()
    const recurringRuleCounts = new Map<string, number>()

    for (const transaction of transactions) {
      const referencedAccountIds = [
        transaction.accountId,
        transaction.fromAccountId,
        transaction.toAccountId,
      ].filter((accountId): accountId is string => Boolean(accountId))

      for (const accountId of new Set(referencedAccountIds)) {
        const accountTransactions =
          transactionReferences.get(accountId) ?? new Set<string>()
        accountTransactions.add(transaction.id)
        transactionReferences.set(accountId, accountTransactions)
      }
    }

    for (const recurringRule of recurringRules) {
      recurringRuleCounts.set(
        recurringRule.accountId,
        (recurringRuleCounts.get(recurringRule.accountId) ?? 0) + 1,
      )
    }

    return accounts.map((account) => {
      const transactionCount = transactionReferences.get(account.id)?.size ?? 0
      const recurringRuleCount = recurringRuleCounts.get(account.id) ?? 0
      const totalReferences = transactionCount + recurringRuleCount

      return {
        accountId: account.id,
        transactionCount,
        recurringRuleCount,
        totalReferences,
        canDelete: totalReferences === 0,
      }
    })
  }

  return {
    listUsage,

    async getUsage(accountId: string): Promise<AccountUsageDto | undefined> {
      const usage = await listUsage()
      return usage.find((item) => item.accountId === accountId)
    },

    async archive(accountId: string) {
      return accountRepository.update(accountId, { isArchived: true })
    },

    async restore(accountId: string) {
      return accountRepository.update(accountId, { isArchived: false })
    },

    async remove(accountId: string) {
      const usage = await this.getUsage(accountId)

      if (!usage) {
        throw new Error(`Account not found: ${accountId}`)
      }

      if (!usage.canDelete) {
        throw new Error(
          'This account has linked transactions or recurring transactions and can only be archived.',
        )
      }

      await accountRepository.remove(accountId)
    },
  }
}

export const accountManagementService = createAccountManagementService()

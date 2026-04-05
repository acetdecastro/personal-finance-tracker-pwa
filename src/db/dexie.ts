import Dexie from 'dexie'
import type { EntityTable } from 'dexie'
import type {
  Account,
  Budget,
  Category,
  Goal,
  RecurringRule,
  Transaction,
  User,
  UserSettings,
} from '#/types/domain'

export const APP_DB_NAME = 'personal-finance-tracker-pwa'
export const APP_SCHEMA_VERSION = 5

export class FinanceTrackerDatabase extends Dexie {
  accounts!: EntityTable<Account, 'id'>
  categories!: EntityTable<Category, 'id'>
  transactions!: EntityTable<Transaction, 'id'>
  recurringRules!: EntityTable<RecurringRule, 'id'>
  budgets!: EntityTable<Budget, 'id'>
  goals!: EntityTable<Goal, 'id'>
  userSettings!: EntityTable<UserSettings, 'id'>
  users!: EntityTable<User, 'id'>

  constructor(name = APP_DB_NAME) {
    super(name)

    this.version(1).stores({
      accounts: 'id, name, type, isArchived, createdAt, updatedAt',
      categories: 'id, name, type, isSystem, createdAt, updatedAt',
      transactions:
        'id, type, categoryId, accountId, transactionDate, recurringRuleId, createdAt, updatedAt',
      recurringRules:
        'id, type, categoryId, accountId, cadence, nextOccurrenceDate, isActive, createdAt, updatedAt',
      budgets: 'id, categoryId, periodType, createdAt, updatedAt',
      goals: 'id, createdAt, updatedAt',
      userSettings: 'id, createdAt, updatedAt',
    })

    this.version(2)
      .stores({
        accounts: 'id, name, type, isArchived, createdAt, updatedAt',
        categories: 'id, name, type, isSystem, createdAt, updatedAt',
        transactions:
          'id, type, categoryId, accountId, transactionDate, recurringRuleId, createdAt, updatedAt',
        recurringRules:
          'id, type, categoryId, accountId, cadence, nextOccurrenceDate, isActive, createdAt, updatedAt',
        budgets: 'id, categoryId, periodType, createdAt, updatedAt',
        goals: 'id, createdAt, updatedAt',
        userSettings: 'id, createdAt, updatedAt',
      })
      .upgrade(async (transaction) => {
        const settings = (await transaction
          .table('userSettings')
          .get('primary')) as
          | ({ minimumBuffer?: number } & Record<string, unknown>)
          | undefined
        const legacyMinimumBuffer = settings?.minimumBuffer ?? 0
        const accounts = (await transaction
          .table('accounts')
          .toArray()) as Array<Record<string, unknown>>

        let hasAssignedLegacyBuffer = false

        for (const account of accounts) {
          await transaction.table('accounts').put({
            ...account,
            safetyBuffer:
              typeof account.safetyBuffer === 'number'
                ? account.safetyBuffer
                : hasAssignedLegacyBuffer
                  ? 0
                  : legacyMinimumBuffer,
          })

          if (!hasAssignedLegacyBuffer) {
            hasAssignedLegacyBuffer = true
          }
        }

        if (settings && 'minimumBuffer' in settings) {
          const { minimumBuffer: _minimumBuffer, ...nextSettings } = settings
          await transaction.table('userSettings').put(nextSettings)
        }
      })

    this.version(3)
      .stores({
        accounts: 'id, name, type, isArchived, createdAt, updatedAt',
        categories: 'id, name, type, isSystem, createdAt, updatedAt',
        transactions:
          'id, type, categoryId, accountId, fromAccountId, toAccountId, goalId, transactionDate, recurringRuleId, createdAt, updatedAt',
        recurringRules:
          'id, type, categoryId, accountId, cadence, nextOccurrenceDate, isActive, createdAt, updatedAt',
        budgets: 'id, categoryId, periodType, createdAt, updatedAt',
        goals: 'id, createdAt, updatedAt',
        userSettings: 'id, createdAt, updatedAt',
      })
      .upgrade(async (transaction) => {
        const transactions = (await transaction
          .table('transactions')
          .toArray()) as Array<Record<string, unknown>>

        for (const item of transactions) {
          await transaction.table('transactions').put({
            ...item,
            goalId: 'goalId' in item ? (item.goalId ?? null) : null,
          })
        }
      })

    this.version(4)
      .stores({
        accounts: 'id, name, type, isArchived, createdAt, updatedAt',
        categories: 'id, name, type, isSystem, createdAt, updatedAt',
        transactions:
          'id, type, categoryId, accountId, fromAccountId, toAccountId, goalId, goalTransferDirection, transactionDate, recurringRuleId, createdAt, updatedAt',
        recurringRules:
          'id, type, categoryId, accountId, cadence, nextOccurrenceDate, isActive, createdAt, updatedAt',
        budgets: 'id, categoryId, periodType, createdAt, updatedAt',
        goals: 'id, createdAt, updatedAt',
        userSettings: 'id, createdAt, updatedAt',
      })
      .upgrade(async (transaction) => {
        const transactions = (await transaction
          .table('transactions')
          .toArray()) as Array<Record<string, unknown>>

        for (const item of transactions) {
          const goalId = 'goalId' in item ? (item.goalId ?? null) : null
          const goalTransferDirection =
            'goalTransferDirection' in item
              ? (item.goalTransferDirection ?? null)
              : goalId
                ? item.toAccountId
                  ? 'out'
                  : 'in'
                : null

          await transaction.table('transactions').put({
            ...item,
            goalId,
            goalTransferDirection,
          })
        }
      })

    this.version(5).stores({
      accounts: 'id, name, type, isArchived, createdAt, updatedAt',
      categories: 'id, name, type, isSystem, createdAt, updatedAt',
      transactions:
        'id, type, categoryId, accountId, fromAccountId, toAccountId, goalId, goalTransferDirection, transactionDate, recurringRuleId, createdAt, updatedAt',
      recurringRules:
        'id, type, categoryId, accountId, cadence, nextOccurrenceDate, isActive, createdAt, updatedAt',
      budgets: 'id, categoryId, periodType, createdAt, updatedAt',
      goals: 'id, createdAt, updatedAt',
      userSettings: 'id, createdAt, updatedAt',
      users: 'id, name, createdAt, updatedAt',
    })
  }
}

export function createFinanceTrackerDatabase(name?: string) {
  return new FinanceTrackerDatabase(name)
}

export const db = createFinanceTrackerDatabase()

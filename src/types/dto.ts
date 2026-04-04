import type {
  Account,
  Budget,
  Category,
  Goal,
  RecurringRule,
  Transaction,
  UserSettings,
} from './domain'

export interface ExportMetadata {
  appVersion: string
  exportedAt: string
  schemaVersion: number
}

export interface ExportPayload {
  metadata: ExportMetadata
  accounts: Account[]
  categories: Category[]
  transactions: Transaction[]
  recurringRules: RecurringRule[]
  budgets: Budget[]
  goals: Goal[]
  userSettings: UserSettings[]
}

export type ImportPayload = ExportPayload

export interface SeedRunResult {
  createdCategories: number
  createdUserSettings: number
}

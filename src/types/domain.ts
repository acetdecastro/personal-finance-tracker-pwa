export type EntityId = string

export type CurrencyCode = 'PHP'

export type ThemePreference = 'light' | 'dark' | 'system'

export type AccountType = 'cash' | 'bank' | 'ewallet' | 'other'

export type CategoryType = 'income' | 'expense'

export type TransactionType = 'income' | 'expense' | 'transfer'

export type RecurringCadence =
  | 'weekly'
  | 'semi-monthly'
  | 'monthly'
  | 'custom'

export type SupportedRecurringCadence = Exclude<RecurringCadence, 'custom'>

export interface TimestampedEntity {
  createdAt: string
  updatedAt: string
}

export interface Account extends TimestampedEntity {
  id: EntityId
  name: string
  type: AccountType
  initialBalance: number
  safetyBuffer: number
  isArchived: boolean
}

export interface Category extends TimestampedEntity {
  id: EntityId
  name: string
  type: CategoryType
  isSystem: boolean
}

export interface Transaction extends TimestampedEntity {
  id: EntityId
  type: TransactionType
  amount: number
  categoryId: EntityId | null
  accountId: EntityId | null
  fromAccountId: EntityId | null
  toAccountId: EntityId | null
  note: string | null
  transactionDate: string
  recurringRuleId: EntityId | null
}

export interface RecurringRule extends TimestampedEntity {
  id: EntityId
  name: string
  type: CategoryType
  amount: number
  categoryId: EntityId
  accountId: EntityId
  cadence: RecurringCadence
  semiMonthlyDays: number[] | null
  monthlyDay: number | null
  weeklyInterval: number | null
  nextOccurrenceDate: string
  isActive: boolean
}

export interface Budget extends TimestampedEntity {
  id: EntityId
  categoryId: EntityId
  amount: number
  periodType: 'monthly'
}

export interface Goal extends TimestampedEntity {
  id: EntityId
  name: string
  targetAmount: number
  currentAmount: number | null
  targetDate: string | null
}

export interface UserSettings extends TimestampedEntity {
  id: 'primary'
  currency: CurrencyCode
  theme: ThemePreference
  hasCompletedOnboarding: boolean
}

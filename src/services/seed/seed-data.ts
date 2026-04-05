import type { Category, UserSettings } from '#/types/domain'

export const DEFAULT_EXPENSE_CATEGORIES = [
  { id: 'category-expense-food', name: 'Food', type: 'expense' },
  { id: 'category-expense-transport', name: 'Transport', type: 'expense' },
  { id: 'category-expense-rent', name: 'Rent', type: 'expense' },
  { id: 'category-expense-utilities', name: 'Utilities', type: 'expense' },
  {
    id: 'category-expense-subscriptions',
    name: 'Subscriptions',
    type: 'expense',
  },
  { id: 'category-expense-health', name: 'Health', type: 'expense' },
  { id: 'category-expense-shopping', name: 'Shopping', type: 'expense' },
  {
    id: 'category-expense-miscellaneous',
    name: 'Miscellaneous',
    type: 'expense',
  },
] as const satisfies ReadonlyArray<Pick<Category, 'id' | 'name' | 'type'>>

export const DEFAULT_INCOME_CATEGORIES = [
  { id: 'category-income-salary', name: 'Salary', type: 'income' },
  { id: 'category-income-bonus', name: 'Bonus', type: 'income' },
  {
    id: 'category-income-other-income',
    name: 'Other Income',
    type: 'income',
  },
] as const satisfies ReadonlyArray<Pick<Category, 'id' | 'name' | 'type'>>

export const DEFAULT_TRANSFER_CATEGORIES = [
  { id: 'category-transfer-transfer', name: 'Transfer', type: 'transfer' },
] as const satisfies ReadonlyArray<Pick<Category, 'id' | 'name' | 'type'>>

export const DEFAULT_CATEGORY_SEED = [
  ...DEFAULT_EXPENSE_CATEGORIES,
  ...DEFAULT_INCOME_CATEGORIES,
  ...DEFAULT_TRANSFER_CATEGORIES,
]

export const DEFAULT_USER_SETTINGS: Omit<
  UserSettings,
  'createdAt' | 'updatedAt'
> = {
  id: 'primary',
  currency: 'PHP',
  theme: 'system',
  hasCompletedOnboarding: false,
}

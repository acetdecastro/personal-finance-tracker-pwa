import type {
  Account,
  Budget,
  Category,
  Goal,
  RecurringRule,
  ThemePreference,
  Transaction,
  User,
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

export interface SelectOption {
  value: string
  label: string
}

export interface AccountOptionDto extends SelectOption {
  type: Account['type']
  isArchived: boolean
}

export interface AccountUsageDto {
  accountId: string
  transactionCount: number
  recurringRuleCount: number
  totalReferences: number
  canDelete: boolean
}

export interface CategoryOptionDto extends SelectOption {
  type: Category['type']
  isSystem: boolean
}

export interface OnboardingRecurringRuleDraftDto {
  name: string
  amount: number
  cadence: RecurringRule['cadence']
  semiMonthlyDays: number[] | null
  monthlyDay: number | null
  weeklyInterval: number | null
  nextOccurrenceDate: string
}

export interface CompleteOnboardingInputDto {
  primaryAccount: {
    name: string
    type: Account['type']
    initialBalance: number
    safetyBuffer: number
  }
  salary: OnboardingRecurringRuleDraftDto
  recurringExpenses?: Array<
    OnboardingRecurringRuleDraftDto & {
      categoryId: string
    }
  >
}

export interface CompleteOnboardingResultDto {
  primaryAccount: Account
  salaryRule: RecurringRule
  recurringExpenseRules: RecurringRule[]
  userSettings: UserSettings
  user: User
}

export interface OnboardingBootstrapDto {
  expenseCategoryOptions: CategoryOptionDto[]
  salaryCategoryId: string | null
  settings: SettingsScreenDto
}

export interface TransactionFiltersDto {
  type?: Transaction['type'] | null
  accountId?: string | null
  categoryId?: string | null
}

export interface RecurringTransactionOptionDto extends SelectOption {
  type: RecurringRule['type']
  categoryId: string
  categoryLabel: string
  accountId: string
  accountLabel: string
  expectedAmount: number
  nextOccurrenceDate: string
}

export interface TransactionFormOptionsDto {
  accountOptions: AccountOptionDto[]
  incomeCategoryOptions: CategoryOptionDto[]
  expenseCategoryOptions: CategoryOptionDto[]
  transferCategoryOption: CategoryOptionDto | null
  incomeRecurringTransactionOptions: RecurringTransactionOptionDto[]
  expenseRecurringTransactionOptions: RecurringTransactionOptionDto[]
}

export interface SettingsScreenDto {
  currency: UserSettings['currency']
  theme: ThemePreference
  hasCompletedOnboarding: boolean
}

export interface RecurringOccurrenceDto {
  id: string
  recurringRuleId: string
  name: string
  type: RecurringRule['type']
  amount: number
  categoryId: string
  accountId: string
  date: string
}

export interface ForecastSummaryDto {
  currentBalance: number
  safeToSpend: number
  nextSalaryDate: string | null
  projectedBalance7d: number
  projectedBalance14d: number
  projectedBalance30d: number
  lowestProjectedBalance30d: number
  totalUpcomingFixedExpensesBeforeNextSalary: number
  incomeOccurrences: RecurringOccurrenceDto[]
  expenseOccurrences: RecurringOccurrenceDto[]
}

export interface BudgetSnapshotDto {
  budgetId: string
  categoryId: string
  categoryName: string
  budgetAmount: number
  spentAmount: number
  remainingAmount: number
  percentUsed: number
  isOverBudget: boolean
}

export interface GoalSnapshotDto {
  id: string
  name: string
  targetAmount: number
  currentAmount: number
  remainingAmount: number
  percentComplete: number
  targetDate: string | null
}

export interface GoalUsageDto {
  goalId: string
  currentAmount: number
  linkedTransferCount: number
  canDelete: boolean
  deleteBlockedReason: string | null
  deleteNotice: string | null
}

export interface DashboardRecentTransactionDto {
  id: string
  type: Transaction['type']
  amount: number
  categoryName: string | null
  accountName: string | null
  note: string | null
  transactionDate: string
}

export interface UpcomingBillDto {
  id: string
  name: string
  amount: number
  date: string
}

export interface DashboardData {
  currentBalance: number
  safeToSpend: number
  nextSalaryDate: string | null
  projectedBalance7d: number
  projectedBalance14d: number
  projectedBalance30d: number
  lowestProjectedBalance30d: number
  upcomingBills: UpcomingBillDto[]
  budgets: BudgetSnapshotDto[]
  goals: GoalSnapshotDto[]
  recentTransactions: DashboardRecentTransactionDto[]
}

export interface BudgetPageDataDto {
  budgetSnapshots: BudgetSnapshotDto[]
  expenseCategoryOptions: CategoryOptionDto[]
  goals: GoalSnapshotDto[]
}

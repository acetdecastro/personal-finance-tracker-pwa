import { isSameMonth, parseISO } from 'date-fns'
import type { Budget, Category, Transaction } from '#/types/domain'
import type { BudgetSnapshotDto } from '#/types/dto'

interface CalculateBudgetSnapshotsInput {
  budgets: Budget[]
  categories: Category[]
  transactions: Transaction[]
  referenceDate?: Date | string
}

function toDate(value: Date | string | undefined): Date {
  if (!value) {
    return new Date()
  }

  return value instanceof Date ? value : parseISO(value)
}

export function calculateBudgetSnapshots({
  budgets,
  categories,
  transactions,
  referenceDate,
}: CalculateBudgetSnapshotsInput): BudgetSnapshotDto[] {
  const monthReference = toDate(referenceDate)
  const categoryMap = new Map(categories.map((category) => [category.id, category]))

  return budgets.map((budget) => {
    const spentAmount = transactions
      .filter(
        (transaction) =>
          transaction.type === 'expense' &&
          transaction.categoryId === budget.categoryId &&
          isSameMonth(parseISO(transaction.transactionDate), monthReference),
      )
      .reduce((sum, transaction) => sum + transaction.amount, 0)

    const remainingAmount = budget.amount - spentAmount
    const percentUsed =
      budget.amount > 0 ? Math.round((spentAmount / budget.amount) * 100) : 0

    return {
      budgetId: budget.id,
      categoryId: budget.categoryId,
      categoryName: categoryMap.get(budget.categoryId)?.name ?? 'Unknown',
      budgetAmount: budget.amount,
      spentAmount,
      remainingAmount,
      percentUsed,
      isOverBudget: spentAmount > budget.amount,
    }
  })
}

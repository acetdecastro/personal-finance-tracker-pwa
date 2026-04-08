import type { BudgetSnapshotDto } from '#/types/dto'
import { formatPhpCurrency } from '#/lib/format/number.utils'
import { cn } from '#/lib/utils/cn'

interface BudgetListProps {
  budgets: BudgetSnapshotDto[]
  onSelect?: (budgetId: string) => void
}

export function BudgetList({ budgets, onSelect }: BudgetListProps) {
  return (
    <div className="space-y-4">
      {budgets.map((budget) => {
        return (
          <button
            type="button"
            key={budget.budgetId}
            onClick={() => onSelect?.(budget.budgetId)}
            className="bg-card block w-full rounded-2xl p-4 shadow outline-none"
          >
            <div className="mb-2 flex items-center justify-between">
              <p className="text-foreground text-sm font-semibold">
                {budget.categoryName}
              </p>
              <p
                className={cn(
                  'text-xs font-bold',
                  budget.percentUsed >= 70 || budget.isOverBudget
                    ? 'text-destructive'
                    : budget.percentUsed >= 50
                      ? 'text-warning'
                      : 'text-foreground',
                )}
              >
                {budget.isOverBudget ? 'Over budget' : `${budget.percentUsed}%`}
              </p>
            </div>
            {/* Progress Bar */}
            <div className="bg-muted mb-1.5 h-1.5 w-full overflow-hidden rounded-full">
              <div
                className={cn(
                  'h-full rounded-full transition-all',
                  budget.percentUsed >= 70 || budget.isOverBudget
                    ? 'bg-destructive'
                    : budget.percentUsed >= 50
                      ? 'bg-warning'
                      : 'bg-accent',
                )}
                style={{
                  width: `${Math.max(Math.min(budget.percentUsed, 100), 0)}%`,
                }}
              />
            </div>
            <div className="text-muted-foreground/70 flex justify-between text-[10px]">
              <span>{formatPhpCurrency(budget.spentAmount)} spent</span>
              <span>{formatPhpCurrency(budget.budgetAmount)} limit</span>
            </div>
          </button>
        )
      })}
    </div>
  )
}

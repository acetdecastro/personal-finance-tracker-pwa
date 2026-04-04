import type { BudgetSnapshotDto } from '#/types/dto'
import { formatPhpCurrency } from '#/lib/format/number.utils'

interface BudgetListProps {
  budgets: BudgetSnapshotDto[]
}

export function BudgetList({ budgets }: BudgetListProps) {
  return (
    <div className="space-y-3">
      {budgets.map((budget) => {
        return (
          <div key={budget.budgetId} className="rounded-2xl bg-card p-4">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-sm font-semibold text-foreground">
                {budget.categoryName}
              </p>
              <p className={`text-xs font-bold ${budget.isOverBudget ? 'text-destructive' : 'text-muted-foreground/70'}`}>
                {budget.isOverBudget ? 'Over budget' : `${budget.percentUsed}%`}
              </p>
            </div>
            <div className="mb-1.5 h-1.5 w-full overflow-hidden rounded-full bg-muted">
              <div
                className={`h-full rounded-full transition-all ${budget.isOverBudget ? 'bg-destructive' : 'bg-primary'}`}
                style={{ width: `${Math.max(Math.min(budget.percentUsed, 100), 0)}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-muted-foreground/70">
              <span>{formatPhpCurrency(budget.spentAmount)} spent</span>
              <span>{formatPhpCurrency(budget.budgetAmount)} limit</span>
            </div>
          </div>
        )
      })}
    </div>
  )
}

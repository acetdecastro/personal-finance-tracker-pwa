import type { Budget, Category } from '#/types/domain'
import { formatPhpCurrency } from '#/lib/format/number.utils'

interface BudgetListProps {
  budgets: Budget[]
  categories: Category[]
  /** Spent amounts by categoryId — provided by Codex's budget engine when ready */
  spentByCategoryId?: Record<string, number>
}

export function BudgetList({ budgets, categories, spentByCategoryId = {} }: BudgetListProps) {
  const categoryMap = new Map(categories.map((c) => [c.id, c]))

  return (
    <div className="space-y-3">
      {budgets.map((budget) => {
        const category = categoryMap.get(budget.categoryId)
        const spent = spentByCategoryId[budget.categoryId] ?? 0
        const percent = Math.min(Math.round((spent / budget.amount) * 100), 100)
        const isOver = spent > budget.amount

        return (
          <div key={budget.id} className="rounded-2xl bg-white p-4 dark:bg-zinc-900">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                {category?.name ?? 'Unknown'}
              </p>
              <p className={`text-xs font-bold ${isOver ? 'text-red-600 dark:text-red-400' : 'text-slate-400 dark:text-slate-500'}`}>
                {isOver ? 'Over budget' : `${percent}%`}
              </p>
            </div>
            <div className="mb-1.5 h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-zinc-800">
              <div
                className={`h-full rounded-full transition-all ${isOver ? 'bg-red-500' : 'bg-emerald-600 dark:bg-emerald-500'}`}
                style={{ width: `${percent}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-slate-400 dark:text-slate-500">
              <span>{formatPhpCurrency(spent)} spent</span>
              <span>{formatPhpCurrency(budget.amount)} limit</span>
            </div>
          </div>
        )
      })}
    </div>
  )
}

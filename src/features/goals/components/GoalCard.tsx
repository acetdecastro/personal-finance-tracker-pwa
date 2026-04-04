import { Target } from 'lucide-react'
import type { Goal } from '#/types/domain'
import { formatPhpCurrency } from '#/lib/format/number.utils'
import { formatDisplayDate } from '#/lib/dates'

interface GoalCardProps {
  goal: Goal
}

export function GoalCard({ goal }: GoalCardProps) {
  const current = goal.currentAmount ?? 0
  const percent = Math.min(Math.round((current / goal.targetAmount) * 100), 100)
  const remaining = Math.max(goal.targetAmount - current, 0)

  return (
    <div className="rounded-2xl bg-white p-5 dark:bg-zinc-900">
      <div className="mb-3 flex items-center gap-3">
        <div className="flex size-10 items-center justify-center rounded-xl bg-teal-50 dark:bg-teal-950/30">
          <Target className="size-5 text-teal-600 dark:text-teal-400" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="truncate text-sm font-bold text-slate-900 dark:text-slate-100">
            {goal.name}
          </p>
          {goal.targetDate && (
            <p className="text-xs text-slate-400 dark:text-slate-500">
              Target: {formatDisplayDate(goal.targetDate)}
            </p>
          )}
        </div>
        <p className="text-sm font-bold text-teal-600 dark:text-teal-400">{percent}%</p>
      </div>
      <div className="mb-1.5 h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-zinc-800">
        <div
          className="h-full rounded-full bg-teal-600 dark:bg-teal-500 transition-all"
          style={{ width: `${percent}%` }}
        />
      </div>
      <div className="flex justify-between text-xs text-slate-400 dark:text-slate-500">
        <span>{formatPhpCurrency(current)} saved</span>
        <span>{formatPhpCurrency(remaining)} remaining</span>
      </div>
    </div>
  )
}

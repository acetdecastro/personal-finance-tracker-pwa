import { Target } from 'lucide-react'
import type { GoalSnapshotDto } from '#/types/dto'
import { formatPhpCurrency } from '#/lib/format/number.utils'
import { formatDisplayDate } from '#/lib/dates'

interface GoalCardProps {
  goal: GoalSnapshotDto
}

export function GoalCard({ goal }: GoalCardProps) {
  return (
    <div className="rounded-2xl bg-card p-5">
      <div className="mb-3 flex items-center gap-3">
        <div className="flex size-10 items-center justify-center rounded-xl bg-accent-subtle">
          <Target className="size-5 text-accent" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-bold text-foreground">
            {goal.name}
          </p>
          {goal.targetDate && (
            <p className="text-xs text-muted-foreground/70">
              Target: {formatDisplayDate(goal.targetDate)}
            </p>
          )}
        </div>
        <p className="text-sm font-bold text-accent">
          {goal.percentComplete}%
        </p>
      </div>
      <div className="mb-1.5 h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-accent transition-all"
          style={{ width: `${goal.percentComplete}%` }}
        />
      </div>
      <div className="flex justify-between text-xs text-muted-foreground/70">
        <span>{formatPhpCurrency(goal.currentAmount)} saved</span>
        <span>{formatPhpCurrency(goal.remainingAmount)} remaining</span>
      </div>
    </div>
  )
}

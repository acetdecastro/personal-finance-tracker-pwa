import { Button } from '#/components/common/Button'
import type { GoalSnapshotDto } from '#/types/dto'
import { formatPhpCurrency } from '#/lib/format/number.utils'
import { formatDisplayDate } from '#/lib/dates'
import { cn } from '#/lib/utils/cn'

interface GoalCardProps {
  goal: GoalSnapshotDto
  onSelect?: (goalId: string) => void
  onAddSavings?: (goalId: string) => void
  onTransferOut?: (goalId: string) => void
}

export function GoalCard({
  goal,
  onSelect,
  onAddSavings,
  onTransferOut,
}: GoalCardProps) {
  return (
    <div
      role={onSelect ? 'button' : undefined}
      tabIndex={onSelect ? 0 : undefined}
      onClick={() => onSelect?.(goal.id)}
      onKeyDown={(event) => {
        if (!onSelect) return

        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          onSelect(goal.id)
        }
      }}
      className="bg-card block w-full rounded-2xl p-4 text-left shadow"
    >
      <div className="mb-3 flex items-center gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-foreground truncate text-xs font-bold">
            {goal.name}
          </p>
          {goal.targetDate && (
            <p className="text-muted-foreground/70 text-[10px]">
              Target: {formatDisplayDate(goal.targetDate)}
            </p>
          )}
        </div>
        <div className="text-right">
          <p className="text-foreground text-xs font-bold">
            {goal.percentComplete}%
          </p>
        </div>
      </div>
      <div className="bg-muted mb-1.5 h-1.5 w-full overflow-hidden rounded-full">
        <div
          className="bg-accent h-full rounded-full transition-all"
          style={{ width: `${goal.percentComplete}%` }}
        />
      </div>
      <div className="text-muted-foreground/70 flex justify-between text-[10px]">
        <span>{formatPhpCurrency(goal.currentAmount)} saved</span>
        <div className="flex items-center">
          <span>{formatPhpCurrency(goal.remainingAmount)} remaining</span>
        </div>
      </div>
      <div className="flex justify-end space-x-2">
        {onAddSavings && (
          <Button
            type="button"
            variant="inline-primary"
            className={cn('text-[10px]', goal.currentAmount === 0 && '-mr-2')}
            onClick={(event) => {
              event.stopPropagation()
              onAddSavings(goal.id)
            }}
          >
            Add Savings
          </Button>
        )}
        {onTransferOut && goal.currentAmount > 0 && (
          <Button
            type="button"
            variant="inline-primary"
            className="-mr-2 text-[10px]"
            onClick={(event) => {
              event.stopPropagation()
              onTransferOut(goal.id)
            }}
          >
            Transfer Out
          </Button>
        )}
      </div>
    </div>
  )
}

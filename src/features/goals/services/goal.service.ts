import type { Goal } from '#/types/domain'
import type { GoalSnapshotDto } from '#/types/dto'

export function calculateGoalSnapshot(goal: Goal | null | undefined): GoalSnapshotDto | null {
  if (!goal) {
    return null
  }

  const currentAmount = goal.currentAmount ?? 0
  const remainingAmount = Math.max(goal.targetAmount - currentAmount, 0)
  const percentComplete =
    goal.targetAmount > 0
      ? Math.min(Math.round((currentAmount / goal.targetAmount) * 100), 100)
      : 0

  return {
    id: goal.id,
    name: goal.name,
    targetAmount: goal.targetAmount,
    currentAmount,
    remainingAmount,
    percentComplete,
    targetDate: goal.targetDate,
  }
}

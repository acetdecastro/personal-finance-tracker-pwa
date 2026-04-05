import type { Goal, Transaction } from '#/types/domain'
import type { GoalSnapshotDto } from '#/types/dto'

function calculateGoalContributionTotal(
  goalId: string,
  transactions: Transaction[],
) {
  return transactions.reduce((sum, transaction) => {
    if (transaction.type !== 'transfer' || transaction.goalId !== goalId) {
      return sum
    }

    return (
      sum +
      (transaction.goalTransferDirection === 'out'
        ? -transaction.amount
        : transaction.amount)
    )
  }, 0)
}

export function calculateGoalSnapshot(
  goal: Goal | null | undefined,
  transactions: Transaction[] = [],
): GoalSnapshotDto | null {
  if (!goal) {
    return null
  }

  const currentAmount =
    (goal.currentAmount ?? 0) +
    calculateGoalContributionTotal(goal.id, transactions)
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

export function calculateGoalSnapshots(
  goals: Goal[],
  transactions: Transaction[] = [],
): GoalSnapshotDto[] {
  return goals
    .map((goal) => calculateGoalSnapshot(goal, transactions))
    .filter((goal): goal is GoalSnapshotDto => goal !== null)
}

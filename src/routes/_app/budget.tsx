import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { Plus } from 'lucide-react'
import { Button } from '#/components/common/Button'
import { BottomSheet } from '#/components/common/BottomSheet'
import { BudgetList } from '#/features/budgets/components/BudgetList'
import { BudgetForm } from '#/features/budgets/components/BudgetForm'
import { GoalCard } from '#/features/goals/components/GoalCard'
import { GoalForm } from '#/features/goals/components/GoalForm'
import { SectionHeader } from '#/components/common/SectionHeader'
import { EmptyState } from '#/components/common/EmptyState'
import { useBudgetPageData, useCreateBudget } from '#/features/budgets/hooks/use-budgets'
import { useCreateGoal } from '#/features/goals/hooks/use-goals'
import type { CreateBudgetInput } from '#/features/budgets/schemas/budget.schemas'
import type { CreateGoalInput } from '#/features/goals/schemas/goal.schemas'

export const Route = createFileRoute('/_app/budget')({
  component: BudgetRoute,
})

function BudgetRoute() {
  const [showBudgetForm, setShowBudgetForm] = useState(false)
  const [showGoalForm, setShowGoalForm] = useState(false)

  const { data: budgetPageData, isLoading } = useBudgetPageData()

  const createBudget = useCreateBudget()
  const createGoal = useCreateGoal()

  async function handleBudgetSubmit(values: CreateBudgetInput) {
    await createBudget.mutateAsync(values)
    setShowBudgetForm(false)
  }

  async function handleGoalSubmit(values: CreateGoalInput) {
    await createGoal.mutateAsync(values)
    setShowGoalForm(false)
  }

  const budgetSnapshots = budgetPageData?.budgetSnapshots ?? []
  const expenseCategoryOptions = budgetPageData?.expenseCategoryOptions ?? []
  const primaryGoal = budgetPageData?.primaryGoal ?? null

  return (
    <>
      <div className="space-y-6">
        <div className="space-y-3">
          <SectionHeader
            title="Monthly Budgets"
            action={
              <Button
                onClick={() => setShowBudgetForm(true)}
                variant="inline-primary"
              >
                <Plus className="size-3.5" />
                Add
              </Button>
            }
          />
          {isLoading ? (
            <div className="rounded-2xl bg-card p-4 text-sm text-muted-foreground">
              Loading budget snapshots…
            </div>
          ) : budgetSnapshots.length === 0 ? (
            <EmptyState
              title="No budgets yet"
              description="Set a monthly limit for a spending category."
              action={
                <Button
                  onClick={() => setShowBudgetForm(true)}
                  className="px-4 py-2"
                >
                  Set First Budget
                </Button>
              }
            />
          ) : (
            <BudgetList budgets={budgetSnapshots} />
          )}
        </div>

        <div className="space-y-3">
          <SectionHeader
            title="Savings Goal"
            action={
              !primaryGoal ? (
                <Button
                  onClick={() => setShowGoalForm(true)}
                  variant="inline-primary"
                >
                  <Plus className="size-3.5" />
                  Add
                </Button>
              ) : undefined
            }
          />
          {primaryGoal ? (
            <GoalCard goal={primaryGoal} />
          ) : (
            <EmptyState
              title="No savings goal"
              description="Set a goal to track your progress."
              action={
                <Button
                  onClick={() => setShowGoalForm(true)}
                  className="px-4 py-2"
                >
                  Create Goal
                </Button>
              }
            />
          )}
        </div>
      </div>

      {showBudgetForm && (
        <BottomSheet
          title="Set Budget"
          onClose={() => setShowBudgetForm(false)}
        >
          <BudgetForm
            categories={expenseCategoryOptions}
            onSubmit={handleBudgetSubmit}
            onCancel={() => setShowBudgetForm(false)}
          />
        </BottomSheet>
      )}

      {showGoalForm && (
        <BottomSheet title="Create Goal" onClose={() => setShowGoalForm(false)}>
          <GoalForm
            onSubmit={handleGoalSubmit}
            onCancel={() => setShowGoalForm(false)}
          />
        </BottomSheet>
      )}
    </>
  )
}

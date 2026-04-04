import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { Plus, X } from 'lucide-react'
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
              <button
                onClick={() => setShowBudgetForm(true)}
                className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold text-primary transition hover:bg-primary-subtle"
              >
                <Plus className="size-3.5" />
                Add
              </button>
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
                <button
                  onClick={() => setShowBudgetForm(true)}
                  className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
                >
                  Set First Budget
                </button>
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
                <button
                  onClick={() => setShowGoalForm(true)}
                  className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold text-primary transition hover:bg-primary-subtle"
                >
                  <Plus className="size-3.5" />
                  Add
                </button>
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
                <button
                  onClick={() => setShowGoalForm(true)}
                  className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
                >
                  Create Goal
                </button>
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

function BottomSheet({
  title,
  onClose,
  children,
}: {
  title: string
  onClose: () => void
  children: React.ReactNode
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex flex-col justify-end bg-black/40"
      onClick={onClose}
    >
      <div
        className="max-h-[90dvh] overflow-y-auto rounded-t-3xl bg-popover px-5 pb-8 pt-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-base font-bold text-foreground">{title}</h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-muted-foreground hover:text-foreground"
          >
            <X className="size-5" />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}

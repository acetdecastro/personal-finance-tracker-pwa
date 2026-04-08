import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { toast } from 'sonner'
import { Plus } from 'lucide-react'
import { Button } from '#/components/common/Button'
import { BottomSheet } from '#/components/common/BottomSheet'
import { BudgetList } from '#/features/budgets/components/BudgetList'
import { BudgetForm } from '#/features/budgets/components/BudgetForm'
import { GoalCard } from '#/features/goals/components/GoalCard'
import { GoalContributionForm } from '#/features/goals/components/GoalContributionForm'
import { GoalForm } from '#/features/goals/components/GoalForm'
import { SectionHeader } from '#/components/common/SectionHeader'
import { EmptyState } from '#/components/common/EmptyState'
import {
  useBudgetPageData,
  useBudgets,
  useCreateBudget,
  useUpdateBudget,
  useDeleteBudget,
} from '#/features/budgets/hooks/use-budgets'
import {
  useGoals,
  useGoalUsage,
  useCreateGoal,
  useAddGoalSavings,
  useTransferOutGoalFunds,
  useUpdateGoal,
  useDeleteGoal,
} from '#/features/goals/hooks/use-goals'
import { useAccounts } from '#/features/accounts/hooks/use-accounts'
import type { CreateBudgetInput } from '#/features/budgets/schemas/budget.schemas'
import type { CreateGoalInput } from '#/features/goals/schemas/goal.schemas'
import type { Budget, Goal } from '#/types/domain'

export const Route = createFileRoute('/_app/budget')({
  component: BudgetRoute,
})

function BudgetRoute() {
  const [showBudgetForm, setShowBudgetForm] = useState(false)
  const [showGoalForm, setShowGoalForm] = useState(false)
  const [showContributionForm, setShowContributionForm] = useState(false)
  const [showTransferOutForm, setShowTransferOutForm] = useState(false)
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null)
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null)

  const { data: budgetPageData, isLoading } = useBudgetPageData()
  const { data: budgets = [] } = useBudgets()
  const { data: goals = [] } = useGoals()
  const { data: goalUsage = [] } = useGoalUsage()
  const { data: accounts = [] } = useAccounts()

  const createBudget = useCreateBudget()
  const updateBudget = useUpdateBudget()
  const deleteBudget = useDeleteBudget()
  const createGoal = useCreateGoal()
  const addGoalSavings = useAddGoalSavings()
  const transferOutGoalFunds = useTransferOutGoalFunds()
  const updateGoal = useUpdateGoal()
  const deleteGoal = useDeleteGoal()

  async function handleBudgetSubmit(values: CreateBudgetInput) {
    try {
      if (editingBudget) {
        await updateBudget.mutateAsync({
          id: editingBudget.id,
          changes: values,
        })
        toast.success('Budget updated')
      } else {
        await createBudget.mutateAsync(values)
        toast.success('Budget added')
      }
      setEditingBudget(null)
      setShowBudgetForm(false)
    } catch {
      toast.error(
        editingBudget ? 'Failed to update budget' : 'Failed to add budget',
      )
    }
  }

  async function handleGoalSubmit(values: CreateGoalInput) {
    try {
      if (editingGoal) {
        await updateGoal.mutateAsync({
          id: editingGoal.id,
          changes: values,
        })
        toast.success('Goal updated')
      } else {
        await createGoal.mutateAsync(values)
        toast.success('Goal added')
      }
      setEditingGoal(null)
      setShowGoalForm(false)
    } catch (e) {
      console.error(e)
      toast.error(editingGoal ? 'Failed to update goal' : 'Failed to add goal')
    }
  }

  async function handleBudgetDelete() {
    if (!editingBudget) return
    try {
      await deleteBudget.mutateAsync(editingBudget.id)
      toast.success('Budget deleted')
      setEditingBudget(null)
      setShowBudgetForm(false)
    } catch {
      toast.error('Failed to delete budget')
    }
  }

  async function handleGoalDelete() {
    if (!editingGoal) return
    try {
      await deleteGoal.mutateAsync(editingGoal.id)
      toast.success('Goal deleted')
      setEditingGoal(null)
      setShowGoalForm(false)
    } catch {
      toast.error('Failed to delete goal')
    }
  }

  async function handleContributionSubmit(values: {
    accountId: string
    amount: number
    date: string
  }) {
    if (!editingGoal) return

    try {
      await addGoalSavings.mutateAsync({
        id: editingGoal.id,
        accountId: values.accountId,
        amount: values.amount,
        transactionDate: values.date,
      })
      toast.success('Savings added')
      setEditingGoal(null)
      setShowContributionForm(false)
    } catch {
      toast.error('Failed to add savings')
    }
  }

  async function handleTransferOutSubmit(values: {
    accountId: string
    amount: number
    date: string
  }) {
    if (!editingGoal) return

    try {
      await transferOutGoalFunds.mutateAsync({
        id: editingGoal.id,
        accountId: values.accountId,
        amount: values.amount,
        transactionDate: values.date,
      })
      toast.success('Funds transferred out')
      setEditingGoal(null)
      setShowTransferOutForm(false)
    } catch {
      toast.error('Failed to transfer funds out')
    }
  }

  function openBudgetCreate() {
    setEditingBudget(null)
    setShowBudgetForm(true)
  }

  function openGoalCreate() {
    setEditingGoal(null)
    setShowGoalForm(true)
  }

  function openBudgetEdit(budgetId: string) {
    const budget = budgets.find((item) => item.id === budgetId) ?? null
    if (!budget) return
    setEditingBudget(budget)
    setShowBudgetForm(true)
  }

  function openGoalEdit(goalId: string) {
    const goal = goals.find((item) => item.id === goalId) ?? null
    if (!goal) return
    setEditingGoal(goal)
    setShowGoalForm(true)
  }

  function openGoalContribution(goalId: string) {
    const goal = goals.find((item) => item.id === goalId) ?? null
    if (!goal) return
    setEditingGoal(goal)
    setShowContributionForm(true)
  }

  function openGoalTransferOut(goalId: string) {
    const goal = goals.find((item) => item.id === goalId) ?? null
    if (!goal) return
    setEditingGoal(goal)
    setShowTransferOutForm(true)
  }

  function closeBudgetSheet() {
    setEditingBudget(null)
    setShowBudgetForm(false)
  }

  function closeGoalSheet() {
    setEditingGoal(null)
    setShowGoalForm(false)
  }

  function closeContributionSheet() {
    setEditingGoal(null)
    setShowContributionForm(false)
  }

  function closeTransferOutSheet() {
    setEditingGoal(null)
    setShowTransferOutForm(false)
  }

  const budgetSnapshots = budgetPageData?.budgetSnapshots ?? []
  const expenseCategoryOptions = budgetPageData?.expenseCategoryOptions ?? []
  const goalSnapshots = budgetPageData?.goals ?? []
  const activeAccounts = accounts.filter((account) => !account.isArchived)
  const selectedGoalUsage = editingGoal
    ? goalUsage.find((item) => item.goalId === editingGoal.id)
    : undefined

  return (
    <>
      <div className="space-y-6">
        <div className="space-y-3">
          <SectionHeader
            title="Monthly Budgets"
            action={
              <Button onClick={openBudgetCreate} variant="inline-primary">
                <Plus className="size-3.5" />
                Add
              </Button>
            }
          />
          <p className="text-muted-foreground/70 text-xs">
            Spending and progress shown here are for this month.
          </p>
          {isLoading ? (
            <div className="bg-card text-muted-foreground rounded-2xl p-4 text-sm">
              Loading budget snapshots…
            </div>
          ) : budgetSnapshots.length === 0 ? (
            <EmptyState
              title="No budgets yet"
              description="Add a monthly limit for a spending category."
              action={
                <Button onClick={openBudgetCreate} className="px-4 py-2">
                  Add a budget
                </Button>
              }
            />
          ) : (
            <BudgetList budgets={budgetSnapshots} onSelect={openBudgetEdit} />
          )}
        </div>

        <div className="space-y-3">
          <SectionHeader
            title="Savings Goals"
            action={
              <Button onClick={openGoalCreate} variant="inline-primary">
                <Plus className="size-3.5" />
                Add
              </Button>
            }
          />
          {goalSnapshots.length > 0 ? (
            <div className="space-y-4">
              {goalSnapshots.map((goal) => (
                <GoalCard
                  key={goal.id}
                  goal={goal}
                  onSelect={openGoalEdit}
                  onAddSavings={openGoalContribution}
                  onTransferOut={openGoalTransferOut}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              title="No savings goals"
              description="Add goals to target."
              action={
                <Button onClick={openGoalCreate} className="px-4 py-2">
                  Add a goal
                </Button>
              }
            />
          )}
        </div>
      </div>

      {showBudgetForm && (
        <BottomSheet
          title={editingBudget ? 'Edit Budget' : 'Add Budget'}
          onClose={closeBudgetSheet}
        >
          <BudgetForm
            categories={expenseCategoryOptions}
            onSubmit={handleBudgetSubmit}
            onDelete={editingBudget ? handleBudgetDelete : undefined}
            onCancel={closeBudgetSheet}
            submitLabel="Save"
            initialValues={editingBudget ?? undefined}
          />
        </BottomSheet>
      )}

      {showGoalForm && (
        <BottomSheet
          title={editingGoal ? 'Edit Goal' : 'Add Goal'}
          onClose={closeGoalSheet}
        >
          <GoalForm
            onSubmit={handleGoalSubmit}
            onDelete={
              editingGoal && selectedGoalUsage?.canDelete
                ? handleGoalDelete
                : undefined
            }
            onCancel={closeGoalSheet}
            submitLabel="Save"
            initialValues={editingGoal ?? undefined}
            deleteBlockedReason={selectedGoalUsage?.deleteBlockedReason}
            deleteNotice={selectedGoalUsage?.deleteNotice}
          />
        </BottomSheet>
      )}

      {showContributionForm && editingGoal && (
        <BottomSheet
          title={`Add Savings to ${editingGoal.name}`}
          onClose={closeContributionSheet}
        >
          <GoalContributionForm
            accounts={activeAccounts}
            mode="in"
            onSubmit={handleContributionSubmit}
            onCancel={closeContributionSheet}
          />
        </BottomSheet>
      )}

      {showTransferOutForm && editingGoal && (
        <BottomSheet
          title={`Transfer Out of ${editingGoal.name}`}
          onClose={closeTransferOutSheet}
        >
          <GoalContributionForm
            accounts={activeAccounts}
            mode="out"
            onSubmit={handleTransferOutSubmit}
            onCancel={closeTransferOutSheet}
          />
        </BottomSheet>
      )}
    </>
  )
}

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { DASHBOARD_QUERY_KEY } from '#/features/dashboard/hooks/use-dashboard-data'
import { toStoredDate } from '#/lib/dates'
import { DEFAULT_TRANSFER_CATEGORIES } from '#/services/seed/seed-data'
import { transactionRepository } from '#/features/transactions/services/transaction.repository'
import { goalManagementService } from '../services/goal-management.service'
import { goalRepository } from '../services/goal.repository'
import { goalQueryService } from '../services/goal-query.service'
import type { CreateGoalInput, UpdateGoalInput } from '../schemas/goal.schemas'

export const GOALS_QUERY_KEY = ['goals'] as const
export const GOAL_SNAPSHOTS_QUERY_KEY = ['goals', 'snapshots'] as const
export const GOAL_USAGE_QUERY_KEY = ['goals', 'usage'] as const

export function useGoals() {
  return useQuery({
    queryKey: GOALS_QUERY_KEY,
    queryFn: () => goalRepository.list(),
  })
}

export function useGoalSnapshots() {
  return useQuery({
    queryKey: GOAL_SNAPSHOTS_QUERY_KEY,
    queryFn: () => goalQueryService.listGoalSnapshots(),
  })
}

export function useGoalUsage() {
  return useQuery({
    queryKey: GOAL_USAGE_QUERY_KEY,
    queryFn: () => goalManagementService.listUsage(),
  })
}

export function useCreateGoal() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: CreateGoalInput) => goalRepository.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: GOALS_QUERY_KEY })
      queryClient.invalidateQueries({ queryKey: GOAL_SNAPSHOTS_QUERY_KEY })
      queryClient.invalidateQueries({ queryKey: GOAL_USAGE_QUERY_KEY })
      queryClient.invalidateQueries({ queryKey: ['budget-page'] })
      queryClient.invalidateQueries({ queryKey: DASHBOARD_QUERY_KEY })
    },
  })
}

export function useUpdateGoal() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, changes }: { id: string; changes: UpdateGoalInput }) =>
      goalRepository.update(id, changes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: GOALS_QUERY_KEY })
      queryClient.invalidateQueries({ queryKey: GOAL_SNAPSHOTS_QUERY_KEY })
      queryClient.invalidateQueries({ queryKey: GOAL_USAGE_QUERY_KEY })
      queryClient.invalidateQueries({ queryKey: ['budget-page'] })
      queryClient.invalidateQueries({ queryKey: DASHBOARD_QUERY_KEY })
    },
  })
}

export function useDeleteGoal() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => goalManagementService.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: GOALS_QUERY_KEY })
      queryClient.invalidateQueries({ queryKey: GOAL_SNAPSHOTS_QUERY_KEY })
      queryClient.invalidateQueries({ queryKey: GOAL_USAGE_QUERY_KEY })
      queryClient.invalidateQueries({ queryKey: ['budget-page'] })
      queryClient.invalidateQueries({ queryKey: DASHBOARD_QUERY_KEY })
    },
  })
}

export function useAddGoalSavings() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      id,
      accountId,
      amount,
      transactionDate,
    }: {
      id: string
      accountId: string
      amount: number
      transactionDate: string
    }) => {
      const goal = await goalRepository.getById(id)

      if (!goal) {
        throw new Error(`Goal not found: ${id}`)
      }

      return transactionRepository.create({
        type: 'transfer',
        amount,
        categoryId: DEFAULT_TRANSFER_CATEGORIES[0].id,
        accountId: null,
        fromAccountId: accountId,
        toAccountId: null,
        goalId: id,
        goalTransferDirection: 'in',
        note: `Goal Savings · ${goal.name}`,
        transactionDate: toStoredDate(
          new Date(transactionDate + 'T00:00:00.000Z'),
        ),
        recurringRuleId: null,
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: GOALS_QUERY_KEY })
      queryClient.invalidateQueries({ queryKey: GOAL_SNAPSHOTS_QUERY_KEY })
      queryClient.invalidateQueries({ queryKey: GOAL_USAGE_QUERY_KEY })
      queryClient.invalidateQueries({ queryKey: ['budget-page'] })
      queryClient.invalidateQueries({ queryKey: DASHBOARD_QUERY_KEY })
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
    },
  })
}

export function useTransferOutGoalFunds() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      id,
      accountId,
      amount,
      transactionDate,
    }: {
      id: string
      accountId: string
      amount: number
      transactionDate: string
    }) => {
      const goal = await goalRepository.getById(id)

      if (!goal) {
        throw new Error(`Goal not found: ${id}`)
      }

      return transactionRepository.create({
        type: 'transfer',
        amount,
        categoryId: DEFAULT_TRANSFER_CATEGORIES[0].id,
        accountId: null,
        fromAccountId: null,
        toAccountId: accountId,
        goalId: id,
        goalTransferDirection: 'out',
        note: `Goal Transfer Out · ${goal.name}`,
        transactionDate: toStoredDate(
          new Date(transactionDate + 'T00:00:00.000Z'),
        ),
        recurringRuleId: null,
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: GOALS_QUERY_KEY })
      queryClient.invalidateQueries({ queryKey: GOAL_SNAPSHOTS_QUERY_KEY })
      queryClient.invalidateQueries({ queryKey: GOAL_USAGE_QUERY_KEY })
      queryClient.invalidateQueries({ queryKey: ['budget-page'] })
      queryClient.invalidateQueries({ queryKey: DASHBOARD_QUERY_KEY })
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
    },
  })
}

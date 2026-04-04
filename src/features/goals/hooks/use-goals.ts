import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { DASHBOARD_QUERY_KEY } from '#/features/dashboard/hooks/use-dashboard-data'
import { goalRepository } from '../services/goal.repository'
import { goalQueryService } from '../services/goal-query.service'
import type { CreateGoalInput, UpdateGoalInput } from '../schemas/goal.schemas'

export const GOALS_QUERY_KEY = ['goals'] as const
export const PRIMARY_GOAL_QUERY_KEY = ['goals', 'primary-snapshot'] as const

export function useGoals() {
  return useQuery({
    queryKey: GOALS_QUERY_KEY,
    queryFn: () => goalRepository.list(),
  })
}

export function usePrimaryGoalSnapshot() {
  return useQuery({
    queryKey: PRIMARY_GOAL_QUERY_KEY,
    queryFn: () => goalQueryService.getPrimaryGoalSnapshot(),
  })
}

export function useCreateGoal() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: CreateGoalInput) => goalRepository.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: GOALS_QUERY_KEY })
      queryClient.invalidateQueries({ queryKey: PRIMARY_GOAL_QUERY_KEY })
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
      queryClient.invalidateQueries({ queryKey: PRIMARY_GOAL_QUERY_KEY })
      queryClient.invalidateQueries({ queryKey: ['budget-page'] })
      queryClient.invalidateQueries({ queryKey: DASHBOARD_QUERY_KEY })
    },
  })
}

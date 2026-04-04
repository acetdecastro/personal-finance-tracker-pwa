import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { goalRepository } from '../services/goal.repository'
import type { CreateGoalInput, UpdateGoalInput } from '../schemas/goal.schemas'

export const GOALS_QUERY_KEY = ['goals'] as const

export function useGoals() {
  return useQuery({
    queryKey: GOALS_QUERY_KEY,
    queryFn: () => goalRepository.list(),
  })
}

export function useCreateGoal() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: CreateGoalInput) => goalRepository.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: GOALS_QUERY_KEY })
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
    },
  })
}

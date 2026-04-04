import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { budgetRepository } from '../services/budget.repository'
import type { CreateBudgetInput, UpdateBudgetInput } from '../schemas/budget.schemas'

export const BUDGETS_QUERY_KEY = ['budgets'] as const

export function useBudgets() {
  return useQuery({
    queryKey: BUDGETS_QUERY_KEY,
    queryFn: () => budgetRepository.list(),
  })
}

export function useCreateBudget() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: CreateBudgetInput) => budgetRepository.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BUDGETS_QUERY_KEY })
    },
  })
}

export function useUpdateBudget() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, changes }: { id: string; changes: UpdateBudgetInput }) =>
      budgetRepository.update(id, changes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BUDGETS_QUERY_KEY })
    },
  })
}

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { DASHBOARD_QUERY_KEY } from '#/features/dashboard/hooks/use-dashboard-data'
import { budgetRepository } from '../services/budget.repository'
import { budgetPageQueryService } from '../services/budget-page-query.service'
import type {
  CreateBudgetInput,
  UpdateBudgetInput,
} from '../schemas/budget.schemas'

export const BUDGETS_QUERY_KEY = ['budgets'] as const
export const BUDGET_PAGE_QUERY_KEY = ['budget-page'] as const

export function useBudgets() {
  return useQuery({
    queryKey: BUDGETS_QUERY_KEY,
    queryFn: () => budgetRepository.list(),
  })
}

export function useBudgetPageData() {
  return useQuery({
    queryKey: BUDGET_PAGE_QUERY_KEY,
    queryFn: () => budgetPageQueryService.getBudgetPageData(),
  })
}

export function useCreateBudget() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: CreateBudgetInput) => budgetRepository.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BUDGETS_QUERY_KEY })
      queryClient.invalidateQueries({ queryKey: BUDGET_PAGE_QUERY_KEY })
      queryClient.invalidateQueries({ queryKey: DASHBOARD_QUERY_KEY })
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
      queryClient.invalidateQueries({ queryKey: BUDGET_PAGE_QUERY_KEY })
      queryClient.invalidateQueries({ queryKey: DASHBOARD_QUERY_KEY })
    },
  })
}

export function useDeleteBudget() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => budgetRepository.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BUDGETS_QUERY_KEY })
      queryClient.invalidateQueries({ queryKey: BUDGET_PAGE_QUERY_KEY })
      queryClient.invalidateQueries({ queryKey: DASHBOARD_QUERY_KEY })
    },
  })
}

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { DASHBOARD_QUERY_KEY } from '#/features/dashboard/hooks/use-dashboard-data'
import { recurringRuleRepository } from '../services/recurring-rule.repository'
import type {
  CreateRecurringRuleInput,
  UpdateRecurringRuleInput,
} from '../schemas/recurring-rule.schemas'

export const RECURRING_RULES_QUERY_KEY = ['recurring-rules'] as const

export function useRecurringRules() {
  return useQuery({
    queryKey: RECURRING_RULES_QUERY_KEY,
    queryFn: () => recurringRuleRepository.list(),
  })
}

export function useCreateRecurringRule() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: CreateRecurringRuleInput) =>
      recurringRuleRepository.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: RECURRING_RULES_QUERY_KEY })
      queryClient.invalidateQueries({ queryKey: DASHBOARD_QUERY_KEY })
    },
  })
}

export function useUpdateRecurringRule() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      id,
      changes,
    }: {
      id: string
      changes: UpdateRecurringRuleInput
    }) => recurringRuleRepository.update(id, changes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: RECURRING_RULES_QUERY_KEY })
      queryClient.invalidateQueries({ queryKey: DASHBOARD_QUERY_KEY })
    },
  })
}

export function useDeleteRecurringRule() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => recurringRuleRepository.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: RECURRING_RULES_QUERY_KEY })
      queryClient.invalidateQueries({ queryKey: DASHBOARD_QUERY_KEY })
    },
  })
}

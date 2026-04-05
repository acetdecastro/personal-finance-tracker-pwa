import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { BUDGET_PAGE_QUERY_KEY } from '#/features/budgets/hooks/use-budgets'
import { DASHBOARD_QUERY_KEY } from '#/features/dashboard/hooks/use-dashboard-data'
import { transactionService } from '../services/transaction.service'
import type { TransactionFiltersDto } from '../types'
import type {
  CreateTransactionInput,
  UpdateTransactionInput,
} from '../schemas/transaction.schemas'

export const TRANSACTIONS_QUERY_KEY = ['transactions'] as const
export const TRANSACTION_FORM_OPTIONS_QUERY_KEY = [
  'transaction-form-options',
] as const

export function useTransactions(filters?: TransactionFiltersDto) {
  return useQuery({
    queryKey: [...TRANSACTIONS_QUERY_KEY, filters],
    queryFn: () => transactionService.list(filters ?? undefined),
  })
}

export function useTransactionFormOptions() {
  return useQuery({
    queryKey: TRANSACTION_FORM_OPTIONS_QUERY_KEY,
    queryFn: () => transactionService.getFormOptions(),
  })
}

export function useCreateTransaction() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: CreateTransactionInput) =>
      transactionService.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TRANSACTIONS_QUERY_KEY })
      queryClient.invalidateQueries({ queryKey: BUDGET_PAGE_QUERY_KEY })
      queryClient.invalidateQueries({ queryKey: DASHBOARD_QUERY_KEY })
    },
  })
}

export function useUpdateTransaction() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      id,
      changes,
    }: {
      id: string
      changes: UpdateTransactionInput
    }) => transactionService.update(id, changes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TRANSACTIONS_QUERY_KEY })
      queryClient.invalidateQueries({ queryKey: BUDGET_PAGE_QUERY_KEY })
      queryClient.invalidateQueries({ queryKey: DASHBOARD_QUERY_KEY })
    },
  })
}

export function useDeleteTransaction() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => transactionService.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TRANSACTIONS_QUERY_KEY })
      queryClient.invalidateQueries({ queryKey: BUDGET_PAGE_QUERY_KEY })
      queryClient.invalidateQueries({ queryKey: DASHBOARD_QUERY_KEY })
    },
  })
}

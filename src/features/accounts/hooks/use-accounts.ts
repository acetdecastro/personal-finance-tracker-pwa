import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { DASHBOARD_QUERY_KEY } from '#/features/dashboard/hooks/use-dashboard-data'
import { TRANSACTION_FORM_OPTIONS_QUERY_KEY } from '#/features/transactions/hooks/use-transactions'
import { accountManagementService } from '../services/account-management.service'
import { accountRepository } from '../services/account.repository'
import type {
  CreateAccountInput,
  UpdateAccountInput,
} from '../schemas/account.schemas'

export const ACCOUNTS_QUERY_KEY = ['accounts'] as const
export const ACCOUNT_USAGE_QUERY_KEY = ['account-usage'] as const

export function useAccounts() {
  return useQuery({
    queryKey: ACCOUNTS_QUERY_KEY,
    queryFn: () => accountRepository.list(),
  })
}

export function useAccountUsage() {
  return useQuery({
    queryKey: ACCOUNT_USAGE_QUERY_KEY,
    queryFn: () => accountManagementService.listUsage(),
  })
}

export function useCreateAccount() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: CreateAccountInput) => accountRepository.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ACCOUNTS_QUERY_KEY })
      queryClient.invalidateQueries({ queryKey: ACCOUNT_USAGE_QUERY_KEY })
      queryClient.invalidateQueries({ queryKey: DASHBOARD_QUERY_KEY })
      queryClient.invalidateQueries({
        queryKey: TRANSACTION_FORM_OPTIONS_QUERY_KEY,
      })
    },
  })
}

export function useUpdateAccount() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      id,
      changes,
    }: {
      id: string
      changes: UpdateAccountInput
    }) => accountRepository.update(id, changes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ACCOUNTS_QUERY_KEY })
      queryClient.invalidateQueries({ queryKey: ACCOUNT_USAGE_QUERY_KEY })
      queryClient.invalidateQueries({ queryKey: DASHBOARD_QUERY_KEY })
      queryClient.invalidateQueries({
        queryKey: TRANSACTION_FORM_OPTIONS_QUERY_KEY,
      })
    },
  })
}

export function useArchiveAccount() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => accountManagementService.archive(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ACCOUNTS_QUERY_KEY })
      queryClient.invalidateQueries({ queryKey: ACCOUNT_USAGE_QUERY_KEY })
      queryClient.invalidateQueries({ queryKey: DASHBOARD_QUERY_KEY })
      queryClient.invalidateQueries({
        queryKey: TRANSACTION_FORM_OPTIONS_QUERY_KEY,
      })
    },
  })
}

export function useRestoreAccount() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => accountManagementService.restore(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ACCOUNTS_QUERY_KEY })
      queryClient.invalidateQueries({ queryKey: ACCOUNT_USAGE_QUERY_KEY })
      queryClient.invalidateQueries({ queryKey: DASHBOARD_QUERY_KEY })
      queryClient.invalidateQueries({
        queryKey: TRANSACTION_FORM_OPTIONS_QUERY_KEY,
      })
    },
  })
}

export function useDeleteAccount() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => accountManagementService.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ACCOUNTS_QUERY_KEY })
      queryClient.invalidateQueries({ queryKey: ACCOUNT_USAGE_QUERY_KEY })
      queryClient.invalidateQueries({ queryKey: DASHBOARD_QUERY_KEY })
      queryClient.invalidateQueries({
        queryKey: TRANSACTION_FORM_OPTIONS_QUERY_KEY,
      })
    },
  })
}

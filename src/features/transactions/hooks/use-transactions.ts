import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { transactionRepository } from '../services/transaction.repository'
import type { CreateTransactionInput, UpdateTransactionInput } from '../schemas/transaction.schemas'
import type { TransactionType } from '#/types/domain'

export const TRANSACTIONS_QUERY_KEY = ['transactions'] as const

export function useTransactions(filters?: {
  type?: TransactionType | null
  accountId?: string | null
  categoryId?: string | null
}) {
  return useQuery({
    queryKey: TRANSACTIONS_QUERY_KEY,
    queryFn: async () => {
      const all = await transactionRepository.list()
      if (!filters) return all
      return all.filter((t) => {
        if (filters.type && t.type !== filters.type) return false
        if (filters.accountId && t.accountId !== filters.accountId) return false
        if (filters.categoryId && t.categoryId !== filters.categoryId) return false
        return true
      })
    },
  })
}

export function useCreateTransaction() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: CreateTransactionInput) =>
      transactionRepository.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TRANSACTIONS_QUERY_KEY })
    },
  })
}

export function useUpdateTransaction() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, changes }: { id: string; changes: UpdateTransactionInput }) =>
      transactionRepository.update(id, changes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TRANSACTIONS_QUERY_KEY })
    },
  })
}

export function useDeleteTransaction() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => transactionRepository.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TRANSACTIONS_QUERY_KEY })
    },
  })
}

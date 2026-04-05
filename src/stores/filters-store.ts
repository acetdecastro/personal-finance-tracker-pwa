import { create } from 'zustand'
import type { TransactionType } from '#/types/domain'

interface FiltersStore {
  transactionType: TransactionType | null
  accountId: string | null
  categoryId: string | null
  setTransactionType: (type: TransactionType | null) => void
  setAccountId: (id: string | null) => void
  setCategoryId: (id: string | null) => void
  reset: () => void
}

export const useFiltersStore = create<FiltersStore>((set) => ({
  transactionType: null,
  accountId: null,
  categoryId: null,
  setTransactionType: (transactionType) => set({ transactionType }),
  setAccountId: (accountId) => set({ accountId }),
  setCategoryId: (categoryId) => set({ categoryId }),
  reset: () =>
    set({ transactionType: null, accountId: null, categoryId: null }),
}))

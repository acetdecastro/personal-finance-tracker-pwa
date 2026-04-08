import { create } from 'zustand'

export type TransactionMode = 'posted' | 'recurring'
export type RecurringFilter = 'all' | 'income' | 'expense'

interface TransactionsViewStore {
  mode: TransactionMode
  recurringFilter: RecurringFilter
  setMode: (mode: TransactionMode) => void
  setRecurringFilter: (filter: RecurringFilter) => void
  openPostedTransactions: () => void
  openRecurringExpenses: () => void
  openRecurringIncome: () => void
}

export const useTransactionsViewStore = create<TransactionsViewStore>((set) => ({
  mode: 'posted',
  recurringFilter: 'all',
  setMode: (mode) => set({ mode }),
  setRecurringFilter: (recurringFilter) => set({ recurringFilter }),
  openPostedTransactions: () => set({ mode: 'posted', recurringFilter: 'all' }),
  openRecurringExpenses: () =>
    set({ mode: 'recurring', recurringFilter: 'expense' }),
  openRecurringIncome: () =>
    set({ mode: 'recurring', recurringFilter: 'income' }),
}))

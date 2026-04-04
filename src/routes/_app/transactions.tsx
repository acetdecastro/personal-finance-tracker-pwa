import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { Plus, X } from 'lucide-react'
import { TransactionList } from '#/features/transactions/components/TransactionList'
import { TransactionForm } from '#/features/transactions/components/TransactionForm'
import { TransactionFilterBar } from '#/features/transactions/components/TransactionFilterBar'
import { EmptyState } from '#/components/common/EmptyState'
import {
  useTransactions,
  useCreateTransaction,
  useDeleteTransaction,
} from '#/features/transactions/hooks/use-transactions'
import { useAccounts } from '#/features/accounts/hooks/use-accounts'
import { useCategories } from '#/features/categories/hooks/use-categories'
import { useFiltersStore } from '#/stores/filters-store'
import type { CreateTransactionInput } from '#/features/transactions/schemas/transaction.schemas'

export const Route = createFileRoute('/_app/transactions')({
  component: TransactionsRoute,
})

function TransactionsRoute() {
  const [showForm, setShowForm] = useState(false)
  const { transactionType } = useFiltersStore()

  const { data: transactions = [] } = useTransactions({ type: transactionType })
  const { data: accounts = [] } = useAccounts()
  const { data: categories = [] } = useCategories()

  const createTransaction = useCreateTransaction()
  const deleteTransaction = useDeleteTransaction()

  async function handleSubmit(values: CreateTransactionInput) {
    await createTransaction.mutateAsync(values)
    setShowForm(false)
  }

  async function handleDelete(id: string) {
    await deleteTransaction.mutateAsync(id)
  }

  return (
    <>
      <div className="space-y-4">
        <TransactionFilterBar />

        {transactions.length === 0 ? (
          <EmptyState
            title="No transactions"
            description={
              transactionType
                ? `No ${transactionType} transactions yet.`
                : 'Log your first transaction below.'
            }
          />
        ) : (
          <TransactionList
            transactions={transactions}
            accounts={accounts}
            categories={categories}
            onDelete={handleDelete}
          />
        )}
      </div>

      {/* FAB */}
      <button
        onClick={() => setShowForm(true)}
        className="fixed bottom-24 right-5 z-30 flex size-14 items-center justify-center rounded-2xl bg-emerald-700 shadow-lg transition active:scale-90 dark:bg-emerald-600"
        aria-label="Add transaction"
      >
        <Plus className="size-6 text-white" />
      </button>

      {/* Bottom sheet */}
      {showForm && (
        <div
          className="fixed inset-0 z-50 flex flex-col justify-end bg-black/40"
          onClick={() => setShowForm(false)}
        >
          <div
            className="max-h-[90dvh] overflow-y-auto rounded-t-3xl bg-white px-5 pb-8 pt-5 dark:bg-zinc-950"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Add Transaction
              </h2>
              <button
                onClick={() => setShowForm(false)}
                className="rounded-lg p-1 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300"
              >
                <X className="size-5" />
              </button>
            </div>
            {accounts.length === 0 ? (
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Set up an account first in Settings.
              </p>
            ) : (
              <TransactionForm
                accounts={accounts}
                categories={categories}
                onSubmit={handleSubmit}
                onCancel={() => setShowForm(false)}
              />
            )}
          </div>
        </div>
      )}
    </>
  )
}

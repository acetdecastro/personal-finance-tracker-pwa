import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { Loader2, Plus } from 'lucide-react'
import { Button } from '#/components/common/Button'
import { BottomSheet } from '#/components/common/BottomSheet'
import { TransactionList } from '#/features/transactions/components/TransactionList'
import { TransactionForm } from '#/features/transactions/components/TransactionForm'
import { TransactionFilterBar } from '#/features/transactions/components/TransactionFilterBar'
import { EmptyState } from '#/components/common/EmptyState'
import {
  useTransactions,
  useTransactionFormOptions,
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

  const { data: transactions = [] } = useTransactions({
    type: transactionType,
  })
  const { data: accounts = [] } = useAccounts()
  const { data: categories = [] } = useCategories()
  const {
    data: formOptions,
    isLoading: formOptionsLoading,
  } = useTransactionFormOptions()

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
      <Button
        onClick={() => setShowForm(true)}
        variant="fab"
        aria-label="Add transaction"
      >
        <Plus className="size-6 text-primary-foreground" />
      </Button>

      {/* Bottom sheet */}
      {showForm && (
        <BottomSheet title="Add Transaction" onClose={() => setShowForm(false)}>
            {formOptionsLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="size-5 animate-spin text-primary" />
              </div>
            ) : !formOptions || formOptions.accountOptions.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Set up an account first in Settings.
              </p>
            ) : (
              <TransactionForm
                formOptions={formOptions}
                onSubmit={handleSubmit}
                onCancel={() => setShowForm(false)}
              />
            )}
        </BottomSheet>
      )}
    </>
  )
}

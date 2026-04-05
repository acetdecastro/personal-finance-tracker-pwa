import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { toast } from 'sonner'
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
  useUpdateTransaction,
  useDeleteTransaction,
} from '#/features/transactions/hooks/use-transactions'
import { useAccounts } from '#/features/accounts/hooks/use-accounts'
import { useCategories } from '#/features/categories/hooks/use-categories'
import { useGoals } from '#/features/goals/hooks/use-goals'
import { useFiltersStore } from '#/stores/filters-store'
import type { CreateTransactionInput } from '#/features/transactions/schemas/transaction.schemas'
import type { Transaction } from '#/types/domain'

const TRANSACTION_TYPE_LABELS = {
  income: 'income',
  expense: 'expense',
  transfer: 'transfer',
} as const

export const Route = createFileRoute('/_app/transactions')({
  component: TransactionsRoute,
})

function TransactionsRoute() {
  const [showForm, setShowForm] = useState(false)
  const [editingTransaction, setEditingTransaction] =
    useState<Transaction | null>(null)
  const { transactionType } = useFiltersStore()

  const { data: transactions = [] } = useTransactions({
    type: transactionType,
  })
  const { data: accounts = [] } = useAccounts()
  const { data: categories = [] } = useCategories()
  const { data: goals = [] } = useGoals()
  const { data: formOptions, isLoading: formOptionsLoading } =
    useTransactionFormOptions()

  const createTransaction = useCreateTransaction()
  const updateTransaction = useUpdateTransaction()
  const deleteTransaction = useDeleteTransaction()

  async function handleSubmit(values: CreateTransactionInput) {
    try {
      if (editingTransaction) {
        await updateTransaction.mutateAsync({
          id: editingTransaction.id,
          changes: values,
        })
        toast.success('Transaction updated')
      } else {
        await createTransaction.mutateAsync(values)
        toast.success('Transaction added')
      }
      setEditingTransaction(null)
      setShowForm(false)
    } catch {
      toast.error(
        editingTransaction
          ? 'Failed to update transaction'
          : 'Failed to add transaction',
      )
    }
  }

  async function handleDelete(id: string) {
    try {
      await deleteTransaction.mutateAsync(id)
      toast.success('Transaction deleted')
      setEditingTransaction(null)
      setShowForm(false)
    } catch {
      toast.error('Failed to delete transaction')
    }
  }

  function handleAddTransaction() {
    setEditingTransaction(null)
    setShowForm(true)
  }

  function handleEditTransaction(transaction: Transaction) {
    if (transaction.type === 'transfer') return
    setEditingTransaction(transaction)
    setShowForm(true)
  }

  function handleCloseSheet() {
    setEditingTransaction(null)
    setShowForm(false)
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
                ? `No ${TRANSACTION_TYPE_LABELS[transactionType]} transactions yet.`
                : 'Log your first transaction below.'
            }
          />
        ) : (
          <TransactionList
            transactions={transactions}
            accounts={accounts}
            categories={categories}
            goals={goals}
            onEdit={handleEditTransaction}
          />
        )}
      </div>

      {/* FAB */}
      <Button
        onClick={handleAddTransaction}
        variant="fab"
        aria-label="Add transaction"
      >
        <Plus className="text-primary-foreground size-6" />
      </Button>

      {/* Bottom sheet */}
      {showForm && (
        <BottomSheet
          title={editingTransaction ? 'Edit Transaction' : 'Add Transaction'}
          onClose={handleCloseSheet}
        >
          {formOptionsLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="text-primary size-5 animate-spin" />
            </div>
          ) : !formOptions || formOptions.accountOptions.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              Set up an account first in Settings.
            </p>
          ) : (
            <TransactionForm
              formOptions={formOptions}
              onSubmit={handleSubmit}
              onDelete={
                editingTransaction
                  ? () => handleDelete(editingTransaction.id)
                  : undefined
              }
              onCancel={handleCloseSheet}
              submitLabel={'Save'}
              initialValues={editingTransaction ?? undefined}
            />
          )}
        </BottomSheet>
      )}
    </>
  )
}

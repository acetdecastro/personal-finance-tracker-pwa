import { useEffect, useMemo, useRef, useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { toast } from 'sonner'
import { Loader2, Minus, Plus } from 'lucide-react'
import { Button } from '#/components/common/Button'
import { BottomSheet } from '#/components/common/BottomSheet'
import { ConfirmDialog } from '#/components/common/ConfirmDialog'
import { EmptyState } from '#/components/common/EmptyState'
import { SectionHeader } from '#/components/common/SectionHeader'
import { RecurringRuleForm } from '#/features/recurring/components/RecurringRuleForm'
import { RecurringRuleList } from '#/features/recurring/components/RecurringRuleList'
import { TransferDetails } from '#/features/transactions/components/TransferDetails'
import { TransactionList } from '#/features/transactions/components/TransactionList'
import { TransactionForm } from '#/features/transactions/components/TransactionForm'
import { TransactionFilterBar } from '#/features/transactions/components/TransactionFilterBar'
import {
  useInfiniteTransactions,
  useTransactionFormOptions,
  useCreateTransaction,
  useUpdateTransaction,
  useDeleteTransaction,
} from '#/features/transactions/hooks/use-transactions'
import { useAccounts } from '#/features/accounts/hooks/use-accounts'
import { useCategories } from '#/features/categories/hooks/use-categories'
import { useGoals } from '#/features/goals/hooks/use-goals'
import {
  useCreateRecurringRule,
  useDeleteRecurringRule,
  useRecurringRules,
  useUpdateRecurringRule,
} from '#/features/recurring/hooks/use-recurring-rules'
import { cn } from '#/lib/utils/cn'
import { useFiltersStore } from '#/stores/filters-store'
import { useTransactionsViewStore } from '#/stores/transactions-view-store'
import type {
  RecurringFilter,
  TransactionMode,
} from '#/stores/transactions-view-store'
import type { CreateRecurringRuleInput } from '#/features/recurring/schemas/recurring-rule.schemas'
import type { CreateTransactionInput } from '#/features/transactions/schemas/transaction.schemas'
import type { RecurringRule, Transaction } from '#/types/domain'

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
  const [viewingTransfer, setViewingTransfer] = useState<Transaction | null>(
    null,
  )
  const [recurringSheetState, setRecurringSheetState] = useState<
    | { mode: 'create'; type: 'income' | 'expense' }
    | { mode: 'edit'; rule: RecurringRule }
    | null
  >(null)
  const [confirmRecurringDeleteRule, setConfirmRecurringDeleteRule] =
    useState<RecurringRule | null>(null)
  const { transactionType } = useFiltersStore()
  const { mode, setMode, recurringFilter, setRecurringFilter } =
    useTransactionsViewStore()
  const loadMoreRef = useRef<HTMLDivElement | null>(null)

  const {
    data: transactionPages,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: isTransactionsLoading,
  } = useInfiniteTransactions({
    type: transactionType,
  })
  const { data: accounts = [] } = useAccounts()
  const { data: categories = [] } = useCategories()
  const { data: goals = [] } = useGoals()
  const { data: recurringRules = [] } = useRecurringRules()
  const { data: formOptions, isLoading: formOptionsLoading } =
    useTransactionFormOptions()

  const createTransaction = useCreateTransaction()
  const updateTransaction = useUpdateTransaction()
  const deleteTransaction = useDeleteTransaction()
  const createRecurringRule = useCreateRecurringRule()
  const updateRecurringRule = useUpdateRecurringRule()
  const deleteRecurringRule = useDeleteRecurringRule()

  const filteredRecurringRules =
    recurringFilter === 'all'
      ? recurringRules
      : recurringRules.filter((rule) => rule.type === recurringFilter)
  const transactions = useMemo(
    () => transactionPages?.pages.flatMap((page) => page.items) ?? [],
    [transactionPages],
  )

  useEffect(() => {
    if (mode !== 'posted') {
      return
    }

    const sentinel = loadMoreRef.current

    if (!sentinel || !hasNextPage || isFetchingNextPage) {
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          void fetchNextPage()
        }
      },
      { rootMargin: '240px 0px' },
    )

    observer.observe(sentinel)

    return () => observer.disconnect()
  }, [fetchNextPage, hasNextPage, isFetchingNextPage, mode])

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

  async function handleRecurringSubmit(values: CreateRecurringRuleInput) {
    try {
      if (recurringSheetState?.mode === 'edit') {
        await updateRecurringRule.mutateAsync({
          id: recurringSheetState.rule.id,
          changes: values,
        })
        toast.success('Recurring transaction updated')
      } else {
        await createRecurringRule.mutateAsync(values)
        toast.success('Recurring transaction added')
      }
      setRecurringSheetState(null)
    } catch {
      toast.error(
        recurringSheetState?.mode === 'edit'
          ? 'Failed to update recurring transaction'
          : 'Failed to add recurring transaction',
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

  async function handleDeleteRecurringRule(id: string) {
    try {
      await deleteRecurringRule.mutateAsync(id)
      toast.success('Recurring transaction deleted')
      setConfirmRecurringDeleteRule(null)
      setRecurringSheetState(null)
    } catch {
      toast.error('Failed to delete recurring transaction')
    }
  }

  function handleAddTransaction() {
    setEditingTransaction(null)
    setViewingTransfer(null)
    setShowForm(true)
  }

  function handleAddRecurring(type: 'income' | 'expense') {
    setRecurringSheetState({ mode: 'create', type })
  }

  function handleSelectTransaction(transaction: Transaction) {
    if (transaction.type === 'transfer') {
      setShowForm(false)
      setEditingTransaction(null)
      setViewingTransfer(transaction)
      return
    }

    setViewingTransfer(null)
    setEditingTransaction(transaction)
    setShowForm(true)
  }

  function handleCloseSheet() {
    setEditingTransaction(null)
    setShowForm(false)
  }

  function handleCloseTransferDetails() {
    setViewingTransfer(null)
  }

  const recurringType =
    recurringSheetState?.mode === 'edit'
      ? recurringSheetState.rule.type
      : recurringSheetState?.mode === 'create'
        ? recurringSheetState.type
        : 'income'

  return (
    <>
      <div className="space-y-3">
        <SectionHeader
          title="Transactions"
          action={
            mode === 'posted' ? (
              <Button
                onClick={handleAddTransaction}
                variant="inline-primary"
                className="text-sm"
              >
                <Plus className="size-3.5" />
                Add
              </Button>
            ) : (
              <div className="flex items-center gap-2">
                <Button
                  onClick={() => handleAddRecurring('income')}
                  variant="inline-primary"
                  className="text-sm"
                >
                  <Plus className="size-3.5" />
                  Income
                </Button>
                <Button
                  onClick={() => handleAddRecurring('expense')}
                  variant="inline-secondary"
                  className="text-sm"
                >
                  <Minus className="size-3.5" />
                  Expense
                </Button>
              </div>
            )
          }
        />

        <div className="no-scrollbar flex gap-2 overflow-x-auto p-1">
          {(
            [
              { label: 'Posted', value: 'posted' },
              { label: 'Recurring', value: 'recurring' },
            ] as { label: string; value: TransactionMode }[]
          ).map((tab) => (
            <button
              key={tab.value}
              type="button"
              onClick={() => setMode(tab.value)}
              className={cn(
                'focus-visible:ring-ring focus-visible:ring-offset-background shrink-0 rounded-full px-4 py-1.5 text-xs font-semibold transition outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
                mode === tab.value
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-secondary-foreground',
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {mode === 'posted' ? (
          <>
            <TransactionFilterBar />

            {isTransactionsLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="text-primary size-5 animate-spin" />
              </div>
            ) : transactions.length === 0 ? (
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
                onSelect={handleSelectTransaction}
              />
            )}

            <div ref={loadMoreRef} className="flex justify-center py-3">
              {isFetchingNextPage && (
                <div className="text-muted-foreground flex items-center gap-2 text-xs">
                  <Loader2 className="size-3.5 animate-spin" />
                  Loading more transactions…
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            <div className="no-scrollbar flex gap-2 overflow-x-auto p-1">
              {(
                [
                  { label: 'All', value: 'all' },
                  { label: 'Income', value: 'income' },
                  { label: 'Expense', value: 'expense' },
                ] as { label: string; value: RecurringFilter }[]
              ).map((tab) => (
                <button
                  key={tab.value}
                  type="button"
                  onClick={() => setRecurringFilter(tab.value)}
                  className={cn(
                    'focus-visible:ring-ring focus-visible:ring-offset-background shrink-0 rounded-full px-4 py-1.5 text-xs font-semibold transition outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
                    recurringFilter === tab.value
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-secondary-foreground',
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <p className="text-muted-foreground/70 text-xs">
              Recurring transactions are expected future entries used for
              forecasts.
            </p>

            {filteredRecurringRules.length === 0 ? (
              <EmptyState
                title={
                  recurringFilter === 'all'
                    ? 'No recurring transactions'
                    : `No ${recurringFilter} recurring transactions`
                }
                description="Add salary or recurring bills here so your forecasts stay useful."
              />
            ) : (
              <RecurringRuleList
                rules={filteredRecurringRules}
                categories={categories}
                onSelect={(rule) =>
                  setRecurringSheetState({ mode: 'edit', rule })
                }
              />
            )}
          </>
        )}
      </div>

      {/* Floating action button */}
      {/* {mode === 'posted' && (
        <Button
          onClick={handleAddTransaction}
          variant="fab"
          aria-label="Add transaction"
        >
          <Plus className="text-primary-foreground size-6" />
        </Button>
      )} */}

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

      {viewingTransfer && (
        <BottomSheet
          title="Transfer Details"
          onClose={handleCloseTransferDetails}
        >
          <TransferDetails
            transaction={viewingTransfer}
            accounts={accounts}
            categories={categories}
            goals={goals}
          />
        </BottomSheet>
      )}

      {recurringSheetState && (
        <BottomSheet
          title={
            recurringSheetState.mode === 'edit'
              ? 'Edit Recurring Transaction'
              : recurringType === 'expense'
                ? 'Add Recurring Expense'
                : 'Add Recurring Income'
          }
          onClose={() => setRecurringSheetState(null)}
        >
          <RecurringRuleForm
            accounts={accounts}
            categories={categories}
            type={recurringType}
            defaultName={recurringType === 'income' ? 'Salary' : ''}
            defaultCategoryId={
              recurringType === 'income' ? 'category-income-salary' : ''
            }
            initialValues={
              recurringSheetState.mode === 'edit'
                ? recurringSheetState.rule
                : undefined
            }
            onSubmit={handleRecurringSubmit}
            onDelete={
              recurringSheetState.mode === 'edit'
                ? async () => {
                    setConfirmRecurringDeleteRule(recurringSheetState.rule)
                  }
                : undefined
            }
            onCancel={() => setRecurringSheetState(null)}
            submitLabel="Save"
          />
        </BottomSheet>
      )}

      {confirmRecurringDeleteRule && (
        <ConfirmDialog
          title="Delete recurring transaction?"
          description="This will stop future forecasted occurrences from this recurring transaction. Past linked transactions will be kept in your history."
          confirmLabel="Delete"
          onCancel={() => setConfirmRecurringDeleteRule(null)}
          onConfirm={() =>
            handleDeleteRecurringRule(confirmRecurringDeleteRule.id)
          }
          isLoading={deleteRecurringRule.isPending}
          tone="destructive"
        />
      )}
    </>
  )
}

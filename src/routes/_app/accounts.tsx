import { useMemo, useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { toast } from 'sonner'
import { Plus } from 'lucide-react'
import { Button } from '#/components/common/Button'
import { BottomSheet } from '#/components/common/BottomSheet'
import { AccountForm } from '#/features/accounts/components/AccountForm'
import { AccountList } from '#/features/accounts/components/AccountList'
import {
  useAccountUsage,
  useAccounts,
  useArchiveAccount,
  useCreateAccount,
  useDeleteAccount,
  useRestoreAccount,
  useUpdateAccount,
} from '#/features/accounts/hooks/use-accounts'
import { SectionHeader } from '#/components/common/SectionHeader'
import { EmptyState } from '#/components/common/EmptyState'
import { cn } from '#/lib/utils/cn'
import type { Account } from '#/types/domain'
import type {
  CreateAccountInput,
  UpdateAccountInput,
} from '#/features/accounts/schemas/account.schemas'

export const Route = createFileRoute('/_app/accounts')({
  component: AccountsRoute,
})

type SheetState = { mode: 'create' } | { mode: 'edit'; account: Account } | null

function AccountsRoute() {
  const [filter, setFilter] = useState<'active' | 'archived'>('active')
  const [sheetState, setSheetState] = useState<SheetState>(null)
  const { data: accounts = [] } = useAccounts()
  const { data: accountUsage = [] } = useAccountUsage()
  const createAccount = useCreateAccount()
  const updateAccount = useUpdateAccount()
  const archiveAccount = useArchiveAccount()
  const restoreAccount = useRestoreAccount()
  const deleteAccount = useDeleteAccount()

  async function handleCreate(values: CreateAccountInput) {
    try {
      await createAccount.mutateAsync(values)
      toast.success('Account added')
      setSheetState(null)
    } catch {
      toast.error('Failed to add account')
    }
  }

  async function handleUpdate(values: UpdateAccountInput) {
    if (sheetState?.mode !== 'edit') {
      return
    }
    try {
      await updateAccount.mutateAsync({
        id: sheetState.account.id,
        changes: values,
      })
      toast.success('Account updated')
      setSheetState(null)
    } catch {
      toast.error('Failed to update account')
    }
  }

  async function handleArchive() {
    if (sheetState?.mode !== 'edit') {
      return
    }
    try {
      await archiveAccount.mutateAsync(sheetState.account.id)
      toast.success('Account archived')
      setSheetState(null)
    } catch {
      toast.error('Failed to archive account')
    }
  }

  async function handleRestore() {
    if (sheetState?.mode !== 'edit') {
      return
    }
    try {
      await restoreAccount.mutateAsync(sheetState.account.id)
      toast.success('Account restored')
      setSheetState(null)
    } catch {
      toast.error('Failed to restore account')
    }
  }

  async function handleDelete() {
    if (sheetState?.mode !== 'edit') {
      return
    }
    try {
      await deleteAccount.mutateAsync(sheetState.account.id)
      toast.success('Account deleted')
      setSheetState(null)
    } catch {
      toast.error('Failed to delete account')
    }
  }

  const filteredAccounts = useMemo(
    () =>
      accounts.filter((account) =>
        filter === 'active' ? !account.isArchived : account.isArchived,
      ),
    [accounts, filter],
  )

  const accountUsageMap = useMemo(
    () => new Map(accountUsage.map((usage) => [usage.accountId, usage])),
    [accountUsage],
  )

  const selectedUsage =
    sheetState?.mode === 'edit'
      ? accountUsageMap.get(sheetState.account.id)
      : undefined

  return (
    <>
      <div className="space-y-6">
        <div className="space-y-3">
          <SectionHeader
            title="Accounts & Wallets"
            action={
              <Button
                onClick={() => setSheetState({ mode: 'create' })}
                variant="inline-primary"
              >
                <Plus className="size-3.5" />
                Add
              </Button>
            }
          />
          <div className="no-scrollbar flex gap-2 overflow-x-auto px-0.5 py-1">
            {[
              { label: 'Active', value: 'active' as const },
              { label: 'Archived', value: 'archived' as const },
            ].map((tab) => (
              <button
                key={tab.value}
                type="button"
                onClick={() => setFilter(tab.value)}
                className={cn(
                  'focus-visible:ring-ring focus-visible:ring-offset-background shrink-0 rounded-full px-4 py-1.5 text-xs font-semibold transition outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
                  filter === tab.value
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-secondary-foreground',
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
          {filteredAccounts.length === 0 ? (
            <EmptyState
              title={
                filter === 'active'
                  ? 'No active accounts'
                  : 'No archived accounts'
              }
              description={
                filter === 'active'
                  ? 'Add your first account to start tracking balances and reserves.'
                  : 'Archived accounts will appear here.'
              }
              action={
                filter === 'active' ? (
                  <Button
                    onClick={() => setSheetState({ mode: 'create' })}
                    className="px-4 py-2"
                  >
                    Add Account
                  </Button>
                ) : undefined
              }
            />
          ) : (
            <AccountList
              accounts={filteredAccounts}
              onSelect={(account) => setSheetState({ mode: 'edit', account })}
            />
          )}
        </div>
      </div>

      {sheetState && (
        <BottomSheet
          title={sheetState.mode === 'edit' ? 'Edit Account' : 'Add Account'}
          onClose={() => setSheetState(null)}
        >
          <AccountForm
            initialValues={
              sheetState.mode === 'edit'
                ? {
                    name: sheetState.account.name,
                    type: sheetState.account.type,
                    initialBalance: sheetState.account.initialBalance,
                    safetyBuffer: sheetState.account.safetyBuffer,
                    isArchived: sheetState.account.isArchived,
                  }
                : undefined
            }
            onSubmit={
              sheetState.mode === 'edit'
                ? async (values) => handleUpdate(values)
                : handleCreate
            }
            submitLabel={'Save'}
            onCancel={() => setSheetState(null)}
            onArchive={
              sheetState.mode === 'edit' &&
              !sheetState.account.isArchived &&
              !selectedUsage?.canDelete
                ? handleArchive
                : undefined
            }
            onRestore={
              sheetState.mode === 'edit' &&
              sheetState.account.isArchived &&
              !selectedUsage?.canDelete
                ? handleRestore
                : undefined
            }
            onDelete={
              sheetState.mode === 'edit' && selectedUsage?.canDelete
                ? handleDelete
                : undefined
            }
          />
        </BottomSheet>
      )}
    </>
  )
}

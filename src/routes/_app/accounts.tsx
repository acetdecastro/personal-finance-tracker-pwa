import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { Plus } from 'lucide-react'
import { Button } from '#/components/common/Button'
import { BottomSheet } from '#/components/common/BottomSheet'
import { AccountForm } from '#/features/accounts/components/AccountForm'
import { AccountList } from '#/features/accounts/components/AccountList'
import {
  useAccounts,
  useCreateAccount,
  useUpdateAccount,
} from '#/features/accounts/hooks/use-accounts'
import { SectionHeader } from '#/components/common/SectionHeader'
import { EmptyState } from '#/components/common/EmptyState'
import type { Account } from '#/types/domain'
import type {
  CreateAccountInput,
  UpdateAccountInput,
} from '#/features/accounts/schemas/account.schemas'

export const Route = createFileRoute('/_app/accounts')({
  component: AccountsRoute,
})

type SheetState =
  | { mode: 'create' }
  | { mode: 'edit'; account: Account }
  | null

function AccountsRoute() {
  const [sheetState, setSheetState] = useState<SheetState>(null)
  const { data: accounts = [] } = useAccounts()
  const createAccount = useCreateAccount()
  const updateAccount = useUpdateAccount()

  async function handleCreate(values: CreateAccountInput) {
    await createAccount.mutateAsync(values)
    setSheetState(null)
  }

  async function handleUpdate(values: UpdateAccountInput) {
    if (sheetState?.mode !== 'edit') {
      return
    }

    await updateAccount.mutateAsync({
      id: sheetState.account.id,
      changes: values,
    })
    setSheetState(null)
  }

  return (
    <>
      <div className="space-y-6">
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">
            Keep your balances organized and set a dedicated safety buffer for
            each account.
          </p>
        </div>

        <div className="space-y-3">
          <SectionHeader
            title="Accounts"
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
          {accounts.length === 0 ? (
            <EmptyState
              title="No accounts yet"
              description="Add your first account to start tracking balances and reserves."
              action={
                <Button
                  onClick={() => setSheetState({ mode: 'create' })}
                  className="px-4 py-2"
                >
                  Add Account
                </Button>
              }
            />
          ) : (
            <AccountList
              accounts={accounts}
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
            submitLabel={
              sheetState.mode === 'edit' ? 'Save Changes' : 'Add Account'
            }
            onCancel={() => setSheetState(null)}
          />
        </BottomSheet>
      )}
    </>
  )
}

import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { Plus, X } from 'lucide-react'
import { ThemeToggle } from '#/features/settings/components/ThemeToggle'
import { AccountForm } from '#/features/accounts/components/AccountForm'
import { AccountList } from '#/features/accounts/components/AccountList'
import { RecurringRuleForm } from '#/features/recurring/components/RecurringRuleForm'
import { RecurringRuleList } from '#/features/recurring/components/RecurringRuleList'
import { SectionHeader } from '#/components/common/SectionHeader'
import { EmptyState } from '#/components/common/EmptyState'
import {
  useAccounts,
  useCreateAccount,
} from '#/features/accounts/hooks/use-accounts'
import { useCategories } from '#/features/categories/hooks/use-categories'
import {
  useRecurringRules,
  useCreateRecurringRule,
} from '#/features/recurring/hooks/use-recurring-rules'
import type { CreateAccountInput } from '#/features/accounts/schemas/account.schemas'
import type { CreateRecurringRuleInput } from '#/features/recurring/schemas/recurring-rule.schemas'

export const Route = createFileRoute('/_app/settings')({
  component: SettingsRoute,
})

type Sheet = 'account' | 'recurring' | null

function SettingsRoute() {
  const [openSheet, setOpenSheet] = useState<Sheet>(null)

  const { data: accounts = [] } = useAccounts()
  const { data: categories = [] } = useCategories()
  const { data: recurringRules = [] } = useRecurringRules()

  const createAccount = useCreateAccount()
  const createRecurringRule = useCreateRecurringRule()

  async function handleAccountSubmit(values: CreateAccountInput) {
    await createAccount.mutateAsync(values)
    setOpenSheet(null)
  }

  async function handleRecurringSubmit(values: CreateRecurringRuleInput) {
    await createRecurringRule.mutateAsync(values)
    setOpenSheet(null)
  }

  return (
    <>
      <div className="space-y-8">
        {/* Appearance */}
        <div className="space-y-3">
          <SectionHeader title="Appearance" />
          <div className="rounded-2xl bg-white p-4 dark:bg-zinc-900">
            <p className="mb-3 text-sm font-medium text-slate-600 dark:text-slate-400">
              Theme
            </p>
            <ThemeToggle />
          </div>
        </div>

        {/* Accounts */}
        <div className="space-y-3">
          <SectionHeader
            title="Accounts"
            action={
              <button
                onClick={() => setOpenSheet('account')}
                className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-950/30"
              >
                <Plus className="size-3.5" />
                Add
              </button>
            }
          />
          {accounts.length === 0 ? (
            <EmptyState
              title="No accounts"
              description="Add an account to get started."
            />
          ) : (
            <AccountList accounts={accounts} />
          )}
        </div>

        {/* Recurring Rules */}
        <div className="space-y-3">
          <SectionHeader
            title="Recurring Rules"
            action={
              <button
                onClick={() => setOpenSheet('recurring')}
                className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-950/30"
              >
                <Plus className="size-3.5" />
                Add
              </button>
            }
          />
          {recurringRules.length === 0 ? (
            <EmptyState
              title="No recurring rules"
              description="Add salary or fixed expenses for forecasting."
            />
          ) : (
            <RecurringRuleList rules={recurringRules} />
          )}
        </div>

        {/* Import / Export — shell */}
        <div className="space-y-3">
          <SectionHeader title="Data" />
          <div className="rounded-2xl bg-white p-4 dark:bg-zinc-900">
            <p className="mb-3 text-xs text-slate-400 dark:text-slate-500">
              Export and import coming in Phase 5.
            </p>
            <div className="flex gap-3">
              <button
                disabled
                className="flex-1 rounded-xl bg-slate-100 py-2.5 text-sm font-semibold text-slate-400 dark:bg-zinc-800 dark:text-slate-500"
              >
                Export JSON
              </button>
              <button
                disabled
                className="flex-1 rounded-xl bg-slate-100 py-2.5 text-sm font-semibold text-slate-400 dark:bg-zinc-800 dark:text-slate-500"
              >
                Import JSON
              </button>
            </div>
          </div>
        </div>
      </div>

      {openSheet === 'account' && (
        <BottomSheet title="Add Account" onClose={() => setOpenSheet(null)}>
          <AccountForm
            onSubmit={handleAccountSubmit}
            onCancel={() => setOpenSheet(null)}
          />
        </BottomSheet>
      )}

      {openSheet === 'recurring' && (
        <BottomSheet title="Add Recurring Rule" onClose={() => setOpenSheet(null)}>
          <RecurringRuleForm
            accounts={accounts}
            categories={categories}
            onSubmit={handleRecurringSubmit}
            onCancel={() => setOpenSheet(null)}
          />
        </BottomSheet>
      )}
    </>
  )
}

function BottomSheet({
  title,
  onClose,
  children,
}: {
  title: string
  onClose: () => void
  children: React.ReactNode
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex flex-col justify-end bg-black/40"
      onClick={onClose}
    >
      <div
        className="max-h-[90dvh] overflow-y-auto rounded-t-3xl bg-white px-5 pb-8 pt-5 dark:bg-zinc-950"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:text-slate-600 dark:text-slate-500"
          >
            <X className="size-5" />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}

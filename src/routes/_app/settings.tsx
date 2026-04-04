import { useState } from 'react'
import { createFileRoute, Link } from '@tanstack/react-router'
import { Plus } from 'lucide-react'
import { Button } from '#/components/common/Button'
import { BottomSheet } from '#/components/common/BottomSheet'
import { ThemeToggle } from '#/features/settings/components/ThemeToggle'
import { RecurringRuleForm } from '#/features/recurring/components/RecurringRuleForm'
import { RecurringRuleList } from '#/features/recurring/components/RecurringRuleList'
import { SectionHeader } from '#/components/common/SectionHeader'
import { EmptyState } from '#/components/common/EmptyState'
import { useAccounts } from '#/features/accounts/hooks/use-accounts'
import { useCategories } from '#/features/categories/hooks/use-categories'
import {
  useRecurringRules,
  useCreateRecurringRule,
  useUpdateRecurringRule,
} from '#/features/recurring/hooks/use-recurring-rules'
import type { RecurringRule } from '#/types/domain'
import type { CreateRecurringRuleInput } from '#/features/recurring/schemas/recurring-rule.schemas'
import {
  DISABLED_BUTTON_CLS,
  PRIMARY_LINK_BUTTON_CLS,
} from '#/lib/constants/ui-classes'

export const Route = createFileRoute('/_app/settings')({
  component: SettingsRoute,
})

type SheetState =
  | { mode: 'create'; type: 'income' | 'expense' }
  | { mode: 'edit'; rule: RecurringRule }
  | null

function SettingsRoute() {
  const [sheetState, setSheetState] = useState<SheetState>(null)

  const { data: accounts = [] } = useAccounts()
  const { data: categories = [] } = useCategories()
  const { data: recurringRules = [] } = useRecurringRules()
  const createRecurringRule = useCreateRecurringRule()
  const updateRecurringRule = useUpdateRecurringRule()

  async function handleRecurringSubmit(values: CreateRecurringRuleInput) {
    if (sheetState?.mode === 'edit') {
      await updateRecurringRule.mutateAsync({
        id: sheetState.rule.id,
        changes: values,
      })
    } else {
      await createRecurringRule.mutateAsync(values)
    }
    setSheetState(null)
  }

  const recurringType =
    sheetState?.mode === 'edit'
      ? sheetState.rule.type
      : sheetState?.mode === 'create'
        ? sheetState.type
        : null

  return (
    <>
      <div className="space-y-8">
        <div className="space-y-3">
          <SectionHeader title="Appearance" />
          <div className="rounded-2xl bg-card p-4">
            <p className="mb-3 text-sm font-medium text-secondary-foreground">
              Theme
            </p>
            <ThemeToggle />
          </div>
        </div>

        <div className="space-y-3">
          <SectionHeader title="Accounts" />
          <div className="rounded-2xl bg-card p-4">
            <p className="mb-3 text-sm text-muted-foreground">
              Manage accounts and per-account safety buffers from the Accounts
              tab.
            </p>
            <Link
              to="/accounts"
              className={PRIMARY_LINK_BUTTON_CLS}
            >
              Open Accounts
            </Link>
          </div>
        </div>

        <div className="space-y-3">
          <SectionHeader
            title="Recurring Transactions"
            action={
              <div className="flex items-center gap-2">
                <Button
                  onClick={() => setSheetState({ mode: 'create', type: 'income' })}
                  variant="inline-primary"
                >
                  <Plus className="size-3.5" />
                  Income
                </Button>
                <Button
                  onClick={() => setSheetState({ mode: 'create', type: 'expense' })}
                  variant="inline-secondary"
                >
                  <Plus className="size-3.5" />
                  Expense
                </Button>
              </div>
            }
          />
          {recurringRules.length === 0 ? (
            <EmptyState
              title="No recurring transactions"
              description="Add expected salary or fixed expenses for forecasting."
            />
          ) : (
            <RecurringRuleList
              rules={recurringRules}
              onSelect={(rule) => setSheetState({ mode: 'edit', rule })}
            />
          )}
        </div>

        <div className="space-y-3">
          <SectionHeader title="Data" />
          <div className="rounded-2xl bg-card p-4">
            <p className="mb-3 text-xs text-muted-foreground/70">
              Export and import coming in Phase 5.
            </p>
            <div className="flex gap-3">
              <button
                disabled
                className={DISABLED_BUTTON_CLS}
              >
                Export JSON
              </button>
              <button
                disabled
                className={DISABLED_BUTTON_CLS}
              >
                Import JSON
              </button>
            </div>
          </div>
        </div>
      </div>

      {sheetState && (
        <BottomSheet
          title={
            sheetState.mode === 'edit'
              ? 'Edit Recurring Transaction'
              : recurringType === 'expense'
                ? 'Add Recurring Expense'
                : 'Add Recurring Income'
          }
          onClose={() => setSheetState(null)}
        >
          <RecurringRuleForm
            accounts={accounts}
            categories={categories}
            type={recurringType ?? 'income'}
            initialValues={
              sheetState.mode === 'edit' ? sheetState.rule : undefined
            }
            onSubmit={handleRecurringSubmit}
            onCancel={() => setSheetState(null)}
            submitLabel={
              sheetState.mode === 'edit' ? 'Save Changes' : 'Save'
            }
          />
        </BottomSheet>
      )}
    </>
  )
}

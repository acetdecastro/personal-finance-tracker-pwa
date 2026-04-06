import { useRef, useState } from 'react'
import { createFileRoute, Link, useRouter } from '@tanstack/react-router'
import { toast } from 'sonner'
import { useQueryClient } from '@tanstack/react-query'
import { CheckCircle, Download, Minus, Plus, Share } from 'lucide-react'
import { Button } from '#/components/common/Button'
import { BottomSheet } from '#/components/common/BottomSheet'
import { ConfirmDialog } from '#/components/common/ConfirmDialog'
import { ThemeToggle } from '#/features/settings/components/ThemeToggle'
import { RecurringRuleForm } from '#/features/recurring/components/RecurringRuleForm'
import { RecurringRuleList } from '#/features/recurring/components/RecurringRuleList'
import { InfoBanner } from '#/components/common/InfoBanner'
import { cn } from '#/lib/utils/cn'
import { SectionHeader } from '#/components/common/SectionHeader'
import { EmptyState } from '#/components/common/EmptyState'
import { useAccounts } from '#/features/accounts/hooks/use-accounts'
import { useCategories } from '#/features/categories/hooks/use-categories'
import {
  useRecurringRules,
  useCreateRecurringRule,
  useUpdateRecurringRule,
} from '#/features/recurring/hooks/use-recurring-rules'
import {
  exportData,
  parseImportFile,
  importData,
} from '#/services/import-export/import-export.service'
import type { ExportPayload } from '#/services/import-export/import-export.service'
import type { RecurringRule } from '#/types/domain'
import type { CreateRecurringRuleInput } from '#/features/recurring/schemas/recurring-rule.schemas'
import { PRIMARY_LINK_BUTTON_CLS } from '#/lib/constants/ui-classes'
import { useInstallPrompt } from '#/features/settings/hooks/use-install-prompt'
import type { InstallState } from '#/features/settings/hooks/use-install-prompt'
import { resetAllAppData } from '#/services/data-reset/data-reset.service'

export const Route = createFileRoute('/_app/settings')({
  component: SettingsRoute,
})

type SheetState =
  | { mode: 'create'; type: 'income' | 'expense' }
  | { mode: 'edit'; rule: RecurringRule }
  | { mode: 'import-confirm'; payload: ExportPayload }
  | null

type RecurringFilter = 'all' | 'income' | 'expense'

function SettingsRoute() {
  const [sheetState, setSheetState] = useState<SheetState>(null)
  const [recurringFilter, setRecurringFilter] = useState<RecurringFilter>('all')
  const [isExporting, setIsExporting] = useState(false)
  const [isImporting, setIsImporting] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isDeletingAllData, setIsDeletingAllData] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const queryClient = useQueryClient()
  const router = useRouter()

  const { data: accounts = [] } = useAccounts()
  const { data: categories = [] } = useCategories()
  const { data: recurringRules = [] } = useRecurringRules()
  const filteredRules =
    recurringFilter === 'all'
      ? recurringRules
      : recurringRules.filter((r) => r.type === recurringFilter)
  const createRecurringRule = useCreateRecurringRule()
  const updateRecurringRule = useUpdateRecurringRule()

  async function handleRecurringSubmit(values: CreateRecurringRuleInput) {
    try {
      if (sheetState?.mode === 'edit') {
        await updateRecurringRule.mutateAsync({
          id: sheetState.rule.id,
          changes: values,
        })
        toast.success('Recurring transaction updated')
      } else {
        await createRecurringRule.mutateAsync(values)
        toast.success('Recurring transaction added')
      }
      setSheetState(null)
    } catch {
      toast.error(
        sheetState?.mode === 'edit'
          ? 'Failed to update recurring transaction'
          : 'Failed to add recurring transaction',
      )
    }
  }

  async function handleExport() {
    setIsExporting(true)
    try {
      await exportData()
      toast.success('Backup downloaded')
    } catch {
      toast.error('Export failed. Please try again.')
    } finally {
      setIsExporting(false)
    }
  }

  async function handleImportFileChange(
    e: React.ChangeEvent<HTMLInputElement>,
  ) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    try {
      const payload = await parseImportFile(file)
      setSheetState({ mode: 'import-confirm', payload })
    } catch {
      toast.error(
        'Invalid file. Make sure you select a Finance Tracker backup.',
      )
    }
  }

  async function handleImportConfirm(payload: ExportPayload) {
    setIsImporting(true)
    try {
      await importData(payload)
      queryClient.clear()
      setSheetState(null)
      toast.success('Data restored successfully')
      void router.navigate({ to: '/dashboard' })
    } catch {
      toast.error('Import failed. Your data was not changed.')
      setSheetState(null)
    } finally {
      setIsImporting(false)
    }
  }

  async function handleDeleteAllData() {
    setIsDeletingAllData(true)
    try {
      await resetAllAppData()

      queryClient.clear()
      setIsDeleteDialogOpen(false)
      toast.success('All data has been deleted')
      window.location.replace('/')
    } catch {
      toast.error('Failed to delete all data. Please try again.')
    } finally {
      setIsDeletingAllData(false)
    }
  }

  const { installState, triggerInstall } = useInstallPrompt()

  const recurringType =
    sheetState?.mode === 'edit'
      ? sheetState.rule.type
      : sheetState?.mode === 'create'
        ? sheetState.type
        : null

  return (
    <>
      <div className="space-y-8">
        {installState !== 'unavailable' && (
          <div className="space-y-3">
            <SectionHeader title="Install App" />
            <div className="bg-card space-y-3 rounded-2xl p-4 shadow">
              <InstallAppInstructions
                installState={installState}
                triggerInstall={triggerInstall}
              />
            </div>
          </div>
        )}

        <div className="space-y-3">
          <SectionHeader title="Accounts" />
          <div className="bg-card rounded-2xl p-4 shadow">
            <p className="text-muted-foreground mb-3 text-sm">
              Manage accounts and per-account safety buffers from the Accounts
              tab.
            </p>
            <Link to="/accounts" className={PRIMARY_LINK_BUTTON_CLS}>
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
                  onClick={() =>
                    setSheetState({ mode: 'create', type: 'income' })
                  }
                  variant="inline-primary"
                >
                  <Plus className="size-3.5" />
                  Income
                </Button>
                <Button
                  onClick={() =>
                    setSheetState({ mode: 'create', type: 'expense' })
                  }
                  variant="inline-secondary"
                >
                  <Minus className="size-3.5" />
                  Expense
                </Button>
              </div>
            }
          />
          <p className="text-muted-foreground/70 text-xs">
            Used for forecasting. Your actual posted transaction amount can
            differ.
          </p>
          <div className="no-scrollbar flex gap-2 overflow-x-auto px-0.5 py-1">
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
          {filteredRules.length === 0 ? (
            <EmptyState
              title={
                recurringFilter === 'all'
                  ? 'No recurring transactions'
                  : `No ${recurringFilter} rules`
              }
              description="Add expected salary or fixed expenses for forecasting."
            />
          ) : (
            <RecurringRuleList
              rules={filteredRules}
              categories={categories}
              onSelect={(rule) => setSheetState({ mode: 'edit', rule })}
            />
          )}
        </div>

        <div className="space-y-3">
          <SectionHeader title="Appearance" />
          <div className="bg-card rounded-2xl p-4 shadow">
            <p className="text-secondary-foreground mb-3 text-sm font-medium">
              Theme
            </p>
            <ThemeToggle />
          </div>
        </div>

        <div className="space-y-3">
          <SectionHeader title="Data" />
          <div className="bg-card space-y-3 rounded-2xl p-4 shadow">
            <InfoBanner message="Your data is stored locally on this device and browser. Clearing browser data or uninstalling the app may remove it. Export backups regularly." />
            <div className="flex gap-3">
              <Button
                variant="secondary"
                className="flex-1"
                onClick={handleExport}
                disabled={isExporting}
              >
                {isExporting ? 'Exporting…' : 'Export JSON'}
              </Button>
              <Button
                variant="secondary"
                className="flex-1"
                onClick={() => fileInputRef.current?.click()}
                disabled={isImporting}
              >
                {isImporting ? 'Importing…' : 'Import JSON'}
              </Button>
            </div>
            <Button
              variant="secondary"
              className="bg-destructive/10 text-destructive hover:bg-destructive/15 w-full"
              onClick={() => setIsDeleteDialogOpen(true)}
              disabled={isDeletingAllData}
            >
              Delete All Data
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json,application/json"
              className="sr-only"
              onChange={handleImportFileChange}
            />
          </div>
        </div>
      </div>

      {(sheetState?.mode === 'create' || sheetState?.mode === 'edit') && (
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
            submitLabel={'Save'}
          />
        </BottomSheet>
      )}

      {sheetState?.mode === 'import-confirm' && (
        <BottomSheet
          title="Replace all data?"
          onClose={() => setSheetState(null)}
        >
          <div className="space-y-4">
            <p className="text-muted-foreground text-sm">
              This will overwrite all your current data with the backup. This
              cannot be undone.
            </p>
            <ul className="text-foreground space-y-1 text-sm">
              <li>{sheetState.payload.accounts.length} accounts</li>
              <li>{sheetState.payload.transactions.length} transactions</li>
              <li>{sheetState.payload.goals.length} goals</li>
              <li>{sheetState.payload.budgets.length} budgets</li>
              <li>
                {sheetState.payload.recurringRules.length} recurring rules
              </li>
            </ul>
            <div className="flex gap-3">
              <Button
                variant="secondary"
                className="flex-1"
                onClick={() => setSheetState(null)}
              >
                Cancel
              </Button>
              <Button
                variant="secondary"
                className="text-destructive flex-1"
                onClick={() => handleImportConfirm(sheetState.payload)}
              >
                Replace All Data
              </Button>
            </div>
          </div>
        </BottomSheet>
      )}

      {isDeleteDialogOpen && (
        <ConfirmDialog
          title="Delete all data?"
          description="This will permanently remove all data except the default categories and app settings. You will be returned to onboarding after deletion."
          confirmLabel="Delete All Data"
          onCancel={() => setIsDeleteDialogOpen(false)}
          onConfirm={handleDeleteAllData}
          isLoading={isDeletingAllData}
          tone="destructive"
        />
      )}
    </>
  )
}

function InstallAppInstructions({
  installState,
  triggerInstall,
}: {
  installState: InstallState
  triggerInstall: () => Promise<void>
}) {
  if (installState === 'standalone') {
    return (
      <div className="flex items-center gap-3">
        <CheckCircle className="text-primary size-5 shrink-0" />
        <div>
          <p className="text-foreground text-sm font-medium">
            Already installed
          </p>
          <p className="text-muted-foreground text-xs">
            You&apos;re running FinKo as an installed app.
          </p>
        </div>
      </div>
    )
  }

  if (installState === 'promptable') {
    return (
      <>
        <p className="text-muted-foreground text-sm">
          Install FinKo on your device for quick access, offline support, and a
          cleaner app-like experience.
        </p>
        <Button
          onClick={() => void triggerInstall()}
          className="flex items-center gap-2"
        >
          <Download className="size-4" />
          Install App
        </Button>
      </>
    )
  }

  if (installState === 'desktop-chrome') {
    return (
      <>
        <p className="text-muted-foreground text-sm">
          Install FinKo from Chrome&apos;s address bar for quick access and an
          app-like desktop experience.
        </p>
        <ol className="space-y-2">
          {[
            'Click the Install button in Chrome’s address bar',
            'Click "Install" in Chrome’s install dialog',
            'Open FinKo from the installed app',
          ].map((step, i) => (
            <li
              key={i}
              className="text-secondary-foreground flex items-start gap-3 text-sm"
            >
              <span className="bg-primary text-primary-foreground mt-px flex size-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold">
                {i + 1}
              </span>
              <span>{step}</span>
            </li>
          ))}
        </ol>
      </>
    )
  }

  if (installState === 'mac-safari') {
    return (
      <>
        <p className="text-muted-foreground text-sm">
          Install FinKo on your Mac for quick access and an app-like Dock
          experience.
        </p>
        <ol className="space-y-2">
          {[
            'Click the Share button in Safari’s toolbar',
            'Choose "Add to Dock"',
            'Click "Add"',
          ].map((step, i) => (
            <li
              key={i}
              className="text-secondary-foreground flex items-start gap-3 text-sm"
            >
              <span className="bg-primary text-primary-foreground mt-px flex size-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold">
                {i + 1}
              </span>
              <span>{step}</span>
            </li>
          ))}
        </ol>
      </>
    )
  }

  return (
    <>
      <p className="text-muted-foreground text-sm">
        Install FinKo on your iPhone or iPad for quick access and a full-screen
        experience.
      </p>
      <ol className="space-y-2">
        {[
          {
            icon: Share,
            text: "Tap the Share button in Safari's toolbar",
          },
          {
            icon: null,
            text: 'Scroll down and tap "Add to Home Screen"',
          },
          { icon: null, text: 'Tap "Add" to confirm' },
        ].map((step, i) => (
          <li
            key={i}
            className="text-secondary-foreground flex items-start gap-3 text-sm"
          >
            <span className="bg-primary text-primary-foreground mt-px flex size-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold">
              {i + 1}
            </span>
            <span className="flex items-center gap-1.5">
              {step.text}
              {step.icon && <step.icon className="inline size-3.5 shrink-0" />}
            </span>
          </li>
        ))}
      </ol>
    </>
  )
}

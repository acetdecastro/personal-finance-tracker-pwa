import { useRef, useState } from 'react'
import type { ElementType } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import {
  CheckCircle,
  ChevronRight,
  Download,
  FolderOpen,
  Loader2,
} from 'lucide-react'
import { InfoBanner } from '#/components/common/InfoBanner'
import { AccountForm } from '#/features/accounts/components/AccountForm'
import { Button } from '#/components/common/Button'
import { FormField } from '#/components/common/FormField'
import { Input } from '#/components/common/Input'
import { ACCOUNTS_QUERY_KEY } from '#/features/accounts/hooks/use-accounts'
import { BUDGET_PAGE_QUERY_KEY } from '#/features/budgets/hooks/use-budgets'
import { CATEGORIES_QUERY_KEY } from '#/features/categories/hooks/use-categories'
import { DASHBOARD_QUERY_KEY } from '#/features/dashboard/hooks/use-dashboard-data'
import {
  GOALS_QUERY_KEY,
  GOAL_SNAPSHOTS_QUERY_KEY,
  GOAL_USAGE_QUERY_KEY,
} from '#/features/goals/hooks/use-goals'
import { useInstallPrompt } from '#/features/settings/hooks/use-install-prompt'
import type { InstallState } from '#/features/settings/hooks/use-install-prompt'
import {
  getInstallDoneDescription,
  getInstallInstructionContent,
} from '#/features/settings/lib/install-instructions'
import { SETTINGS_SCREEN_QUERY_KEY } from '#/features/settings/hooks/use-settings'
import { USER_SETTINGS_QUERY_KEY } from '#/features/settings/hooks/use-user-settings'
import { mapSettingsToDto } from '#/features/settings/services/settings.service'
import { RECURRING_RULES_QUERY_KEY } from '#/features/recurring/hooks/use-recurring-rules'
import { TRANSACTIONS_QUERY_KEY } from '#/features/transactions/hooks/use-transactions'
import { USER_QUERY_KEY } from '#/features/user/hooks/use-user'
import {
  USER_NAME_MAX_LENGTH,
  userNameSchema,
} from '#/features/user/schemas/user.schemas'
import type { CreateAccountInput } from '#/features/accounts/schemas/account.schemas'
import type { ExportPayload } from '#/services/import-export/import-export.schemas'
import {
  importData,
  parseImportFile,
} from '#/services/import-export/import-export.service'
import { useCompleteOnboarding } from '../hooks/use-onboarding'

type Step =
  | 'intro'
  | 'install'
  | 'import'
  | 'account'
  | 'submitting'
  | 'done'
  | 'error'

interface OnboardingFlowProps {
  onComplete: () => void
}

export function OnboardingFlow({ onComplete }: OnboardingFlowProps) {
  const [step, setStep] = useState<Step>('intro')
  const [userName, setUserName] = useState('')
  const [initialAccount, setInitialAccount] =
    useState<CreateAccountInput | null>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const completeOnboarding = useCompleteOnboarding()
  const { installState, triggerInstall } = useInstallPrompt()

  async function handleFinish(nextAccount = initialAccount) {
    if (!nextAccount) return
    setStep('submitting')
    setSubmitError(null)

    try {
      await completeOnboarding.mutateAsync({
        userName,
        initialAccount: nextAccount,
      })
      setInitialAccount(nextAccount)
      setStep('done')
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Something went wrong'
      setSubmitError(message)
      setStep('error')
    }
  }

  if (step === 'intro') {
    return (
      <IntroNameStep
        onSubmit={(name) => {
          setUserName(name)
          if (installState === 'standalone' || installState === 'unavailable') {
            setStep('import')
          } else {
            setStep('install')
          }
        }}
      />
    )
  }

  if (step === 'install') {
    return (
      <InstallStep
        installState={installState}
        triggerInstall={triggerInstall}
        onNext={() => setStep('import')}
      />
    )
  }

  if (step === 'import') {
    return (
      <ImportStep onImported={onComplete} onSkip={() => setStep('account')} />
    )
  }

  if (step === 'account') {
    return (
      <div className="space-y-6">
        <StepHeader
          current={1}
          total={1}
          title="Your first account"
          desc="Start with one account now. You can add salary, recurring bills, budgets, and more accounts right after setup."
        />
        <AccountForm
          onSubmit={async (values) => {
            setInitialAccount(values)
            await handleFinish(values)
          }}
          submitLabel="Finish Setup"
          showSafetyBuffer
        />
      </div>
    )
  }

  if (step === 'submitting') {
    return (
      <div className="flex flex-col items-center gap-4 py-16 text-center">
        <Loader2 className="text-primary size-8 animate-spin" />
        <p className="text-muted-foreground text-sm">
          Setting up your account…
        </p>
      </div>
    )
  }

  if (step === 'error') {
    return (
      <div className="space-y-6 py-8 text-center">
        <p className="text-destructive text-sm font-semibold">Setup failed</p>
        <p className="text-muted-foreground text-sm">
          {submitError ?? 'An unexpected error occurred.'}
        </p>
        <Button onClick={() => void handleFinish()} className="w-full">
          Try Again
        </Button>
      </div>
    )
  }

  return <DoneStep onComplete={onComplete} />
}

function IntroNameStep({ onSubmit }: { onSubmit: (name: string) => void }) {
  const [name, setName] = useState('')
  const error =
    name.trim().length > 0
      ? userNameSchema.safeParse(name).error?.issues[0]?.message
      : undefined

  const features = [
    {
      title: 'Track every peso',
      desc: 'Log income, expenses, and transfers across multiple accounts.',
    },
    {
      title: 'Budget and save smarter',
      desc: 'Set monthly budgets and track progress toward savings goals.',
    },
    {
      title: 'Private by design',
      desc: 'Your data stays on this device or browser - only you can see it.',
    },
  ]

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const result = userNameSchema.safeParse(name)
    if (result.success) onSubmit(result.data)
  }

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <p className="text-primary text-[11px] font-bold tracking-widest uppercase">
          Welcome to FinKo
        </p>
        <h1 className="text-foreground text-2xl font-extrabold tracking-tight">
          Your personal finance, simplified
        </h1>
        <p className="text-muted-foreground text-sm leading-relaxed">
          A local-first finance tracker built for clarity — no subscriptions, no
          cloud.
        </p>
      </div>

      <div className="space-y-3">
        {features.map((feature) => (
          <div key={feature.title} className="flex gap-3">
            <div className="bg-primary-subtle mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full">
              <CheckCircle className="text-primary size-3.5" />
            </div>
            <div>
              <p className="text-foreground text-sm font-semibold">
                {feature.title}
              </p>
              <p className="text-muted-foreground text-xs leading-relaxed">
                {feature.desc}
              </p>
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField
          label="What should we call you?"
          htmlFor="user-name"
          error={error}
          counter={`${name.length}/${USER_NAME_MAX_LENGTH}`}
        >
          <Input
            id="user-name"
            name="user-name"
            placeholder="e.g. Alex"
            maxLength={USER_NAME_MAX_LENGTH}
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
          />
        </FormField>

        <Button
          type="submit"
          disabled={!name.trim() || !!error}
          className="flex w-full items-center justify-center gap-2"
        >
          Get Started
          <ChevronRight className="size-4" />
        </Button>
      </form>
    </div>
  )
}

function DoneStep({ onComplete }: { onComplete: () => void }) {
  const { installState, triggerInstall } = useInstallPrompt()
  const [isNavigating, setIsNavigating] = useState(false)
  const instructionContent = getInstallInstructionContent(installState)

  async function handleComplete() {
    setIsNavigating(true)
    await new Promise((r) => setTimeout(r, 1000))
    onComplete()
  }

  async function handleInstall() {
    await triggerInstall()
    await handleComplete()
  }

  if (isNavigating) {
    return (
      <div className="flex flex-col items-center gap-4 py-16 text-center">
        <Loader2 className="text-primary size-8 animate-spin" />
        <p className="text-muted-foreground text-sm">
          Taking you to your dashboard…
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center gap-6 py-8 text-center">
      <div className="bg-primary-subtle flex size-16 items-center justify-center rounded-full">
        <CheckCircle className="text-primary size-8" />
      </div>

      <div className="space-y-2">
        <h2 className="text-foreground text-2xl font-extrabold tracking-tight">
          You&apos;re all set!
        </h2>
        <p className="text-muted-foreground text-sm leading-relaxed">
          {getInstallDoneDescription(installState)}
        </p>
      </div>

      <InfoBanner
        className="text-left"
        message="Your data lives only in this browser or device. If you ever switch devices or want to install the app, you can export a backup from Settings and import it on your new device."
      />

      {installState === 'promptable' && (
        <div className="w-full space-y-3">
          <Button
            onClick={handleInstall}
            className="flex w-full items-center justify-center gap-2"
          >
            <Download className="size-4" />
            Install App
          </Button>
          <button
            onClick={handleComplete}
            className="text-muted-foreground hover:text-foreground w-full text-sm transition"
          >
            Skip, go to Dashboard
          </button>
        </div>
      )}

      {instructionContent && installState !== 'promptable' && (
        <div className="w-full space-y-4 text-left">
          <ol className="space-y-2">
            {instructionContent.steps.map((step, index) => (
              <li
                key={index}
                className="text-secondary-foreground flex items-start gap-3 text-sm"
              >
                <span className="bg-primary text-primary-foreground mt-px flex size-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold">
                  {index + 1}
                </span>
                <span className="flex items-center gap-1.5">
                  {step.text}
                  {step.icon && (
                    <step.icon className="inline size-3.5 shrink-0" />
                  )}
                </span>
              </li>
            ))}
          </ol>
          <Button onClick={handleComplete} className="w-full">
            Go to Dashboard
          </Button>
        </div>
      )}

      {(installState === 'standalone' || installState === 'unavailable') && (
        <Button onClick={handleComplete} className="w-full">
          Go to Dashboard
        </Button>
      )}
    </div>
  )
}

function InstallStep({
  installState,
  triggerInstall,
  onNext,
}: {
  installState: InstallState
  triggerInstall: () => Promise<void>
  onNext: () => void
}) {
  const [isInstalling, setIsInstalling] = useState(false)
  const instructionContent = getInstallInstructionContent(installState)

  if (installState === 'promptable') {
    return (
      <div className="space-y-8">
        <div className="space-y-2">
          <p className="text-primary text-[11px] font-bold tracking-widest uppercase">
            {instructionContent?.eyebrow ?? 'Recommended'}
          </p>
          <h2 className="text-foreground text-xl font-bold tracking-tight">
            {instructionContent?.title ?? 'Install FinKo on your device'}
          </h2>
          <p className="text-muted-foreground text-sm leading-relaxed">
            {instructionContent?.description ??
              'Your data is stored locally — installing the app keeps it in the app, not just the browser tab.'}
          </p>
        </div>
        <InfoBanner message="Skipping means your data lives in the browser. If you install later, you may need to export and re-import your data." />
        <div className="space-y-3">
          <Button
            onClick={async () => {
              setIsInstalling(true)
              await triggerInstall()
              setIsInstalling(false)
              onNext()
            }}
            disabled={isInstalling}
            className="flex w-full items-center justify-center gap-2"
          >
            <Download className="size-4" />
            {isInstalling ? 'Installing…' : 'Install App'}
          </Button>
          <button
            type="button"
            onClick={onNext}
            className="text-muted-foreground hover:text-foreground w-full text-sm transition"
          >
            {instructionContent?.skipLabel ?? 'Skip, continue in browser'}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <p className="text-primary text-[11px] font-bold tracking-widest uppercase">
          {instructionContent?.eyebrow ?? 'Recommended'}
        </p>
        <h2 className="text-foreground text-xl font-bold tracking-tight">
          {instructionContent?.title ?? 'Install FinKo on your device'}
        </h2>
        <p className="text-muted-foreground text-sm leading-relaxed">
          {instructionContent?.description ??
            'Install before setting up so your data stays easy to reopen later.'}
        </p>
      </div>
      <ol className="space-y-3">
        {(instructionContent?.steps ?? []).map((step, index) => (
          <li
            key={index}
            className="text-secondary-foreground flex items-start gap-3 text-sm"
          >
            <span className="bg-primary text-primary-foreground mt-px flex size-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold">
              {index + 1}
            </span>
            <span className="flex items-center gap-1.5">
              {step.text}
              {step.icon && <step.icon className="inline size-3.5 shrink-0" />}
            </span>
          </li>
        ))}
      </ol>
      <InfoBanner message="Skipping means your data stays in the browser for now. You can still install later from Settings." />
      <button
        type="button"
        onClick={onNext}
        className="bg-primary text-primary-foreground hover:bg-primary/90 w-full rounded-xl px-4 py-3 text-sm font-semibold transition"
      >
        {instructionContent?.skipLabel ?? 'Skip, continue in browser'}
      </button>
    </div>
  )
}

function ImportStep({
  onImported,
  onSkip,
}: {
  onImported: () => void
  onSkip: () => void
}) {
  const queryClient = useQueryClient()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [payload, setPayload] = useState<ExportPayload | null>(null)
  const [isImporting, setIsImporting] = useState(false)
  const [importSuccess, setImportSuccess] = useState(false)
  const [parseError, setParseError] = useState<string | null>(null)

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setParseError(null)
    try {
      const parsed = await parseImportFile(file)
      setPayload(parsed)
    } catch {
      setParseError(
        'Invalid file. Make sure you select a FinKo backup (.json).',
      )
    }
    e.target.value = ''
  }

  async function handleConfirmImport() {
    if (!payload) return
    setIsImporting(true)
    try {
      await importData(payload)
      const importedUser = payload.users[0] ?? null
      const importedSettings = payload.userSettings[0] ?? null

      queryClient.setQueryData(USER_QUERY_KEY, importedUser)
      queryClient.setQueryData(
        SETTINGS_SCREEN_QUERY_KEY,
        mapSettingsToDto(importedSettings),
      )
      queryClient.setQueryData(USER_SETTINGS_QUERY_KEY, importedSettings)
      queryClient.invalidateQueries({ queryKey: ACCOUNTS_QUERY_KEY })
      queryClient.invalidateQueries({ queryKey: CATEGORIES_QUERY_KEY })
      queryClient.invalidateQueries({ queryKey: TRANSACTIONS_QUERY_KEY })
      queryClient.invalidateQueries({ queryKey: BUDGET_PAGE_QUERY_KEY })
      queryClient.invalidateQueries({ queryKey: DASHBOARD_QUERY_KEY })
      queryClient.invalidateQueries({ queryKey: GOALS_QUERY_KEY })
      queryClient.invalidateQueries({ queryKey: GOAL_SNAPSHOTS_QUERY_KEY })
      queryClient.invalidateQueries({ queryKey: GOAL_USAGE_QUERY_KEY })
      queryClient.invalidateQueries({ queryKey: RECURRING_RULES_QUERY_KEY })
      setImportSuccess(true)
      await new Promise((r) => setTimeout(r, 1000))
      onImported()
    } catch {
      setParseError('Import failed. Your data was not changed.')
      setPayload(null)
    } finally {
      setIsImporting(false)
    }
  }

  if (importSuccess) {
    return (
      <div className="flex flex-col items-center gap-6 py-16 text-center">
        <div className="bg-primary-subtle flex size-16 items-center justify-center rounded-full">
          <CheckCircle className="text-primary size-8" />
        </div>
        <div className="space-y-1">
          <h2 className="text-foreground text-xl font-bold tracking-tight">
            Data restored!
          </h2>
          <p className="text-muted-foreground text-sm">
            Taking you to your dashboard…
          </p>
        </div>
        <Loader2 className="text-muted-foreground size-5 animate-spin" />
      </div>
    )
  }

  if (payload) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <p className="text-primary text-[11px] font-bold tracking-widest uppercase">
            Restore data
          </p>
          <h2 className="text-foreground text-xl font-bold tracking-tight">
            Ready to import
          </h2>
          <p className="text-muted-foreground text-sm leading-relaxed">
            This will replace everything in the app with the data from your
            backup.
          </p>
        </div>

        <div className="bg-input rounded-xl px-4 py-3">
          <p className="text-foreground text-sm font-medium">
            {payload.accounts.length} accounts · {payload.transactions.length}{' '}
            transactions · {payload.budgets.length} budgets
          </p>
          <p className="text-muted-foreground mt-0.5 text-xs">
            Exported on{' '}
            {new Date(payload.metadata.exportedAt).toLocaleDateString()}
          </p>
        </div>

        <div className="flex gap-3">
          <Button
            onClick={() => setPayload(null)}
            variant="secondary"
            fullWidth
            disabled={isImporting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirmImport}
            fullWidth
            disabled={isImporting}
          >
            {isImporting ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="size-4 animate-spin" />
                Importing…
              </span>
            ) : (
              'Restore Data'
            )}
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <p className="text-primary text-[11px] font-bold tracking-widest uppercase">
          Returning user
        </p>
        <h2 className="text-foreground text-xl font-bold tracking-tight">
          Do you have existing data?
        </h2>
        <p className="text-muted-foreground text-sm leading-relaxed">
          If you&apos;ve used FinKo before and exported a backup, you can
          restore it now and skip setup entirely.
        </p>
      </div>

      {parseError && <p className="text-destructive text-sm">{parseError}</p>}

      <div className="space-y-3">
        <Button
          onClick={() => fileInputRef.current?.click()}
          className="flex w-full items-center justify-center gap-2"
        >
          <FolderOpen className="size-4" />
          Import backup file
        </Button>
        <Button onClick={onSkip} variant="secondary" className="w-full">
          No, start fresh
        </Button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept=".json,application/json"
        className="sr-only"
        onChange={handleFileChange}
      />
    </div>
  )
}

function StepHeader({
  current,
  total,
  title,
  desc,
}: {
  current: number
  total: number
  title: string
  desc: string
}) {
  return (
    <div className="space-y-3">
      <StepIndicator current={current} total={total} />
      <div className="space-y-1">
        <h2 className="text-foreground text-xl font-bold tracking-tight">
          {title}
        </h2>
        <p className="text-muted-foreground text-sm leading-relaxed">{desc}</p>
      </div>
    </div>
  )
}

function StepIndicator({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center gap-2">
      {Array.from({ length: total }).map((_, index) => (
        <div
          key={index}
          className={
            index < current
              ? 'bg-primary h-1.5 flex-1 rounded-full'
              : 'bg-muted h-1.5 flex-1 rounded-full'
          }
        />
      ))}
    </div>
  )
}

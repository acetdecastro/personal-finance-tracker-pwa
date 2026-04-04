import { useState } from 'react'
import { CheckCircle, ChevronRight } from 'lucide-react'
import { AccountForm } from '#/features/accounts/components/AccountForm'
import { RecurringRuleForm } from '#/features/recurring/components/RecurringRuleForm'
import { useCreateAccount, useAccounts } from '#/features/accounts/hooks/use-accounts'
import { useCategories } from '#/features/categories/hooks/use-categories'
import { useCreateRecurringRule } from '#/features/recurring/hooks/use-recurring-rules'
import { useUpdateUserSettings } from '#/features/settings/hooks/use-user-settings'
import type { CreateAccountInput } from '#/features/accounts/schemas/account.schemas'
import type { CreateRecurringRuleInput } from '#/features/recurring/schemas/recurring-rule.schemas'

type Step = 'welcome' | 'account' | 'salary' | 'expenses' | 'done'

interface OnboardingFlowProps {
  onComplete: () => void
}

export function OnboardingFlow({ onComplete }: OnboardingFlowProps) {
  const [step, setStep] = useState<Step>('welcome')

  const { data: accounts = [] } = useAccounts()
  const { data: categories = [] } = useCategories()

  const createAccount = useCreateAccount()
  const createRecurringRule = useCreateRecurringRule()
  const updateSettings = useUpdateUserSettings()

  const salaryCategory = categories.find(
    (c) => c.id === 'category-income-salary',
  )

  async function handleAccountSubmit(values: CreateAccountInput) {
    await createAccount.mutateAsync(values)
    setStep('salary')
  }

  async function handleSalarySubmit(values: CreateRecurringRuleInput) {
    await createRecurringRule.mutateAsync(values)
    setStep('expenses')
  }

  async function handleExpenseSubmit(values: CreateRecurringRuleInput) {
    await createRecurringRule.mutateAsync(values)
    setStep('done')
  }

  async function handleComplete() {
    await updateSettings.mutateAsync({ hasCompletedOnboarding: true })
    onComplete()
  }

  if (step === 'welcome') {
    return (
      <div className="space-y-8">
        <div className="space-y-2">
          <p className="text-[11px] font-bold uppercase tracking-widest text-emerald-700 dark:text-emerald-400">
            Welcome
          </p>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
            Let&apos;s get you set up
          </h1>
          <p className="text-sm leading-relaxed text-slate-500 dark:text-slate-400">
            Takes about 2 minutes. You can always change these later in Settings.
          </p>
        </div>

        <div className="space-y-3">
          {[
            'Add your main account',
            'Set up your salary',
            'Add recurring expenses (optional)',
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
              <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-emerald-700 text-xs font-bold text-white dark:bg-emerald-600">
                {i + 1}
              </div>
              {item}
            </div>
          ))}
        </div>

        <button
          onClick={() => setStep('account')}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-700 py-3 text-sm font-semibold text-white transition active:scale-[0.98] dark:bg-emerald-600"
        >
          Get Started
          <ChevronRight className="size-4" />
        </button>
      </div>
    )
  }

  if (step === 'account') {
    return (
      <div className="space-y-6">
        <div className="space-y-1">
          <StepIndicator current={1} total={3} />
          <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Add your main account
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Where do you keep most of your money?
          </p>
        </div>
        <AccountForm
          onSubmit={handleAccountSubmit}
          submitLabel="Continue"
        />
      </div>
    )
  }

  if (step === 'salary') {
    return (
      <div className="space-y-6">
        <div className="space-y-1">
          <StepIndicator current={2} total={3} />
          <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Set up your salary
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            How much do you earn and how often?
          </p>
        </div>
        <RecurringRuleForm
          accounts={accounts}
          categories={categories}
          type="income"
          defaultName="Salary"
          defaultCategoryId={salaryCategory?.id ?? ''}
          onSubmit={handleSalarySubmit}
          onCancel={() => setStep('account')}
          submitLabel="Continue"
        />
      </div>
    )
  }

  if (step === 'expenses') {
    return (
      <div className="space-y-6">
        <div className="space-y-1">
          <StepIndicator current={3} total={3} />
          <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Add a recurring expense
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Rent, utilities, subscriptions — add one now or skip.
          </p>
        </div>
        <RecurringRuleForm
          accounts={accounts}
          categories={categories}
          type="expense"
          onSubmit={handleExpenseSubmit}
          onCancel={() => setStep('done')}
          submitLabel="Add Expense"
        />
        <button
          onClick={() => setStep('done')}
          className="w-full rounded-xl bg-slate-100 py-3 text-sm font-semibold text-slate-600 transition active:scale-[0.98] dark:bg-zinc-800 dark:text-slate-300"
        >
          Skip for now
        </button>
      </div>
    )
  }

  // done
  return (
    <div className="flex flex-col items-center gap-6 py-8 text-center">
      <div className="flex size-16 items-center justify-center rounded-full bg-emerald-50 dark:bg-emerald-950/30">
        <CheckCircle className="size-8 text-emerald-700 dark:text-emerald-400" />
      </div>
      <div className="space-y-2">
        <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
          You&apos;re all set!
        </h2>
        <p className="text-sm leading-relaxed text-slate-500 dark:text-slate-400">
          Your dashboard is ready. Start logging transactions to see your cash position.
        </p>
      </div>
      <button
        onClick={handleComplete}
        className="w-full rounded-xl bg-emerald-700 py-3 text-sm font-semibold text-white transition active:scale-[0.98] dark:bg-emerald-600"
      >
        Go to Dashboard
      </button>
    </div>
  )
}

function StepIndicator({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center gap-1.5 pb-1">
      {Array.from({ length: total }, (_, i) => (
        <div
          key={i}
          className={`h-1 rounded-full transition-all ${
            i < current
              ? 'flex-1 bg-emerald-700 dark:bg-emerald-500'
              : 'flex-none w-6 bg-slate-200 dark:bg-zinc-700'
          }`}
        />
      ))}
    </div>
  )
}

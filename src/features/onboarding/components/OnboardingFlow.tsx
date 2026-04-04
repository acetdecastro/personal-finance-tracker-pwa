import { useState } from 'react'
import { useForm } from '@tanstack/react-form'
import { format, getDate } from 'date-fns'
import {
  CheckCircle,
  ChevronRight,
  Loader2,
  Plus,
  Trash2,
} from 'lucide-react'
import { AccountForm } from '#/features/accounts/components/AccountForm'
import { FormField } from '#/components/common/FormField'
import { SelectInput } from '#/components/common/SelectInput'
import { toStoredDate } from '#/lib/dates'
import { useOnboardingBootstrap, useCompleteOnboarding } from '../hooks/use-onboarding'
import type { CreateAccountInput } from '#/features/accounts/schemas/account.schemas'
import type { CompleteOnboardingInput } from '../schemas/onboarding.schemas'
import type { CategoryOptionDto } from '#/types/dto'

type Step =
  | 'welcome'
  | 'account'
  | 'salary'
  | 'expenses'
  | 'submitting'
  | 'done'
  | 'error'

type SalaryDraft = CompleteOnboardingInput['salary']
type ExpenseDraft = CompleteOnboardingInput['recurringExpenses'][number]

const CADENCE_OPTIONS = [
  { value: 'semi-monthly', label: 'Semi-monthly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'weekly', label: 'Weekly' },
] as const

const WEEKLY_INTERVAL_OPTIONS = [
  { value: '1', label: 'Every week' },
  { value: '2', label: 'Every 2 weeks' },
  { value: '3', label: 'Every 3 weeks' },
  { value: '4', label: 'Every 4 weeks' },
] as const

const INPUT_CLS =
  'w-full rounded-xl bg-input px-4 py-3 text-sm text-foreground outline-none ring-1 ring-border transition focus:ring-2 focus:ring-ring'

const BTN_PRIMARY =
  'flex-1 rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground transition active:scale-[0.98] disabled:opacity-50'

const BTN_SECONDARY =
  'flex-1 rounded-xl bg-muted py-3 text-sm font-semibold text-secondary-foreground transition active:scale-[0.98]'

interface OnboardingFlowProps {
  onComplete: () => void
}

export function OnboardingFlow({ onComplete }: OnboardingFlowProps) {
  const [step, setStep] = useState<Step>('welcome')
  const [primaryAccount, setPrimaryAccount] =
    useState<CreateAccountInput | null>(null)
  const [salary, setSalary] = useState<SalaryDraft | null>(null)
  const [recurringExpenses, setRecurringExpenses] = useState<ExpenseDraft[]>([])
  const [submitError, setSubmitError] = useState<string | null>(null)

  const { data: bootstrap, isLoading: bootstrapLoading } =
    useOnboardingBootstrap()
  const completeOnboarding = useCompleteOnboarding()

  async function handleFinish() {
    if (!primaryAccount || !salary) return
    setStep('submitting')
    setSubmitError(null)
    try {
      await completeOnboarding.mutateAsync({
        primaryAccount,
        salary,
        recurringExpenses,
      })
      setStep('done')
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Something went wrong'
      setSubmitError(message)
      setStep('error')
    }
  }

  if (step === 'welcome') {
    return <WelcomeStep onStart={() => setStep('account')} />
  }

  if (step === 'account') {
    return (
      <div className="space-y-6">
        <StepHeader
          current={1}
          total={3}
          title="Your main account"
          desc="Where do you keep most of your money, and how much should stay untouched?"
        />
        <AccountForm
          onSubmit={async (values) => {
            setPrimaryAccount(values)
            setStep('salary')
          }}
          submitLabel="Continue"
          showSafetyBuffer
        />
      </div>
    )
  }

  if (step === 'salary') {
    return (
      <div className="space-y-6">
        <StepHeader
          current={2}
          total={3}
          title="Your salary"
          desc="How much do you earn and when does it arrive?"
        />
        <SalaryStep
          onSubmit={(values) => {
            setSalary(values)
            setStep('expenses')
          }}
          onBack={() => setStep('account')}
        />
      </div>
    )
  }

  if (step === 'expenses') {
    return (
      <div className="space-y-6">
        <StepHeader
          current={3}
          total={3}
          title="Recurring expenses"
          desc="Rent, subscriptions, utilities. Skip if you want to add these later."
        />
        <ExpensesStep
          categoryOptions={bootstrap?.expenseCategoryOptions ?? []}
          isLoadingCategories={bootstrapLoading}
          expenses={recurringExpenses}
          onAdd={(expense) =>
            setRecurringExpenses((prev) => [...prev, expense])
          }
          onRemove={(index) =>
            setRecurringExpenses((prev) => prev.filter((_, i) => i !== index))
          }
          onFinish={handleFinish}
          onBack={() => setStep('salary')}
        />
      </div>
    )
  }

  if (step === 'submitting') {
    return (
      <div className="flex flex-col items-center gap-4 py-16 text-center">
        <Loader2 className="size-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">
          Setting up your account…
        </p>
      </div>
    )
  }

  if (step === 'error') {
    return (
      <div className="space-y-6 py-8 text-center">
        <p className="text-sm font-semibold text-destructive">
          Setup failed
        </p>
        <p className="text-sm text-muted-foreground">
          {submitError ?? 'An unexpected error occurred.'}
        </p>
        <button onClick={handleFinish} className={BTN_PRIMARY}>
          Try Again
        </button>
      </div>
    )
  }

  // done
  return <DoneStep onComplete={onComplete} />
}

// ─── Sub-steps ────────────────────────────────────────────────────────────────

function WelcomeStep({ onStart }: { onStart: () => void }) {
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <p className="text-[11px] font-bold uppercase tracking-widest text-primary">
          Welcome
        </p>
        <h1 className="text-2xl font-extrabold tracking-tight text-foreground">
          Let&apos;s get you set up
        </h1>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Takes about 2 minutes. You can always change these later in Accounts
          and Settings.
        </p>
      </div>

      <div className="space-y-3">
        {[
          'Add your main account',
          'Set up your salary',
          'Add recurring expenses (optional)',
        ].map((item, i) => (
          <div
            key={i}
            className="flex items-center gap-3 text-sm text-secondary-foreground"
          >
            <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
              {i + 1}
            </div>
            {item}
          </div>
        ))}
      </div>

      <button
        onClick={onStart}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground transition active:scale-[0.98]"
      >
        Get Started
        <ChevronRight className="size-4" />
      </button>
    </div>
  )
}

function DoneStep({ onComplete }: { onComplete: () => void }) {
  return (
    <div className="flex flex-col items-center gap-6 py-8 text-center">
      <div className="flex size-16 items-center justify-center rounded-full bg-primary-subtle">
        <CheckCircle className="size-8 text-primary" />
      </div>
      <div className="space-y-2">
        <h2 className="text-2xl font-extrabold tracking-tight text-foreground">
          You&apos;re all set!
        </h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Your dashboard is ready. Start logging transactions to track your cash
          position.
        </p>
      </div>
      <button
        onClick={onComplete}
        className="w-full rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground transition active:scale-[0.98]"
      >
        Go to Dashboard
      </button>
    </div>
  )
}

function SalaryStep({
  onSubmit,
  onBack,
}: {
  onSubmit: (values: SalaryDraft) => void
  onBack: () => void
}) {
  const today = format(new Date(), 'yyyy-MM-dd')

  const form = useForm({
    defaultValues: {
      name: 'Salary',
      amount: '' as unknown as number,
      cadence: 'semi-monthly' as SalaryDraft['cadence'],
      semiMonthlyDay1: '15',
      semiMonthlyDay2: '30',
      monthlyDay: '1',
      weeklyInterval: '1',
      nextOccurrenceDate: today,
    },
    onSubmit: ({ value }) => {
      const cadence = value.cadence
      const parsedNextOccurrenceDate = new Date(
        value.nextOccurrenceDate + 'T00:00:00.000Z',
      )
      onSubmit({
        name: value.name.trim() || 'Salary',
        amount: Number(value.amount),
        cadence,
        semiMonthlyDays:
          cadence === 'semi-monthly'
            ? [Number(value.semiMonthlyDay1), Number(value.semiMonthlyDay2)]
            : null,
        monthlyDay:
          cadence === 'monthly' ? getDate(parsedNextOccurrenceDate) : null,
        weeklyInterval:
          cadence === 'weekly' ? Number(value.weeklyInterval) : null,
        nextOccurrenceDate: toStoredDate(parsedNextOccurrenceDate),
      })
    },
  })

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        form.handleSubmit()
      }}
      className="space-y-4"
    >
      <form.Field
        name="name"
        validators={{
          onChange: ({ value }) =>
            !value.trim() ? 'Name is required' : undefined,
        }}
      >
        {(field) => (
          <FormField
            label="Label"
            error={field.state.meta.errors[0]?.toString()}
          >
            <input
              className={INPUT_CLS}
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              onBlur={field.handleBlur}
            />
          </FormField>
        )}
      </form.Field>

      <form.Field
        name="amount"
        validators={{
          onChange: ({ value }) => {
            const n = Number(value)
            if (!value || isNaN(n) || n <= 0) return 'Enter a valid amount'
            return undefined
          },
        }}
      >
        {(field) => (
          <FormField
            label="Amount"
            required
            error={field.state.meta.errors[0]?.toString()}
          >
            <div className="relative">
              <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-lg font-bold text-muted-foreground">
                ₱
              </span>
              <input
                type="number"
                inputMode="decimal"
                step="0.01"
                min="0.01"
                placeholder="0.00"
                autoFocus
                className="w-full rounded-xl bg-input py-3 pl-9 pr-4 text-lg font-bold text-foreground outline-none ring-1 ring-border transition focus:ring-2 focus:ring-ring"
                value={field.state.value as unknown as string}
                onChange={(e) =>
                  field.handleChange(e.target.value as unknown as number)
                }
                onBlur={field.handleBlur}
              />
            </div>
          </FormField>
        )}
      </form.Field>

      <form.Field name="cadence">
        {(field) => (
          <FormField label="Frequency" required>
            <div className="grid grid-cols-3 gap-2">
              {CADENCE_OPTIONS.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => field.handleChange(c.value)}
                  className={`rounded-xl px-3 py-2.5 text-xs font-semibold transition ${
                    field.state.value === c.value
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-secondary-foreground'
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </FormField>
        )}
      </form.Field>

      <form.Subscribe selector={(s) => s.values.cadence}>
        {(cadence) => (
          <>
            {cadence === 'semi-monthly' && (
              <div className="grid grid-cols-2 gap-3">
                <form.Field name="semiMonthlyDay1">
                  {(field) => (
                    <FormField
                      label="1st occurrence"
                      hint="Calendar day for the first monthly occurrence"
                    >
                      <input
                        type="number"
                        min="1"
                        max="31"
                        className={INPUT_CLS}
                        value={field.state.value}
                        onChange={(e) => field.handleChange(e.target.value)}
                      />
                    </FormField>
                  )}
                </form.Field>
                <form.Field name="semiMonthlyDay2">
                  {(field) => (
                    <FormField
                      label="2nd occurrence"
                      hint="Calendar day for the second monthly occurrence"
                    >
                      <input
                        type="number"
                        min="1"
                        max="31"
                        className={INPUT_CLS}
                        value={field.state.value}
                        onChange={(e) => field.handleChange(e.target.value)}
                      />
                    </FormField>
                  )}
                </form.Field>
              </div>
            )}
            {cadence === 'weekly' && (
              <form.Field name="weeklyInterval">
                {(field) => (
                  <FormField
                    label="Frequency"
                    hint="Choose a weekly interval up to every 4 weeks"
                  >
                    <SelectInput
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                    >
                      {WEEKLY_INTERVAL_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </SelectInput>
                  </FormField>
                )}
              </form.Field>
            )}
          </>
        )}
      </form.Subscribe>

      <form.Field name="nextOccurrenceDate">
        {(field) => (
          <form.Subscribe selector={(s) => s.values.cadence}>
            {(cadence) => (
              <FormField
                label="Next pay date"
                hint={
                  cadence === 'monthly'
                    ? 'We use this date to determine the repeating day each month.'
                    : cadence === 'semi-monthly'
                      ? 'Choose whichever of the two monthly occurrences comes next.'
                      : 'Choose the next expected weekly salary date.'
                }
              >
                <input
                  type="date"
                  className={INPUT_CLS}
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                />
              </FormField>
            )}
          </form.Subscribe>
        )}
      </form.Field>

      <div className="flex gap-3 pt-2">
        <button type="button" onClick={onBack} className={BTN_SECONDARY}>
          Back
        </button>
        <form.Subscribe selector={(s) => [s.canSubmit, s.isSubmitting]}>
          {([canSubmit, isSubmitting]) => (
            <button
              type="submit"
              disabled={!canSubmit || !!isSubmitting}
              className={BTN_PRIMARY}
            >
              {isSubmitting ? 'Saving…' : 'Continue'}
            </button>
          )}
        </form.Subscribe>
      </div>
    </form>
  )
}

function ExpensesStep({
  categoryOptions,
  isLoadingCategories,
  expenses,
  onAdd,
  onRemove,
  onFinish,
  onBack,
}: {
  categoryOptions: CategoryOptionDto[]
  isLoadingCategories: boolean
  expenses: ExpenseDraft[]
  onAdd: (expense: ExpenseDraft) => void
  onRemove: (index: number) => void
  onFinish: () => void
  onBack: () => void
}) {
  const [showForm, setShowForm] = useState(false)

  return (
    <div className="space-y-4">
      {/* Added expenses list */}
      {expenses.length > 0 && (
        <div className="space-y-2">
          {expenses.map((expense, i) => (
            <div
              key={i}
              className="flex items-center justify-between rounded-xl bg-input px-4 py-3"
            >
              <div>
                <p className="text-sm font-semibold text-foreground">
                  {expense.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {expense.cadence} · ₱{expense.amount.toLocaleString()}
                </p>
              </div>
              <button
                onClick={() => onRemove(i)}
                className="rounded-lg p-1.5 text-muted-foreground transition hover:text-destructive"
              >
                <Trash2 className="size-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Inline add form */}
      {showForm ? (
        <ExpenseAddForm
          categoryOptions={categoryOptions}
          isLoadingCategories={isLoadingCategories}
          onAdd={(expense) => {
            onAdd(expense)
            setShowForm(false)
          }}
          onCancel={() => setShowForm(false)}
        />
      ) : (
        <button
          type="button"
          onClick={() => setShowForm(true)}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-border py-3 text-sm font-medium text-muted-foreground transition hover:border-primary hover:text-primary"
        >
          <Plus className="size-4" />
          Add a recurring expense
        </button>
      )}

      <div className="flex gap-3 pt-2">
        <button type="button" onClick={onBack} className={BTN_SECONDARY}>
          Back
        </button>
        <button type="button" onClick={onFinish} className={BTN_PRIMARY}>
          {expenses.length === 0 ? 'Skip & Finish' : 'Finish Setup'}
        </button>
      </div>
    </div>
  )
}

function ExpenseAddForm({
  categoryOptions,
  isLoadingCategories,
  onAdd,
  onCancel,
}: {
  categoryOptions: CategoryOptionDto[]
  isLoadingCategories: boolean
  onAdd: (expense: ExpenseDraft) => void
  onCancel: () => void
}) {
  const today = format(new Date(), 'yyyy-MM-dd')

  const form = useForm({
    defaultValues: {
      name: '',
      amount: '' as unknown as number,
      categoryId: categoryOptions[0]?.value ?? '',
      cadence: 'monthly' as ExpenseDraft['cadence'],
      semiMonthlyDay1: '15',
      semiMonthlyDay2: '30',
      monthlyDay: '1',
      weeklyInterval: '1',
      nextOccurrenceDate: today,
    },
    onSubmit: ({ value }) => {
      const cadence = value.cadence
      const parsedNextOccurrenceDate = new Date(
        value.nextOccurrenceDate + 'T00:00:00.000Z',
      )
      onAdd({
        name: value.name.trim(),
        amount: Number(value.amount),
        categoryId: value.categoryId,
        cadence,
        semiMonthlyDays:
          cadence === 'semi-monthly'
            ? [Number(value.semiMonthlyDay1), Number(value.semiMonthlyDay2)]
            : null,
        monthlyDay:
          cadence === 'monthly' ? getDate(parsedNextOccurrenceDate) : null,
        weeklyInterval:
          cadence === 'weekly' ? Number(value.weeklyInterval) : null,
        nextOccurrenceDate: toStoredDate(parsedNextOccurrenceDate),
      })
    },
  })

  return (
    <div className="rounded-xl bg-input p-4">
      <form
        onSubmit={(e) => {
          e.preventDefault()
          form.handleSubmit()
        }}
        className="space-y-3"
      >
        <form.Field
          name="name"
          validators={{
            onChange: ({ value }) =>
              !value.trim() ? 'Name is required' : undefined,
          }}
        >
          {(field) => (
            <FormField
              label="Name"
              required
              error={field.state.meta.errors[0]?.toString()}
            >
              <input
                autoFocus
                placeholder="e.g. Rent, Netflix"
                className={INPUT_CLS}
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                onBlur={field.handleBlur}
              />
            </FormField>
          )}
        </form.Field>

        <form.Field
          name="amount"
          validators={{
            onChange: ({ value }) => {
              const n = Number(value)
              if (!value || isNaN(n) || n <= 0) return 'Enter a valid amount'
              return undefined
            },
          }}
        >
          {(field) => (
            <FormField
              label="Amount"
              required
              error={field.state.meta.errors[0]?.toString()}
            >
              <div className="relative">
                <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm font-medium text-muted-foreground">
                  ₱
                </span>
                <input
                  type="number"
                  inputMode="decimal"
                  step="0.01"
                  min="0.01"
                  placeholder="0.00"
                  className="w-full rounded-xl bg-input py-3 pl-8 pr-4 text-sm text-foreground outline-none ring-1 ring-border transition focus:ring-2 focus:ring-ring"
                  value={field.state.value as unknown as string}
                  onChange={(e) =>
                    field.handleChange(e.target.value as unknown as number)
                  }
                  onBlur={field.handleBlur}
                />
              </div>
            </FormField>
          )}
        </form.Field>

        <form.Field
          name="categoryId"
          validators={{
            onChange: ({ value }) =>
              !value ? 'Select a category' : undefined,
          }}
        >
          {(field) => (
            <FormField
              label="Category"
              required
              error={field.state.meta.errors[0]?.toString()}
            >
              <SelectInput
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                disabled={isLoadingCategories}
              >
                <option value="">
                  {isLoadingCategories ? 'Loading…' : 'Select category'}
                </option>
                {categoryOptions.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </SelectInput>
            </FormField>
          )}
        </form.Field>

        <form.Field name="cadence">
          {(field) => (
            <FormField label="Frequency">
              <div className="grid grid-cols-3 gap-2">
                {CADENCE_OPTIONS.map((c) => (
                  <button
                    key={c.value}
                    type="button"
                    onClick={() => field.handleChange(c.value)}
                    className={`rounded-xl px-3 py-2 text-xs font-semibold transition ${
                      field.state.value === c.value
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-card text-secondary-foreground'
                    }`}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            </FormField>
          )}
        </form.Field>

        <form.Subscribe selector={(s) => s.values.cadence}>
          {(cadence) => (
            <>
              {cadence === 'semi-monthly' && (
                <div className="grid grid-cols-2 gap-3">
                  <form.Field name="semiMonthlyDay1">
                    {(field) => (
                      <FormField
                        label="1st occurrence"
                        hint="Calendar day for the first monthly occurrence"
                      >
                        <input
                          type="number"
                          min="1"
                          max="31"
                          className={INPUT_CLS}
                          value={field.state.value}
                          onChange={(e) => field.handleChange(e.target.value)}
                        />
                      </FormField>
                    )}
                  </form.Field>
                  <form.Field name="semiMonthlyDay2">
                    {(field) => (
                      <FormField
                        label="2nd occurrence"
                        hint="Calendar day for the second monthly occurrence"
                      >
                        <input
                          type="number"
                          min="1"
                          max="31"
                          className={INPUT_CLS}
                          value={field.state.value}
                          onChange={(e) => field.handleChange(e.target.value)}
                        />
                      </FormField>
                    )}
                  </form.Field>
                </div>
              )}
              {cadence === 'weekly' && (
                <form.Field name="weeklyInterval">
                  {(field) => (
                    <FormField
                      label="Frequency"
                      hint="Choose a weekly interval up to every 4 weeks"
                    >
                      <SelectInput
                        value={field.state.value}
                        onChange={(e) => field.handleChange(e.target.value)}
                      >
                        {WEEKLY_INTERVAL_OPTIONS.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </SelectInput>
                    </FormField>
                  )}
                </form.Field>
              )}
            </>
          )}
        </form.Subscribe>

        <form.Field name="nextOccurrenceDate">
          {(field) => (
            <form.Subscribe selector={(s) => s.values.cadence}>
              {(cadence) => (
                <FormField
                  label="Next occurrence"
                  hint={
                    cadence === 'monthly'
                      ? 'We use this date to determine the repeating day each month.'
                      : cadence === 'semi-monthly'
                        ? 'Choose whichever of the two monthly occurrences comes next.'
                        : 'Choose the next expected weekly occurrence.'
                  }
                >
                  <input
                    type="date"
                    className={INPUT_CLS}
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                </FormField>
              )}
            </form.Subscribe>
          )}
        </form.Field>

        <div className="flex gap-2 pt-1">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 rounded-xl bg-card py-2.5 text-sm font-semibold text-secondary-foreground transition active:scale-[0.98]"
          >
            Cancel
          </button>
          <form.Subscribe selector={(s) => [s.canSubmit, s.isSubmitting]}>
            {([canSubmit, isSubmitting]) => (
              <button
                type="submit"
                disabled={!canSubmit || !!isSubmitting}
                className={BTN_PRIMARY}
              >
                {isSubmitting ? 'Adding…' : 'Add'}
              </button>
            )}
          </form.Subscribe>
        </div>
      </form>
    </div>
  )
}

// ─── Shared UI ─────────────────────────────────────────────────────────────────

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
    <div className="space-y-2">
      <StepIndicator current={current} total={total} />
      <h2 className="text-xl font-bold tracking-tight text-foreground">
        {title}
      </h2>
      <p className="text-sm text-muted-foreground">{desc}</p>
    </div>
  )
}

function StepIndicator({
  current,
  total,
}: {
  current: number
  total: number
}) {
  return (
    <div className="flex items-center gap-1.5 pb-1">
      {Array.from({ length: total }, (_, i) => (
        <div
          key={i}
          className={`h-1 rounded-full transition-all ${
            i < current
              ? 'flex-1 bg-primary'
              : 'w-6 flex-none bg-muted'
          }`}
        />
      ))}
    </div>
  )
}

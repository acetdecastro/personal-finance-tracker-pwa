import { useState } from 'react'
import { useForm } from '@tanstack/react-form'
import { format, getDate } from 'date-fns'
import { CheckCircle, ChevronRight, Loader2, Plus, Trash2 } from 'lucide-react'
import { InfoBanner } from '#/components/common/InfoBanner'
import { AccountForm } from '#/features/accounts/components/AccountForm'
import { Button } from '#/components/common/Button'
import { CurrencyInput } from '#/components/common/CurrencyInput'
import { DateInput } from '#/components/common/DateInput'
import { FormField } from '#/components/common/FormField'
import { Input } from '#/components/common/Input'
import { SelectInput } from '#/components/common/SelectInput'
import { toStoredDate } from '#/lib/dates'
import { ENTITY_NAME_MAX_LENGTH, MONEY_MAX_AMOUNT } from '#/lib/utils/schema'
import { cn } from '#/lib/utils/cn'
import {
  useOnboardingBootstrap,
  useCompleteOnboarding,
} from '../hooks/use-onboarding'
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
        <Button onClick={handleFinish} fullWidth>
          Try Again
        </Button>
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
        <p className="text-primary text-[11px] font-bold tracking-widest uppercase">
          Welcome
        </p>
        <h1 className="text-foreground text-2xl font-extrabold tracking-tight">
          Let&apos;s get you set up
        </h1>
        <p className="text-muted-foreground text-sm leading-relaxed">
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
            className="text-secondary-foreground flex items-center gap-3 text-sm"
          >
            <div className="bg-primary text-primary-foreground flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-bold">
              {i + 1}
            </div>
            {item}
          </div>
        ))}
      </div>

      <InfoBanner message="Your data is stored locally on this device and browser. Clearing browser data or uninstalling the app may remove it. Export backups regularly." />

      <Button
        onClick={onStart}
        className="flex w-full items-center justify-center gap-2"
      >
        Get Started
        <ChevronRight className="size-4" />
      </Button>
    </div>
  )
}

function DoneStep({ onComplete }: { onComplete: () => void }) {
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
          Your dashboard is ready. Start logging transactions to track your cash
          position.
        </p>
      </div>
      <Button onClick={onComplete} className="w-full">
        Go to Dashboard
      </Button>
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
          onChange: ({ value }) => {
            const trimmedValue = value.trim()

            if (!trimmedValue) {
              return 'Name is required'
            }

            if (trimmedValue.length > ENTITY_NAME_MAX_LENGTH) {
              return `Name must be ${ENTITY_NAME_MAX_LENGTH} characters or fewer`
            }

            return undefined
          },
        }}
      >
        {(field) => (
          <FormField
            label="Label"
            htmlFor="salary-name"
            error={field.state.meta.errors[0]?.toString()}
            counter={`${field.state.value.length}/${ENTITY_NAME_MAX_LENGTH}`}
          >
            <Input
              id="salary-name"
              name="salary-name"
              maxLength={ENTITY_NAME_MAX_LENGTH}
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
            if (n > MONEY_MAX_AMOUNT) {
              return `Amount can't be greater than ${MONEY_MAX_AMOUNT.toLocaleString()}`
            }
            return undefined
          },
        }}
      >
        {(field) => (
          <FormField
            label="Amount"
            htmlFor="salary-amount"
            required
            error={field.state.meta.errors[0]?.toString()}
          >
            <CurrencyInput
              id="salary-amount"
              name="salary-amount"
              autoFocus
              className="pr-4 pl-9 text-lg"
              value={field.state.value as unknown as string}
              onChange={(e) =>
                field.handleChange(e.target.value as unknown as number)
              }
              onBlur={field.handleBlur}
            />
          </FormField>
        )}
      </form.Field>

      <form.Field name="cadence">
        {(field) => (
          <FormField label="Frequency" required>
            <div className="grid grid-cols-3 gap-2">
              {CADENCE_OPTIONS.map((c) => (
                <Button
                  key={c.value}
                  onClick={() => field.handleChange(c.value)}
                  className={cn(
                    'rounded-xl px-3 py-2.5 text-xs font-semibold transition',
                    field.state.value === c.value
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-secondary-foreground',
                  )}
                >
                  {c.label}
                </Button>
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
                      htmlFor="salary-semi-day-1"
                      hint="Calendar day for the first monthly occurrence"
                    >
                      <Input
                        id="salary-semi-day-1"
                        name="salary-semi-day-1"
                        type="number"
                        min="1"
                        max="31"
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
                      htmlFor="salary-semi-day-2"
                      hint="Calendar day for the second monthly occurrence"
                    >
                      <Input
                        id="salary-semi-day-2"
                        name="salary-semi-day-2"
                        type="number"
                        min="1"
                        max="31"
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
                    htmlFor="salary-weekly-interval"
                    hint="Choose a weekly interval up to every 4 weeks"
                  >
                    <SelectInput
                      id="salary-weekly-interval"
                      name="salary-weekly-interval"
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
                htmlFor="salary-next-date"
                hint={
                  cadence === 'monthly'
                    ? 'We use this date to determine the repeating day each month.'
                    : cadence === 'semi-monthly'
                      ? 'Choose whichever of the two monthly occurrences comes next.'
                      : 'Choose the next expected weekly salary date.'
                }
              >
                <DateInput
                  id="salary-next-date"
                  name="salary-next-date"
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
        <Button onClick={onBack} variant="secondary" fullWidth>
          Back
        </Button>
        <form.Subscribe selector={(s) => [s.canSubmit, s.isSubmitting]}>
          {([canSubmit, isSubmitting]) => (
            <Button
              type="submit"
              disabled={!canSubmit || !!isSubmitting}
              fullWidth
            >
              {isSubmitting ? 'Saving…' : 'Continue'}
            </Button>
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
        <div className="space-y-3">
          {expenses.map((expense, i) => (
            <div
              key={i}
              className="bg-input flex items-center justify-between rounded-xl px-4 py-3"
            >
              <div>
                <p className="text-foreground text-sm font-semibold">
                  {expense.name}
                </p>
                <p className="text-muted-foreground text-xs">
                  {expense.cadence} · ₱{expense.amount.toLocaleString()}
                </p>
              </div>
              <Button
                onClick={() => onRemove(i)}
                variant="icon"
                className="hover:text-destructive p-1.5"
              >
                <Trash2 className="size-4" />
              </Button>
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
        <Button
          onClick={() => setShowForm(true)}
          className="border-border text-muted-foreground hover:border-primary hover:text-primary flex w-full items-center justify-center gap-2 rounded-xl border border-dashed py-3 text-sm font-medium transition"
          variant="inline-primary"
        >
          <Plus className="size-4" />
          Add a recurring expense
        </Button>
      )}

      <div className="flex gap-3 pt-2">
        <Button onClick={onBack} variant="secondary" fullWidth>
          Back
        </Button>
        <Button onClick={onFinish} fullWidth>
          {expenses.length === 0 ? 'Skip & Finish' : 'Finish Setup'}
        </Button>
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
          onChange: ({ value }) => {
            const trimmedValue = value.trim()

            if (!trimmedValue) {
              return 'Name is required'
            }

            if (trimmedValue.length > ENTITY_NAME_MAX_LENGTH) {
              return `Name must be ${ENTITY_NAME_MAX_LENGTH} characters or fewer`
            }

            return undefined
          },
        }}
      >
        {(field) => (
          <FormField
            label="Name"
            htmlFor="expense-name"
            required
            error={field.state.meta.errors[0]?.toString()}
            counter={`${field.state.value.length}/${ENTITY_NAME_MAX_LENGTH}`}
          >
            <Input
              id="expense-name"
              name="expense-name"
              autoFocus
              maxLength={ENTITY_NAME_MAX_LENGTH}
              placeholder="e.g. Rent, Netflix"
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
            if (n > MONEY_MAX_AMOUNT) {
              return `Amount can't be greater than ${MONEY_MAX_AMOUNT.toLocaleString()}`
            }
            return undefined
          },
        }}
      >
        {(field) => (
          <FormField
            label="Amount"
            htmlFor="expense-amount"
            required
            error={field.state.meta.errors[0]?.toString()}
          >
            <CurrencyInput
              id="expense-amount"
              name="expense-amount"
              value={field.state.value as unknown as string}
              onChange={(e) =>
                field.handleChange(e.target.value as unknown as number)
              }
              onBlur={field.handleBlur}
            />
          </FormField>
        )}
      </form.Field>

      <form.Field
        name="categoryId"
        validators={{
          onChange: ({ value }) => (!value ? 'Select a category' : undefined),
        }}
      >
        {(field) => (
          <FormField
            label="Category"
            htmlFor="expense-category"
            required
            error={field.state.meta.errors[0]?.toString()}
          >
            <SelectInput
              id="expense-category"
              name="expense-category"
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
                <Button
                  key={c.value}
                  onClick={() => field.handleChange(c.value)}
                  className={cn(
                    'rounded-xl px-3 py-2 text-xs font-semibold transition',
                    field.state.value === c.value
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-card text-secondary-foreground',
                  )}
                >
                  {c.label}
                </Button>
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
                      htmlFor="expense-semi-day-1"
                      hint="Calendar day for the first monthly occurrence"
                    >
                      <Input
                        id="expense-semi-day-1"
                        name="expense-semi-day-1"
                        type="number"
                        min="1"
                        max="31"
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
                      htmlFor="expense-semi-day-2"
                      hint="Calendar day for the second monthly occurrence"
                    >
                      <Input
                        id="expense-semi-day-2"
                        name="expense-semi-day-2"
                        type="number"
                        min="1"
                        max="31"
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
                    htmlFor="expense-weekly-interval"
                    hint="Choose a weekly interval up to every 4 weeks"
                  >
                    <SelectInput
                      id="expense-weekly-interval"
                      name="expense-weekly-interval"
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
                htmlFor="expense-next-date"
                hint={
                  cadence === 'monthly'
                    ? 'We use this date to determine the repeating day each month.'
                    : cadence === 'semi-monthly'
                      ? 'Choose whichever of the two monthly occurrences comes next.'
                      : 'Choose the next expected weekly occurrence.'
                }
              >
                <DateInput
                  id="expense-next-date"
                  name="expense-next-date"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                />
              </FormField>
            )}
          </form.Subscribe>
        )}
      </form.Field>

      <div className="flex gap-2 pt-1">
        <Button
          onClick={onCancel}
          variant="secondary"
          fullWidth
          className="bg-card py-2.5"
        >
          Cancel
        </Button>
        <form.Subscribe selector={(s) => [s.canSubmit, s.isSubmitting]}>
          {([canSubmit, isSubmitting]) => (
            <Button
              type="submit"
              disabled={!canSubmit || !!isSubmitting}
              fullWidth
            >
              {isSubmitting ? 'Saving…' : 'Save'}
            </Button>
          )}
        </form.Subscribe>
      </div>
    </form>
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
      <h2 className="text-foreground text-xl font-bold tracking-tight">
        {title}
      </h2>
      <p className="text-muted-foreground text-sm">{desc}</p>
    </div>
  )
}

function StepIndicator({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center gap-1.5 pb-1">
      {Array.from({ length: total }, (_, i) => (
        <div
          key={i}
          className={cn(
            'h-1 rounded-full transition-all',
            i < current ? 'bg-primary flex-1' : 'bg-muted w-6 flex-none',
          )}
        />
      ))}
    </div>
  )
}

import { useForm } from '@tanstack/react-form'
import { format, getDate } from 'date-fns'
import { Button } from '#/components/common/Button'
import { CurrencyInput } from '#/components/common/CurrencyInput'
import { DateInput } from '#/components/common/DateInput'
import { FormField } from '#/components/common/FormField'
import { Input } from '#/components/common/Input'
import { SelectInput } from '#/components/common/SelectInput'
import { toStoredDate } from '#/lib/dates'
import { ENTITY_NAME_MAX_LENGTH, MONEY_MAX_AMOUNT } from '#/lib/utils/schema'
import { cn } from '#/lib/utils/cn'
import type { Account, Category, RecurringRule } from '#/types/domain'
import type { CreateRecurringRuleInput } from '../schemas/recurring-rule.schemas'

interface RecurringRuleFormProps {
  accounts: Account[]
  categories: Category[]
  type?: 'income' | 'expense'
  defaultName?: string
  defaultCategoryId?: string
  initialValues?: Partial<RecurringRule>
  onSubmit: (values: CreateRecurringRuleInput) => Promise<void>
  onCancel?: () => void
  submitLabel?: string
}

const CADENCE_OPTIONS = [
  { value: 'monthly', label: 'Monthly' },
  { value: 'semi-monthly', label: 'Semi-monthly' },
  { value: 'weekly', label: 'Weekly' },
] as const

const WEEKLY_INTERVAL_OPTIONS = [
  { value: '1', label: 'Every week' },
  { value: '2', label: 'Every 2 weeks' },
  { value: '3', label: 'Every 3 weeks' },
  { value: '4', label: 'Every 4 weeks' },
] as const

export function RecurringRuleForm({
  accounts,
  categories,
  type = 'income',
  defaultName = '',
  defaultCategoryId = '',
  initialValues,
  onSubmit,
  onCancel,
  submitLabel = 'Save',
}: RecurringRuleFormProps) {
  const initialCadence = initialValues?.cadence ?? 'semi-monthly'
  const todayForInput = format(
    initialValues?.nextOccurrenceDate
      ? new Date(initialValues.nextOccurrenceDate)
      : new Date(),
    'yyyy-MM-dd',
  )
  const defaultAccountId =
    initialValues?.accountId || (accounts[0] ? accounts[0].id : '')
  const [semiMonthlyDay1 = 15, semiMonthlyDay2 = 30] =
    initialValues?.semiMonthlyDays ?? []

  const form = useForm({
    defaultValues: {
      name: initialValues?.name ?? defaultName,
      type: initialValues?.type ?? type,
      amount: initialValues?.amount ?? ('' as unknown as number),
      categoryId: initialValues?.categoryId ?? defaultCategoryId,
      accountId: defaultAccountId,
      cadence: initialCadence as CreateRecurringRuleInput['cadence'],
      semiMonthlyDay1: String(semiMonthlyDay1),
      semiMonthlyDay2: String(semiMonthlyDay2),
      monthlyDay: String(initialValues?.monthlyDay ?? 1),
      weeklyInterval: String(initialValues?.weeklyInterval ?? 1),
      nextOccurrenceDate: todayForInput,
      isActive: initialValues?.isActive ?? true,
    },
    onSubmit: async ({ value }) => {
      const cadence = value.cadence
      const parsedNextOccurrenceDate = new Date(
        value.nextOccurrenceDate + 'T00:00:00.000Z',
      )
      const input: CreateRecurringRuleInput = {
        name: value.name,
        type: value.type,
        amount: Number(value.amount),
        categoryId: value.categoryId,
        accountId: value.accountId,
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
        isActive: value.isActive,
      }
      await onSubmit(input)
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
            label="Recurring Transaction Name"
            htmlFor="rule-name"
            error={field.state.meta.errors[0]?.toString()}
            counter={`${field.state.value.length}/${ENTITY_NAME_MAX_LENGTH}`}
            required
          >
            <Input
              id="rule-name"
              name="rule-name"
              maxLength={ENTITY_NAME_MAX_LENGTH}
              placeholder={`e.g. ${type === 'income' ? 'Salary' : 'Internet Bill'}`}
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
            label="Expected Amount"
            htmlFor="rule-amount"
            hint="Used for forecasting. Your actual posted amount can differ."
            error={field.state.meta.errors[0]?.toString()}
            required
          >
            <CurrencyInput
              id="rule-amount"
              name="rule-amount"
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
            htmlFor="rule-category"
            error={field.state.meta.errors[0]?.toString()}
            required
          >
            <SelectInput
              id="rule-category"
              name="rule-category"
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
            >
              <option value="">Select category</option>
              {categories
                .filter((c) => c.type === form.state.values.type)
                .map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
            </SelectInput>
          </FormField>
        )}
      </form.Field>

      <form.Field
        name="accountId"
        validators={{
          onChange: ({ value }) => (!value ? 'Select an account' : undefined),
        }}
      >
        {(field) => (
          <FormField
            label="Account"
            htmlFor="rule-account"
            error={field.state.meta.errors[0]?.toString()}
            required
          >
            <SelectInput
              id="rule-account"
              name="rule-account"
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
            >
              <option value="">Select account</option>
              {accounts.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </SelectInput>
          </FormField>
        )}
      </form.Field>

      {/* Cadence */}
      <form.Field name="cadence">
        {(field) => (
          <FormField label="Frequency">
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

      {/* Cadence-specific fields */}
      <form.Subscribe selector={(s) => s.values.cadence}>
        {(cadence) => (
          <>
            {cadence === 'semi-monthly' && (
              <div className="grid grid-cols-2 gap-3">
                <form.Field name="semiMonthlyDay1">
                  {(field) => (
                    <FormField
                      label="1st occurrence"
                      htmlFor="rule-semi-day-1"
                      hint="Calendar day for the first monthly occurrence"
                    >
                      <Input
                        id="rule-semi-day-1"
                        name="rule-semi-day-1"
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
                      htmlFor="rule-semi-day-2"
                      hint="Calendar day for the second monthly occurrence"
                    >
                      <Input
                        id="rule-semi-day-2"
                        name="rule-semi-day-2"
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
                    htmlFor="rule-weekly-interval"
                    hint="Choose a weekly interval up to every 4 weeks"
                  >
                    <SelectInput
                      id="rule-weekly-interval"
                      name="rule-weekly-interval"
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

      {/* Next occurrence */}
      <form.Subscribe selector={(s) => s.values.cadence}>
        {(cadence) => (
          <form.Field name="nextOccurrenceDate">
            {(field) => (
              <FormField
                label="Next Occurrence Date"
                htmlFor="rule-next-date"
                hint={
                  cadence === 'monthly'
                    ? 'We use this date to determine the repeating day each month.'
                    : cadence === 'semi-monthly'
                      ? 'Choose whichever of the two monthly occurrences comes next.'
                      : 'Choose the next expected weekly occurrence.'
                }
              >
                <DateInput
                  id="rule-next-date"
                  name="rule-next-date"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                />
              </FormField>
            )}
          </form.Field>
        )}
      </form.Subscribe>

      <div className="flex gap-3 pt-2">
        {onCancel && (
          <Button onClick={onCancel} variant="secondary" fullWidth>
            Cancel
          </Button>
        )}
        <form.Subscribe
          selector={(state) => [state.canSubmit, state.isSubmitting]}
        >
          {([canSubmit, isSubmitting]) => (
            <Button
              type="submit"
              disabled={!canSubmit || isSubmitting}
              fullWidth
            >
              {isSubmitting ? 'Saving…' : submitLabel}
            </Button>
          )}
        </form.Subscribe>
      </div>
    </form>
  )
}

import { useForm } from '@tanstack/react-form'
import { format } from 'date-fns'
import { FormField } from '#/components/common/FormField'
import { toStoredDate } from '#/lib/dates'
import type { Account, Category } from '#/types/domain'
import type { CreateRecurringRuleInput } from '../schemas/recurring-rule.schemas'

interface RecurringRuleFormProps {
  accounts: Account[]
  categories: Category[]
  type?: 'income' | 'expense'
  defaultName?: string
  defaultCategoryId?: string
  onSubmit: (values: CreateRecurringRuleInput) => Promise<void>
  onCancel?: () => void
  submitLabel?: string
}

const CADENCE_OPTIONS = [
  { value: 'monthly', label: 'Monthly' },
  { value: 'semi-monthly', label: 'Semi-monthly' },
  { value: 'weekly', label: 'Weekly' },
] as const

export function RecurringRuleForm({
  accounts,
  categories,
  type = 'income',
  defaultName = '',
  defaultCategoryId = '',
  onSubmit,
  onCancel,
  submitLabel = 'Save',
}: RecurringRuleFormProps) {
  const todayForInput = format(new Date(), 'yyyy-MM-dd')

  const form = useForm({
    defaultValues: {
      name: defaultName,
      type,
      amount: '' as unknown as number,
      categoryId: defaultCategoryId,
      accountId: accounts[0]?.id ?? '',
      cadence: 'semi-monthly' as CreateRecurringRuleInput['cadence'],
      semiMonthlyDay1: '15',
      semiMonthlyDay2: '30',
      monthlyDay: '1',
      weeklyInterval: '1',
      nextOccurrenceDate: todayForInput,
      isActive: true,
    },
    onSubmit: async ({ value }) => {
      const cadence = value.cadence
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
        monthlyDay: cadence === 'monthly' ? Number(value.monthlyDay) : null,
        weeklyInterval: cadence === 'weekly' ? Number(value.weeklyInterval) : null,
        nextOccurrenceDate: toStoredDate(
          new Date(value.nextOccurrenceDate + 'T00:00:00.000Z'),
        ),
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
        validators={{ onChange: ({ value }) => !value.trim() ? 'Name is required' : undefined }}
      >
        {(field) => (
          <FormField label="Rule Name" error={field.state.meta.errors[0]?.toString()} required>
            <input
              className="w-full rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none ring-1 ring-slate-200 transition focus:ring-2 focus:ring-emerald-600 dark:bg-zinc-800 dark:text-slate-100 dark:ring-zinc-700 dark:focus:ring-emerald-500"
              placeholder="e.g. Monthly Salary"
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
          <FormField label="Amount" error={field.state.meta.errors[0]?.toString()} required>
            <div className="relative">
              <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm font-medium text-slate-400">
                ₱
              </span>
              <input
                type="number"
                inputMode="decimal"
                step="0.01"
                min="0.01"
                placeholder="0.00"
                className="w-full rounded-xl bg-slate-50 py-3 pl-8 pr-4 text-sm text-slate-900 outline-none ring-1 ring-slate-200 transition focus:ring-2 focus:ring-emerald-600 dark:bg-zinc-800 dark:text-slate-100 dark:ring-zinc-700 dark:focus:ring-emerald-500"
                value={field.state.value as unknown as string}
                onChange={(e) => field.handleChange(e.target.value as unknown as number)}
                onBlur={field.handleBlur}
              />
            </div>
          </FormField>
        )}
      </form.Field>

      <form.Field name="categoryId" validators={{ onChange: ({ value }) => !value ? 'Select a category' : undefined }}>
        {(field) => (
          <FormField label="Category" error={field.state.meta.errors[0]?.toString()} required>
            <select
              className="w-full rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none ring-1 ring-slate-200 transition focus:ring-2 focus:ring-emerald-600 dark:bg-zinc-800 dark:text-slate-100 dark:ring-zinc-700 dark:focus:ring-emerald-500"
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
            >
              <option value="">Select category</option>
              {categories
                .filter((c) => c.type === type)
                .map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
            </select>
          </FormField>
        )}
      </form.Field>

      <form.Field name="accountId" validators={{ onChange: ({ value }) => !value ? 'Select an account' : undefined }}>
        {(field) => (
          <FormField label="Account" error={field.state.meta.errors[0]?.toString()} required>
            <select
              className="w-full rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none ring-1 ring-slate-200 transition focus:ring-2 focus:ring-emerald-600 dark:bg-zinc-800 dark:text-slate-100 dark:ring-zinc-700 dark:focus:ring-emerald-500"
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
            >
              <option value="">Select account</option>
              {accounts.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
          </FormField>
        )}
      </form.Field>

      {/* Cadence */}
      <form.Field name="cadence">
        {(field) => (
          <FormField label="Frequency">
            <div className="grid grid-cols-3 gap-2">
              {CADENCE_OPTIONS.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => field.handleChange(c.value)}
                  className={`rounded-xl px-3 py-2.5 text-xs font-semibold transition ${
                    field.state.value === c.value
                      ? 'bg-emerald-700 text-white dark:bg-emerald-600'
                      : 'bg-slate-100 text-slate-600 dark:bg-zinc-800 dark:text-slate-300'
                  }`}
                >
                  {c.label}
                </button>
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
                    <FormField label="Day 1 of month">
                      <input
                        type="number"
                        min="1"
                        max="31"
                        className="w-full rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none ring-1 ring-slate-200 transition focus:ring-2 focus:ring-emerald-600 dark:bg-zinc-800 dark:text-slate-100 dark:ring-zinc-700"
                        value={field.state.value}
                        onChange={(e) => field.handleChange(e.target.value)}
                      />
                    </FormField>
                  )}
                </form.Field>
                <form.Field name="semiMonthlyDay2">
                  {(field) => (
                    <FormField label="Day 2 of month">
                      <input
                        type="number"
                        min="1"
                        max="31"
                        className="w-full rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none ring-1 ring-slate-200 transition focus:ring-2 focus:ring-emerald-600 dark:bg-zinc-800 dark:text-slate-100 dark:ring-zinc-700"
                        value={field.state.value}
                        onChange={(e) => field.handleChange(e.target.value)}
                      />
                    </FormField>
                  )}
                </form.Field>
              </div>
            )}
            {cadence === 'monthly' && (
              <form.Field name="monthlyDay">
                {(field) => (
                  <FormField label="Day of month">
                    <input
                      type="number"
                      min="1"
                      max="31"
                      className="w-full rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none ring-1 ring-slate-200 transition focus:ring-2 focus:ring-emerald-600 dark:bg-zinc-800 dark:text-slate-100 dark:ring-zinc-700"
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                    />
                  </FormField>
                )}
              </form.Field>
            )}
            {cadence === 'weekly' && (
              <form.Field name="weeklyInterval">
                {(field) => (
                  <FormField label="Every N weeks" hint="e.g. 1 = every week, 2 = every 2 weeks">
                    <input
                      type="number"
                      min="1"
                      max="52"
                      className="w-full rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none ring-1 ring-slate-200 transition focus:ring-2 focus:ring-emerald-600 dark:bg-zinc-800 dark:text-slate-100 dark:ring-zinc-700"
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                    />
                  </FormField>
                )}
              </form.Field>
            )}
          </>
        )}
      </form.Subscribe>

      {/* Next occurrence */}
      <form.Field name="nextOccurrenceDate">
        {(field) => (
          <FormField label="Next Occurrence Date">
            <input
              type="date"
              className="w-full rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none ring-1 ring-slate-200 transition focus:ring-2 focus:ring-emerald-600 dark:bg-zinc-800 dark:text-slate-100 dark:ring-zinc-700 dark:focus:ring-emerald-500"
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
            />
          </FormField>
        )}
      </form.Field>

      <div className="flex gap-3 pt-2">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 rounded-xl bg-slate-100 py-3 text-sm font-semibold text-slate-700 transition active:scale-[0.98] dark:bg-zinc-800 dark:text-slate-200"
          >
            Cancel
          </button>
        )}
        <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]}>
          {([canSubmit, isSubmitting]) => (
            <button
              type="submit"
              disabled={!canSubmit || isSubmitting}
              className="flex-1 rounded-xl bg-emerald-700 py-3 text-sm font-semibold text-white transition active:scale-[0.98] disabled:opacity-50 dark:bg-emerald-600"
            >
              {isSubmitting ? 'Saving…' : submitLabel}
            </button>
          )}
        </form.Subscribe>
      </div>
    </form>
  )
}

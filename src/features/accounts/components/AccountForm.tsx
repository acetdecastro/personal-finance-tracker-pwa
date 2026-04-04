import { useForm } from '@tanstack/react-form'
import { FormField } from '#/components/common/FormField'
import type { CreateAccountInput } from '../schemas/account.schemas'

interface AccountFormProps {
  onSubmit: (values: CreateAccountInput) => Promise<void>
  onCancel?: () => void
  submitLabel?: string
}

const ACCOUNT_TYPES = [
  { value: 'cash', label: 'Cash' },
  { value: 'bank', label: 'Bank' },
  { value: 'ewallet', label: 'E-wallet' },
  { value: 'other', label: 'Other' },
] as const

export function AccountForm({ onSubmit, onCancel, submitLabel = 'Add Account' }: AccountFormProps) {
  const form = useForm({
    defaultValues: {
      name: '',
      type: 'bank' as CreateAccountInput['type'],
      initialBalance: 0,
      isArchived: false,
    },
    onSubmit: async ({ value }) => {
      await onSubmit(value)
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
          <FormField label="Account Name" error={field.state.meta.errors[0]?.toString()} required>
            <input
              className="w-full rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none ring-1 ring-slate-200 transition focus:ring-2 focus:ring-emerald-600 dark:bg-zinc-800 dark:text-slate-100 dark:ring-zinc-700 dark:focus:ring-emerald-500"
              placeholder="e.g. BDO Savings"
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              onBlur={field.handleBlur}
            />
          </FormField>
        )}
      </form.Field>

      <form.Field name="type">
        {(field) => (
          <FormField label="Account Type" required>
            <div className="grid grid-cols-4 gap-2">
              {ACCOUNT_TYPES.map((t) => (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => field.handleChange(t.value)}
                  className={`rounded-xl px-3 py-2.5 text-xs font-semibold transition ${
                    field.state.value === t.value
                      ? 'bg-emerald-700 text-white dark:bg-emerald-600'
                      : 'bg-slate-100 text-slate-600 dark:bg-zinc-800 dark:text-slate-300'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </FormField>
        )}
      </form.Field>

      <form.Field
        name="initialBalance"
        validators={{
          onChange: ({ value }) =>
            value < 0 ? 'Balance cannot be negative' : undefined,
        }}
      >
        {(field) => (
          <FormField label="Starting Balance" error={field.state.meta.errors[0]?.toString()} hint="Current amount in this account">
            <div className="relative">
              <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm font-medium text-slate-400">
                ₱
              </span>
              <input
                type="number"
                inputMode="decimal"
                step="0.01"
                min="0"
                className="w-full rounded-xl bg-slate-50 py-3 pl-8 pr-4 text-sm text-slate-900 outline-none ring-1 ring-slate-200 transition focus:ring-2 focus:ring-emerald-600 dark:bg-zinc-800 dark:text-slate-100 dark:ring-zinc-700 dark:focus:ring-emerald-500"
                value={field.state.value}
                onChange={(e) => field.handleChange(parseFloat(e.target.value) || 0)}
                onBlur={field.handleBlur}
              />
            </div>
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

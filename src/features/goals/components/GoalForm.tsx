import { useForm } from '@tanstack/react-form'
import { format } from 'date-fns'
import { FormField } from '#/components/common/FormField'
import { toStoredDate } from '#/lib/dates'
import type { CreateGoalInput } from '../schemas/goal.schemas'

interface GoalFormProps {
  onSubmit: (values: CreateGoalInput) => Promise<void>
  onCancel?: () => void
}

export function GoalForm({ onSubmit, onCancel }: GoalFormProps) {
  const form = useForm({
    defaultValues: {
      name: '',
      targetAmount: '' as unknown as number,
      currentAmount: '' as unknown as number,
      targetDate: '',
    },
    onSubmit: async ({ value }) => {
      await onSubmit({
        name: value.name,
        targetAmount: Number(value.targetAmount),
        currentAmount: value.currentAmount ? Number(value.currentAmount) : null,
        targetDate: value.targetDate
          ? toStoredDate(new Date(value.targetDate + 'T00:00:00.000Z'))
          : null,
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
        validators={{ onChange: ({ value }) => !value.trim() ? 'Name is required' : undefined }}
      >
        {(field) => (
          <FormField label="Goal Name" error={field.state.meta.errors[0]?.toString()} required>
            <input
              className="w-full rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none ring-1 ring-slate-200 transition focus:ring-2 focus:ring-emerald-600 dark:bg-zinc-800 dark:text-slate-100 dark:ring-zinc-700 dark:focus:ring-emerald-500"
              placeholder="e.g. Emergency Fund"
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              onBlur={field.handleBlur}
            />
          </FormField>
        )}
      </form.Field>

      <form.Field
        name="targetAmount"
        validators={{
          onChange: ({ value }) => {
            const n = Number(value)
            if (!value || isNaN(n) || n <= 0) return 'Enter a valid target amount'
            return undefined
          },
        }}
      >
        {(field) => (
          <FormField label="Target Amount" error={field.state.meta.errors[0]?.toString()} required>
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

      <form.Field name="currentAmount">
        {(field) => (
          <FormField label="Already Saved" hint="Optional — how much you've saved so far">
            <div className="relative">
              <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm font-medium text-slate-400">
                ₱
              </span>
              <input
                type="number"
                inputMode="decimal"
                step="0.01"
                min="0"
                placeholder="0.00"
                className="w-full rounded-xl bg-slate-50 py-3 pl-8 pr-4 text-sm text-slate-900 outline-none ring-1 ring-slate-200 transition focus:ring-2 focus:ring-emerald-600 dark:bg-zinc-800 dark:text-slate-100 dark:ring-zinc-700 dark:focus:ring-emerald-500"
                value={field.state.value as unknown as string}
                onChange={(e) => field.handleChange(e.target.value as unknown as number)}
              />
            </div>
          </FormField>
        )}
      </form.Field>

      <form.Field name="targetDate">
        {(field) => (
          <FormField label="Target Date" hint="Optional">
            <input
              type="date"
              min={format(new Date(), 'yyyy-MM-dd')}
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
              {isSubmitting ? 'Saving…' : 'Create Goal'}
            </button>
          )}
        </form.Subscribe>
      </div>
    </form>
  )
}

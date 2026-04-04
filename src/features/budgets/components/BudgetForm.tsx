import { useForm } from '@tanstack/react-form'
import { FormField } from '#/components/common/FormField'
import type { Category } from '#/types/domain'
import type { CreateBudgetInput } from '../schemas/budget.schemas'

interface BudgetFormProps {
  categories: Category[]
  onSubmit: (values: CreateBudgetInput) => Promise<void>
  onCancel?: () => void
}

export function BudgetForm({ categories, onSubmit, onCancel }: BudgetFormProps) {
  const expenseCategories = categories.filter((c) => c.type === 'expense')

  const form = useForm({
    defaultValues: {
      categoryId: '',
      amount: '' as unknown as number,
    },
    onSubmit: async ({ value }) => {
      await onSubmit({
        categoryId: value.categoryId,
        amount: Number(value.amount),
        periodType: 'monthly',
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
        name="categoryId"
        validators={{ onChange: ({ value }) => !value ? 'Select a category' : undefined }}
      >
        {(field) => (
          <FormField label="Category" error={field.state.meta.errors[0]?.toString()} required>
            <select
              className="w-full rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none ring-1 ring-slate-200 transition focus:ring-2 focus:ring-emerald-600 dark:bg-zinc-800 dark:text-slate-100 dark:ring-zinc-700 dark:focus:ring-emerald-500"
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
            >
              <option value="">Select category</option>
              {expenseCategories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
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
          <FormField label="Monthly Limit" error={field.state.meta.errors[0]?.toString()} required>
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
              {isSubmitting ? 'Saving…' : 'Set Budget'}
            </button>
          )}
        </form.Subscribe>
      </div>
    </form>
  )
}

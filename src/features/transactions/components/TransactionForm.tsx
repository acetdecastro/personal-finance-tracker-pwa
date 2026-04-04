import { useForm } from '@tanstack/react-form'
import { format } from 'date-fns'
import { FormField } from '#/components/common/FormField'
import { toStoredDate } from '#/lib/dates'
import type { Account, Category, TransactionType } from '#/types/domain'
import type { CreateTransactionInput } from '../schemas/transaction.schemas'

interface TransactionFormProps {
  accounts: Account[]
  categories: Category[]
  onSubmit: (values: CreateTransactionInput) => Promise<void>
  onCancel?: () => void
}

export function TransactionForm({
  accounts,
  categories,
  onSubmit,
  onCancel,
}: TransactionFormProps) {
  const todayForInput = format(new Date(), 'yyyy-MM-dd')

  const form = useForm({
    defaultValues: {
      type: 'expense' as TransactionType,
      amount: '' as unknown as number,
      categoryId: '',
      accountId: accounts[0]?.id ?? '',
      note: '',
      date: todayForInput,
    },
    onSubmit: async ({ value }) => {
      const filteredCategories = categories.filter((c) => c.type === value.type)
      const input: CreateTransactionInput = {
        type: value.type as 'income' | 'expense',
        amount: Number(value.amount),
        categoryId: value.categoryId || (filteredCategories[0]?.id ?? null),
        accountId: value.accountId || null,
        fromAccountId: null,
        toAccountId: null,
        note: value.note.trim() || null,
        transactionDate: toStoredDate(new Date(value.date + 'T00:00:00.000Z')),
        recurringRuleId: null,
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
      {/* Type toggle */}
      <form.Field name="type">
        {(field) => (
          <div className="grid grid-cols-2 gap-2">
            {(['expense', 'income'] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => field.handleChange(t)}
                className={`rounded-xl py-2.5 text-sm font-semibold capitalize transition active:scale-[0.98] ${
                  field.state.value === t
                    ? t === 'expense'
                      ? 'bg-red-600 text-white dark:bg-red-500'
                      : 'bg-emerald-700 text-white dark:bg-emerald-600'
                    : 'bg-slate-100 text-slate-500 dark:bg-zinc-800 dark:text-slate-400'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        )}
      </form.Field>

      {/* Amount */}
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
              <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-lg font-bold text-slate-400">
                ₱
              </span>
              <input
                type="number"
                inputMode="decimal"
                step="0.01"
                min="0.01"
                placeholder="0.00"
                autoFocus
                className="w-full rounded-xl bg-slate-50 py-3 pl-9 pr-4 text-lg font-bold text-slate-900 outline-none ring-1 ring-slate-200 transition focus:ring-2 focus:ring-emerald-600 dark:bg-zinc-800 dark:text-slate-100 dark:ring-zinc-700 dark:focus:ring-emerald-500"
                value={field.state.value as unknown as string}
                onChange={(e) => field.handleChange(e.target.value as unknown as number)}
                onBlur={field.handleBlur}
              />
            </div>
          </FormField>
        )}
      </form.Field>

      {/* Category — filtered by type */}
      <form.Field
        name="categoryId"
        validators={{ onChange: ({ value }) => !value ? 'Select a category' : undefined }}
      >
        {(field) => (
          <form.Subscribe selector={(s) => s.values.type}>
            {(type) => {
              const filtered = categories.filter((c) => c.type === type)
              return (
                <FormField label="Category" error={field.state.meta.errors[0]?.toString()} required>
                  <select
                    className="w-full rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none ring-1 ring-slate-200 transition focus:ring-2 focus:ring-emerald-600 dark:bg-zinc-800 dark:text-slate-100 dark:ring-zinc-700 dark:focus:ring-emerald-500"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                  >
                    <option value="">Select category</option>
                    {filtered.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </FormField>
              )
            }}
          </form.Subscribe>
        )}
      </form.Field>

      {/* Account */}
      <form.Field
        name="accountId"
        validators={{ onChange: ({ value }) => !value ? 'Select an account' : undefined }}
      >
        {(field) => (
          <FormField label="Account" error={field.state.meta.errors[0]?.toString()} required>
            <select
              className="w-full rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none ring-1 ring-slate-200 transition focus:ring-2 focus:ring-emerald-600 dark:bg-zinc-800 dark:text-slate-100 dark:ring-zinc-700 dark:focus:ring-emerald-500"
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              onBlur={field.handleBlur}
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

      {/* Date */}
      <form.Field name="date">
        {(field) => (
          <FormField label="Date">
            <input
              type="date"
              className="w-full rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none ring-1 ring-slate-200 transition focus:ring-2 focus:ring-emerald-600 dark:bg-zinc-800 dark:text-slate-100 dark:ring-zinc-700 dark:focus:ring-emerald-500"
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              onBlur={field.handleBlur}
            />
          </FormField>
        )}
      </form.Field>

      {/* Note (optional) */}
      <form.Field name="note">
        {(field) => (
          <FormField label="Note" hint="Optional">
            <input
              type="text"
              placeholder="Add a note…"
              maxLength={500}
              className="w-full rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none ring-1 ring-slate-200 transition focus:ring-2 focus:ring-emerald-600 dark:bg-zinc-800 dark:text-slate-100 dark:ring-zinc-700 dark:focus:ring-emerald-500"
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              onBlur={field.handleBlur}
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
              {isSubmitting ? 'Saving…' : 'Save Transaction'}
            </button>
          )}
        </form.Subscribe>
      </div>
    </form>
  )
}

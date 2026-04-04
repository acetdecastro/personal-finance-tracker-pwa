import { useForm } from '@tanstack/react-form'
import { format } from 'date-fns'
import { Button } from '#/components/common/Button'
import { CurrencyInput } from '#/components/common/CurrencyInput'
import { DateInput } from '#/components/common/DateInput'
import { FormField } from '#/components/common/FormField'
import { Input } from '#/components/common/Input'
import { SelectInput } from '#/components/common/SelectInput'
import { toStoredDate } from '#/lib/dates'
import { cn } from '#/lib/utils/cn'
import type { TransactionType } from '#/types/domain'
import type { TransactionFormOptionsDto } from '../types'
import type { CreateTransactionInput } from '../schemas/transaction.schemas'

interface TransactionFormProps {
  formOptions: TransactionFormOptionsDto
  onSubmit: (values: CreateTransactionInput) => Promise<void>
  onCancel?: () => void
}

export function TransactionForm({
  formOptions,
  onSubmit,
  onCancel,
}: TransactionFormProps) {
  const todayForInput = format(new Date(), 'yyyy-MM-dd')

  const form = useForm({
    defaultValues: {
      type: 'expense' as TransactionType,
      amount: '' as unknown as number,
      recurringTransactionId: '',
      categoryId: '',
      accountId: formOptions.accountOptions[0]?.value ?? '',
      note: '',
      date: todayForInput,
    },
    onSubmit: async ({ value }) => {
      const categoryOptions =
        value.type === 'expense'
          ? formOptions.expenseCategoryOptions
          : formOptions.incomeCategoryOptions
      const recurringOptions =
        value.type === 'expense'
          ? formOptions.expenseRecurringTransactionOptions
          : formOptions.incomeRecurringTransactionOptions
      const selectedRecurringTransaction =
        recurringOptions.find(
          (option) => option.value === value.recurringTransactionId,
        ) ?? null
      const input: CreateTransactionInput = {
        type: value.type as 'income' | 'expense',
        amount: Number(value.amount),
        categoryId:
          value.categoryId ||
          selectedRecurringTransaction?.categoryId ||
          (categoryOptions[0]?.value ?? null),
        accountId:
          value.accountId || selectedRecurringTransaction?.accountId || null,
        fromAccountId: null,
        toAccountId: null,
        note: value.note.trim() || null,
        transactionDate: toStoredDate(
          new Date(value.date + 'T00:00:00.000Z'),
        ),
        recurringRuleId: selectedRecurringTransaction?.value ?? null,
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
              <Button
                key={t}
                onClick={() => field.handleChange(t)}
                className={cn(
                  'rounded-xl py-2.5 text-sm font-semibold capitalize transition active:scale-[0.98]',
                  field.state.value === t
                    ? t === 'expense'
                      ? 'bg-destructive text-primary-foreground'
                      : 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground',
                )}
              >
                {t}
              </Button>
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
          <FormField
            label="Amount"
            required
            error={field.state.meta.errors[0]?.toString()}
          >
            <CurrencyInput
              autoFocus
              className="py-3 text-lg font-normal"
              value={field.state.value as unknown as string}
              onChange={(e) =>
                field.handleChange(e.target.value as unknown as number)
              }
              onBlur={field.handleBlur}
            />
          </FormField>
        )}
      </form.Field>

      <form.Field name="recurringTransactionId">
        {(field) => (
          <form.Subscribe selector={(s) => s.values.type}>
            {(type) => {
              const options =
                type === 'expense'
                  ? formOptions.expenseRecurringTransactionOptions
                  : formOptions.incomeRecurringTransactionOptions

              if (options.length === 0) {
                return null
              }

              return (
                <FormField
                  label="Link Recurring Transaction"
                  hint="Optional. Prefills the expected occurrence, but the amount you save can differ."
                >
                  <SelectInput
                    value={field.state.value}
                    onChange={(e) => {
                      const nextValue = e.target.value
                      field.handleChange(nextValue)

                      const selectedOption =
                        options.find((option) => option.value === nextValue) ??
                        null

                      if (!selectedOption) {
                        return
                      }

                      form.setFieldValue('categoryId', selectedOption.categoryId)
                      form.setFieldValue('accountId', selectedOption.accountId)
                      form.setFieldValue(
                        'date',
                        format(
                          new Date(selectedOption.nextOccurrenceDate),
                          'yyyy-MM-dd',
                        ),
                      )
                    }}
                  >
                    <option value="">None</option>
                    {options.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label} · {option.accountLabel} · Expected{' '}
                        {option.expectedAmount.toLocaleString()}
                      </option>
                    ))}
                  </SelectInput>
                </FormField>
              )
            }}
          </form.Subscribe>
        )}
      </form.Field>

      {/* Category — filtered by type */}
      <form.Field
        name="categoryId"
        validators={{
          onChange: ({ value }) =>
            !value ? 'Select a category' : undefined,
        }}
      >
        {(field) => (
          <form.Subscribe selector={(s) => s.values.type}>
            {(type) => {
              const options =
                type === 'expense'
                  ? formOptions.expenseCategoryOptions
                  : formOptions.incomeCategoryOptions
              return (
                <FormField
                  label="Category"
                  required
                  error={field.state.meta.errors[0]?.toString()}
                >
                  <SelectInput
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                  >
                    <option value="">Select category</option>
                    {options.map((c) => (
                      <option key={c.value} value={c.value}>
                        {c.label}
                      </option>
                    ))}
                  </SelectInput>
                </FormField>
              )
            }}
          </form.Subscribe>
        )}
      </form.Field>

      {/* Account */}
      <form.Field
        name="accountId"
        validators={{
          onChange: ({ value }) =>
            !value ? 'Select an account' : undefined,
        }}
      >
        {(field) => (
          <FormField
            label="Account"
            required
            error={field.state.meta.errors[0]?.toString()}
          >
            <SelectInput
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              onBlur={field.handleBlur}
            >
              <option value="">Select account</option>
              {formOptions.accountOptions.map((a) => (
                <option key={a.value} value={a.value}>
                  {a.label}
                </option>
              ))}
            </SelectInput>
          </FormField>
        )}
      </form.Field>

      {/* Date */}
      <form.Field name="date">
        {(field) => (
          <FormField label="Date" hint="Use the actual posted date for this transaction.">
            <DateInput
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
            <Input
              type="text"
              placeholder="Add a note…"
              maxLength={500}
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              onBlur={field.handleBlur}
            />
          </FormField>
        )}
      </form.Field>

      <div className="flex gap-3 pt-2">
        {onCancel && (
          <Button onClick={onCancel} variant="secondary" fullWidth>
            Cancel
          </Button>
        )}
        <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]}>
          {([canSubmit, isSubmitting]) => (
            <Button
              type="submit"
              disabled={!canSubmit || !!isSubmitting}
              fullWidth
            >
              {isSubmitting ? 'Saving…' : 'Save Transaction'}
            </Button>
          )}
        </form.Subscribe>
      </div>
    </form>
  )
}

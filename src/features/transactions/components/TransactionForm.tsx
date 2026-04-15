import { useForm } from '@tanstack/react-form'
import { format } from 'date-fns'
import { Button } from '#/components/common/Button'
import { CurrencyInput } from '#/components/common/CurrencyInput'
import { DateInput } from '#/components/common/DateInput'
import { FormField } from '#/components/common/FormField'
import { Input } from '#/components/common/Input'
import { SelectInput } from '#/components/common/SelectInput'
import { toStoredDate } from '#/lib/dates'
import { useSmartFormAutofocus } from '#/lib/hooks/use-smart-form-autofocus'
import { MONEY_MAX_AMOUNT } from '#/lib/utils/schema'
import { cn } from '#/lib/utils/cn'
import type { Transaction, TransactionType } from '#/types/domain'
import type { TransactionFormOptionsDto } from '../types'
import type { CreateTransactionInput } from '../schemas/transaction.schemas'

interface TransactionFormProps {
  formOptions: TransactionFormOptionsDto
  onSubmit: (values: CreateTransactionInput) => Promise<void>
  onDelete?: () => Promise<void>
  onCancel?: () => void
  submitLabel?: string
  initialValues?: Partial<Transaction>
}

export function TransactionForm({
  formOptions,
  onSubmit,
  onDelete,
  onCancel,
  submitLabel = 'Save',
  initialValues,
}: TransactionFormProps) {
  const formRef = useSmartFormAutofocus()
  const todayForInput = format(
    initialValues?.transactionDate
      ? new Date(initialValues.transactionDate)
      : new Date(),
    'yyyy-MM-dd',
  )
  const coveredOccurrenceForInput = initialValues?.coveredRecurringOccurrenceDate
    ? format(new Date(initialValues.coveredRecurringOccurrenceDate), 'yyyy-MM-dd')
    : ''

  const form = useForm({
    defaultValues: {
      type: initialValues?.type ?? ('expense' as TransactionType),
      amount:
        initialValues?.amount !== undefined
          ? String(initialValues.amount)
          : ('' as unknown as number),
      recurringTransactionId: initialValues?.recurringRuleId ?? '',
      categoryId: initialValues?.categoryId ?? '',
      accountId:
        initialValues?.accountId || formOptions.accountOptions[0]?.value || '',
      fromAccountId: initialValues?.fromAccountId ?? '',
      toAccountId: initialValues?.toAccountId ?? '',
      goalId: initialValues?.goalId ?? '',
      goalTransferDirection:
        initialValues?.goalTransferDirection ??
        (initialValues?.goalId
          ? initialValues.toAccountId
            ? 'out'
            : 'in'
          : ''),
      note: initialValues?.note ?? '',
      date: todayForInput,
      coversScheduledOccurrence: Boolean(
        initialValues?.coveredRecurringOccurrenceDate,
      ),
      coveredRecurringOccurrenceDate: coveredOccurrenceForInput,
    },
    onSubmit: async ({ value }) => {
      if (value.type === 'transfer') {
        const input: CreateTransactionInput = {
          type: 'transfer',
          amount: Number(value.amount),
          categoryId: formOptions.transferCategoryOption?.value ?? null,
          accountId: null,
          fromAccountId: value.fromAccountId || null,
          toAccountId:
            value.goalId && value.goalTransferDirection !== 'out'
              ? null
              : value.toAccountId || null,
          goalId: value.goalId || null,
          goalTransferDirection: value.goalId
            ? ((value.goalTransferDirection || 'in') as 'in' | 'out')
            : null,
          note: value.note.trim() || null,
          transactionDate: toStoredDate(
            new Date(value.date + 'T00:00:00.000Z'),
          ),
          recurringRuleId: null,
          coveredRecurringOccurrenceDate: null,
        }

        await onSubmit(input)
        return
      }

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
        type: value.type,
        amount: Number(value.amount),
        categoryId:
          value.categoryId ||
          selectedRecurringTransaction?.categoryId ||
          (categoryOptions[0]?.value ?? null),
        accountId:
          value.accountId || selectedRecurringTransaction?.accountId || null,
        fromAccountId: null,
        toAccountId: null,
        goalId: null,
        goalTransferDirection: null,
        note: value.note.trim() || null,
        transactionDate: toStoredDate(new Date(value.date + 'T00:00:00.000Z')),
        recurringRuleId: selectedRecurringTransaction?.value ?? null,
        coveredRecurringOccurrenceDate:
          selectedRecurringTransaction?.value && value.coversScheduledOccurrence
            ? toStoredDate(
                new Date(
                  value.coveredRecurringOccurrenceDate + 'T00:00:00.000Z',
                ),
              )
            : null,
      }
      await onSubmit(input)
    },
  })

  return (
    <form
      ref={formRef}
      onSubmit={(e) => {
        e.preventDefault()
        form.handleSubmit()
      }}
      className="space-y-4"
    >
      {/* Type toggle — only shown when adding */}
      {!initialValues && (
        <form.Field name="type">
          {(field) => (
            <div className="grid grid-cols-3 gap-2">
              {(['expense', 'income', 'transfer'] as const).map((t) => (
                <Button
                  key={t}
                  onClick={() => field.handleChange(t)}
                  className={cn(
                    'rounded-xl py-2.5 text-sm font-semibold capitalize transition active:scale-[0.98]',
                    field.state.value === t
                      ? t === 'expense'
                        ? 'bg-destructive text-primary-foreground'
                        : t === 'transfer'
                          ? 'bg-accent text-accent-foreground'
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
      )}

      {/* Amount */}
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
            htmlFor="txn-amount"
            required
            error={field.state.meta.errors[0]?.toString()}
          >
            <CurrencyInput
              id="txn-amount"
              name="txn-amount"
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
              if (type === 'transfer') {
                return null
              }

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
                  htmlFor="txn-recurring-id"
                  hint="Optional. Prefills the expected occurrence, but the amount you save can differ."
                >
                  <SelectInput
                    id="txn-recurring-id"
                    name="txn-recurring-id"
                    value={field.state.value}
                    onChange={(e) => {
                      const nextValue = e.target.value
                      field.handleChange(nextValue)

                      const selectedOption =
                        options.find((option) => option.value === nextValue) ??
                        null

                      if (!selectedOption) {
                        form.setFieldValue('coversScheduledOccurrence', false)
                        form.setFieldValue('coveredRecurringOccurrenceDate', '')
                        return
                      }

                      form.setFieldValue(
                        'categoryId',
                        selectedOption.categoryId,
                      )
                      form.setFieldValue('accountId', selectedOption.accountId)
                      form.setFieldValue(
                        'date',
                        format(
                          new Date(selectedOption.nextOccurrenceDate),
                          'yyyy-MM-dd',
                        ),
                      )
                      form.setFieldValue('coversScheduledOccurrence', true)
                      form.setFieldValue(
                        'coveredRecurringOccurrenceDate',
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
          onChange: ({ value, fieldApi }) =>
            fieldApi.form.getFieldValue('type') !== 'transfer' && !value
              ? 'Select a category'
              : undefined,
        }}
      >
        {(field) => (
          <form.Subscribe selector={(s) => s.values.type}>
            {(type) => {
              if (type === 'transfer') {
                return (
                  <FormField
                    label="Category"
                    htmlFor="txn-transfer-category"
                    hint="Transfers use the Transfer category automatically."
                  >
                    <Input
                      id="txn-transfer-category"
                      name="txn-transfer-category"
                      type="text"
                      value={
                        formOptions.transferCategoryOption?.label ?? 'Transfer'
                      }
                      readOnly
                    />
                  </FormField>
                )
              }

              const options =
                type === 'expense'
                  ? formOptions.expenseCategoryOptions
                  : formOptions.incomeCategoryOptions
              return (
                <FormField
                  label="Category"
                  htmlFor="txn-category"
                  required
                  error={field.state.meta.errors[0]?.toString()}
                >
                  <SelectInput
                    id="txn-category"
                    name="txn-category"
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
      <form.Subscribe
        selector={(s) => ({
          type: s.values.type,
          goalId: s.values.goalId,
          goalTransferDirection: s.values.goalTransferDirection,
        })}
      >
        {({ type, goalId, goalTransferDirection }) =>
          type === 'transfer' ? (
            <>
              {goalId && goalTransferDirection === 'out' ? (
                <FormField
                  label="Source"
                  htmlFor="txn-transfer-source"
                  hint="This transfer is moving funds out of a savings goal."
                >
                  <Input
                    id="txn-transfer-source"
                    name="txn-transfer-source"
                    type="text"
                    value="Savings Goal"
                    readOnly
                  />
                </FormField>
              ) : (
                <form.Field
                  name="fromAccountId"
                  validators={{
                    onChange: ({ value, fieldApi }) =>
                      fieldApi.form.getFieldValue('goalId') &&
                      fieldApi.form.getFieldValue('goalTransferDirection') ===
                        'out'
                        ? undefined
                        : !value
                          ? 'Select a source account'
                          : undefined,
                  }}
                >
                  {(field) => (
                    <FormField
                      label="From Account"
                      htmlFor="txn-from-account"
                      required
                      error={field.state.meta.errors[0]?.toString()}
                    >
                      <SelectInput
                        id="txn-from-account"
                        name="txn-from-account"
                        value={field.state.value}
                        onChange={(e) => field.handleChange(e.target.value)}
                        onBlur={field.handleBlur}
                      >
                        <option value="">Select source account</option>
                        {formOptions.accountOptions.map((a) => (
                          <option key={a.value} value={a.value}>
                            {a.label}
                          </option>
                        ))}
                      </SelectInput>
                    </FormField>
                  )}
                </form.Field>
              )}

              {goalId ? (
                goalTransferDirection === 'out' ? (
                  <form.Field
                    name="toAccountId"
                    validators={{
                      onChange: ({ value }) =>
                        !value ? 'Select a destination account' : undefined,
                    }}
                  >
                    {(field) => (
                      <FormField
                        label="To Account"
                        htmlFor="txn-to-account"
                        required
                        error={field.state.meta.errors[0]?.toString()}
                      >
                        <SelectInput
                          id="txn-to-account"
                          name="txn-to-account"
                          value={field.state.value}
                          onChange={(e) => field.handleChange(e.target.value)}
                          onBlur={field.handleBlur}
                        >
                          <option value="">Select destination account</option>
                          {formOptions.accountOptions.map((a) => (
                            <option key={a.value} value={a.value}>
                              {a.label}
                            </option>
                          ))}
                        </SelectInput>
                      </FormField>
                    )}
                  </form.Field>
                ) : (
                  <FormField
                    label="Destination"
                    htmlFor="txn-transfer-destination"
                    hint="This transfer is linked to a savings goal."
                  >
                    <Input
                      id="txn-transfer-destination"
                      name="txn-transfer-destination"
                      type="text"
                      value="Savings Goal"
                      readOnly
                    />
                  </FormField>
                )
              ) : (
                <form.Field
                  name="toAccountId"
                  validators={{
                    onChange: ({ value, fieldApi }) => {
                      if (!value) {
                        return 'Select a destination account'
                      }

                      if (
                        value === fieldApi.form.getFieldValue('fromAccountId')
                      ) {
                        return 'Destination account must be different'
                      }

                      return undefined
                    },
                  }}
                >
                  {(field) => (
                    <FormField
                      label="To Account"
                      htmlFor="txn-to-account"
                      required
                      error={field.state.meta.errors[0]?.toString()}
                    >
                      <SelectInput
                        id="txn-to-account"
                        name="txn-to-account"
                        value={field.state.value}
                        onChange={(e) => field.handleChange(e.target.value)}
                        onBlur={field.handleBlur}
                      >
                        <option value="">Select destination account</option>
                        {formOptions.accountOptions.map((a) => (
                          <option key={a.value} value={a.value}>
                            {a.label}
                          </option>
                        ))}
                      </SelectInput>
                    </FormField>
                  )}
                </form.Field>
              )}
            </>
          ) : (
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
                  htmlFor="txn-account"
                  required
                  error={field.state.meta.errors[0]?.toString()}
                >
                  <SelectInput
                    id="txn-account"
                    name="txn-account"
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
          )
        }
      </form.Subscribe>

      {/* Date */}
      <form.Field name="date">
        {(field) => (
          <FormField
            label="Date"
            htmlFor="txn-date"
            hint="Use the actual posted date for this transaction."
          >
            <DateInput
              id="txn-date"
              name="txn-date"
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              onBlur={field.handleBlur}
            />
          </FormField>
        )}
      </form.Field>

      <form.Subscribe
        selector={(state) => ({
          type: state.values.type,
          recurringTransactionId: state.values.recurringTransactionId,
          coversScheduledOccurrence: state.values.coversScheduledOccurrence,
        })}
      >
        {({ type, recurringTransactionId, coversScheduledOccurrence }) => {
          if (type === 'transfer' || !recurringTransactionId) {
            return null
          }

          return (
            <div className="space-y-3">
              <form.Field name="coversScheduledOccurrence">
                {(field) => (
                  <label className="border-border bg-card flex items-start gap-3 rounded-2xl border px-4 py-3">
                    <input
                      type="checkbox"
                      checked={field.state.value}
                      onChange={(e) => {
                        const checked = e.target.checked
                        field.handleChange(checked)

                        if (!checked) {
                          form.setFieldValue(
                            'coveredRecurringOccurrenceDate',
                            '',
                          )
                          return
                        }

                        const selectedRecurringTransaction =
                          [
                            ...formOptions.expenseRecurringTransactionOptions,
                            ...formOptions.incomeRecurringTransactionOptions,
                          ].find(
                            (option) =>
                              option.value ===
                              form.getFieldValue('recurringTransactionId'),
                          ) ?? null

                        if (
                          selectedRecurringTransaction &&
                          !form.getFieldValue('coveredRecurringOccurrenceDate')
                        ) {
                          form.setFieldValue(
                            'coveredRecurringOccurrenceDate',
                            format(
                              new Date(
                                selectedRecurringTransaction.nextOccurrenceDate,
                              ),
                              'yyyy-MM-dd',
                            ),
                          )
                        }
                      }}
                      className="accent-primary mt-0.5 size-4 shrink-0"
                    />
                    <div className="space-y-1">
                      <p className="text-foreground text-sm font-medium">
                        This payment covers a scheduled occurrence
                      </p>
                      <p className="text-muted-foreground text-xs leading-relaxed">
                        Use this when you paid a recurring expense early or late so
                        the forecasts will not count that occurrence twice.
                      </p>
                    </div>
                  </label>
                )}
              </form.Field>

              {coversScheduledOccurrence && (
                <form.Field
                  name="coveredRecurringOccurrenceDate"
                  validators={{
                    onChange: ({ value }) =>
                      !value
                        ? 'Choose the recurring occurrence this payment covers'
                        : undefined,
                  }}
                >
                  {(field) => (
                    <FormField
                      label="Covers Recurring Occurrence"
                      htmlFor="txn-covered-occurrence-date"
                      hint="Choose the scheduled recurring date this payment should satisfy."
                      error={field.state.meta.errors[0]?.toString()}
                    >
                      <DateInput
                        id="txn-covered-occurrence-date"
                        name="txn-covered-occurrence-date"
                        value={field.state.value}
                        onChange={(e) => field.handleChange(e.target.value)}
                        onBlur={field.handleBlur}
                      />
                    </FormField>
                  )}
                </form.Field>
              )}
            </div>
          )
        }}
      </form.Subscribe>

      {/* Note (optional) */}
      <form.Field name="note">
        {(field) => (
          <FormField label="Note" htmlFor="txn-note" hint="Optional">
            <Input
              id="txn-note"
              name="txn-note"
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
        {onDelete && (
          <Button
            onClick={() => void onDelete()}
            variant="secondary"
            className="bg-destructive/10 text-destructive hover:bg-destructive/15"
            fullWidth
          >
            Delete
          </Button>
        )}
        <form.Subscribe
          selector={(state) => [state.canSubmit, state.isSubmitting]}
        >
          {([canSubmit, isSubmitting]) => (
            <Button
              type="submit"
              disabled={!canSubmit || !!isSubmitting}
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

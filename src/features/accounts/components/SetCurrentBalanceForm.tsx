import { useForm } from '@tanstack/react-form'
import { Button } from '#/components/common/Button'
import { CurrencyInput } from '#/components/common/CurrencyInput'
import { DateTimeInput } from '#/components/common/DateTimeInput'
import { FormField } from '#/components/common/FormField'
import { formatDateTimeInputValueForNewTransaction } from '#/lib/dates'
import { useSmartFormAutofocus } from '#/lib/hooks/use-smart-form-autofocus'
import {
  formatMoneyInputValue,
  formatPhpCurrency,
} from '#/lib/format/number.utils'
import { MONEY_MAX_AMOUNT } from '#/lib/utils/schema'

interface SetCurrentBalanceFormProps {
  currentBalance: number
  onSubmit: (values: {
    targetBalance: number
    dateTime: string
  }) => Promise<void>
  onCancel?: () => void
}

export function SetCurrentBalanceForm({
  currentBalance,
  onSubmit,
  onCancel,
}: SetCurrentBalanceFormProps) {
  const formRef = useSmartFormAutofocus()
  const form = useForm({
    defaultValues: {
      targetBalance: formatMoneyInputValue(currentBalance),
      dateTime: formatDateTimeInputValueForNewTransaction(),
    },
    onSubmit: async ({ value }) => {
      await onSubmit({
        targetBalance: Number(value.targetBalance),
        dateTime: value.dateTime,
      })
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
      <div className="bg-card rounded-2xl px-4 py-3 shadow">
        <p className="text-muted-foreground/70 text-[10px] font-bold tracking-widest uppercase">
          Current Balance
        </p>
        <p className="text-foreground mt-1 text-lg font-bold tabular-nums">
          {formatPhpCurrency(currentBalance)}
        </p>
      </div>

      <form.Field
        name="targetBalance"
        validators={{
          onChange: ({ value }) => {
            const amount = Number(value)
            if (!value || Number.isNaN(amount) || amount < 0) {
              return 'Enter a valid balance'
            }
            if (amount > MONEY_MAX_AMOUNT) {
              return `Amount can't be greater than ${MONEY_MAX_AMOUNT.toLocaleString()}`
            }
            return undefined
          },
        }}
      >
        {(field) => (
          <FormField
            label="New Current Balance"
            htmlFor="set-balance-amount"
            hint="We will create an adjustment transaction to reach this balance."
            error={field.state.meta.errors[0]?.toString()}
            required
          >
            <CurrencyInput
              id="set-balance-amount"
              name="set-balance-amount"
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              onBlur={field.handleBlur}
            />
          </FormField>
        )}
      </form.Field>

      <form.Field name="dateTime">
        {(field) => (
          <FormField label="Date and Time" htmlFor="set-balance-date">
            <DateTimeInput
              id="set-balance-date"
              name="set-balance-date"
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
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
        <form.Subscribe
          selector={(state) => [state.canSubmit, state.isSubmitting]}
        >
          {([canSubmit, isSubmitting]) => (
            <Button
              type="submit"
              disabled={!canSubmit || isSubmitting}
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

import { useForm } from '@tanstack/react-form'
import { format } from 'date-fns'
import { Button } from '#/components/common/Button'
import { CurrencyInput } from '#/components/common/CurrencyInput'
import { DateInput } from '#/components/common/DateInput'
import { FormField } from '#/components/common/FormField'
import { useSmartFormAutofocus } from '#/lib/hooks/use-smart-form-autofocus'
import { MONEY_MAX_AMOUNT } from '#/lib/utils/schema'

interface AddBalanceFormProps {
  onSubmit: (values: { amount: number; date: string }) => Promise<void>
  onCancel?: () => void
}

export function AddBalanceForm({ onSubmit, onCancel }: AddBalanceFormProps) {
  const formRef = useSmartFormAutofocus()
  const form = useForm({
    defaultValues: {
      amount: '',
      date: format(new Date(), 'yyyy-MM-dd'),
    },
    onSubmit: async ({ value }) => {
      await onSubmit({
        amount: Number(value.amount),
        date: value.date,
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
      <form.Field
        name="amount"
        validators={{
          onChange: ({ value }) => {
            const amount = Number(value)
            if (!value || Number.isNaN(amount) || amount <= 0)
              return 'Enter a valid amount'
            if (amount > MONEY_MAX_AMOUNT)
              return `Amount can't be greater than ${MONEY_MAX_AMOUNT.toLocaleString()}`
            return undefined
          },
        }}
      >
        {(field) => (
          <FormField
            label="Amount"
            htmlFor="add-balance-amount"
            error={field.state.meta.errors[0]?.toString()}
            required
          >
            <CurrencyInput
              id="add-balance-amount"
              name="add-balance-amount"
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              onBlur={field.handleBlur}
            />
          </FormField>
        )}
      </form.Field>

      <form.Field name="date">
        {(field) => (
          <FormField label="Date" htmlFor="add-balance-date">
            <DateInput
              id="add-balance-date"
              name="add-balance-date"
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
              {isSubmitting ? 'Saving…' : 'Add'}
            </Button>
          )}
        </form.Subscribe>
      </div>
    </form>
  )
}

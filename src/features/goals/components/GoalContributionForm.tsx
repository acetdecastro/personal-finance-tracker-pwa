import { useForm } from '@tanstack/react-form'
import { format } from 'date-fns'
import { Button } from '#/components/common/Button'
import { CurrencyInput } from '#/components/common/CurrencyInput'
import { DateInput } from '#/components/common/DateInput'
import { FormField } from '#/components/common/FormField'
import { MONEY_MAX_AMOUNT } from '#/lib/utils/schema'
import { SelectInput } from '#/components/common/SelectInput'
import type { Account } from '#/types/domain'

interface GoalContributionFormProps {
  accounts: Account[]
  mode?: 'in' | 'out'
  onSubmit: (values: {
    accountId: string
    amount: number
    date: string
  }) => Promise<void>
  onCancel?: () => void
}

export function GoalContributionForm({
  accounts,
  mode = 'in',
  onSubmit,
  onCancel,
}: GoalContributionFormProps) {
  const form = useForm({
    defaultValues: {
      accountId: accounts[0]?.id ?? '',
      amount: '',
      date: format(new Date(), 'yyyy-MM-dd'),
    },
    onSubmit: async ({ value }) => {
      await onSubmit({
        accountId: value.accountId,
        amount: Number(value.amount),
        date: value.date,
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
        name="accountId"
        validators={{
          onChange: ({ value }) => (!value ? 'Select an account' : undefined),
        }}
      >
        {(field) => (
          <FormField
            label={mode === 'out' ? 'Destination Account' : 'Source Account'}
            htmlFor="goal-contribution-account"
            error={field.state.meta.errors[0]?.toString()}
            required
          >
            <SelectInput
              id="goal-contribution-account"
              name="goal-contribution-account"
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
            >
              <option value="">
                {mode === 'out'
                  ? 'Select destination account'
                  : 'Select account'}
              </option>
              {accounts.map((account) => (
                <option key={account.id} value={account.id}>
                  {account.name}
                </option>
              ))}
            </SelectInput>
          </FormField>
        )}
      </form.Field>

      <form.Field
        name="amount"
        validators={{
          onChange: ({ value }) => {
            const amount = Number(value)

            if (!value || Number.isNaN(amount) || amount <= 0) {
              return 'Enter a valid amount'
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
            label="Amount"
            htmlFor="goal-contribution-amount"
            error={field.state.meta.errors[0]?.toString()}
            required
          >
            <CurrencyInput
              id="goal-contribution-amount"
              name="goal-contribution-amount"
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              onBlur={field.handleBlur}
            />
          </FormField>
        )}
      </form.Field>

      <form.Field name="date">
        {(field) => (
          <FormField label="Date" htmlFor="goal-contribution-date">
            <DateInput
              id="goal-contribution-date"
              name="goal-contribution-date"
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

import { useForm } from '@tanstack/react-form'
import { format } from 'date-fns'
import { Button } from '#/components/common/Button'
import { CurrencyInput } from '#/components/common/CurrencyInput'
import { DateInput } from '#/components/common/DateInput'
import { FormField } from '#/components/common/FormField'
import { Input } from '#/components/common/Input'
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
            <Input
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
            <CurrencyInput
              value={field.state.value as unknown as string}
              onChange={(e) => field.handleChange(e.target.value as unknown as number)}
              onBlur={field.handleBlur}
            />
          </FormField>
        )}
      </form.Field>

      <form.Field name="currentAmount">
        {(field) => (
          <FormField label="Already Saved" hint="Optional — how much you've saved so far">
            <CurrencyInput
              value={field.state.value as unknown as string}
              onChange={(e) => field.handleChange(e.target.value as unknown as number)}
            />
          </FormField>
        )}
      </form.Field>

      <form.Field name="targetDate">
        {(field) => (
          <FormField label="Target Date" hint="Optional">
            <DateInput
              min={format(new Date(), 'yyyy-MM-dd')}
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
        <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]}>
          {([canSubmit, isSubmitting]) => (
            <Button
              type="submit"
              disabled={!canSubmit || isSubmitting}
              fullWidth
            >
              {isSubmitting ? 'Saving…' : 'Create Goal'}
            </Button>
          )}
        </form.Subscribe>
      </div>
    </form>
  )
}

import { useForm } from '@tanstack/react-form'
import { format } from 'date-fns'
import { Button } from '#/components/common/Button'
import { CurrencyInput } from '#/components/common/CurrencyInput'
import { DateInput } from '#/components/common/DateInput'
import { FormField } from '#/components/common/FormField'
import { Input } from '#/components/common/Input'
import { InfoBanner } from '#/components/common/InfoBanner'
import { toStoredDate } from '#/lib/dates'
import { ENTITY_NAME_MAX_LENGTH, MONEY_MAX_AMOUNT } from '#/lib/utils/schema'
import type { Goal } from '#/types/domain'
import type { CreateGoalInput } from '../schemas/goal.schemas'

interface GoalFormProps {
  onSubmit: (values: CreateGoalInput) => Promise<void>
  onDelete?: () => Promise<void>
  onCancel?: () => void
  submitLabel?: string
  initialValues?: Partial<Goal>
  deleteBlockedReason?: string | null
  deleteNotice?: string | null
}

export function GoalForm({
  onSubmit,
  onDelete,
  onCancel,
  submitLabel = 'Save',
  initialValues,
  deleteBlockedReason,
  deleteNotice,
}: GoalFormProps) {
  const form = useForm({
    defaultValues: {
      name: initialValues?.name ?? '',
      targetAmount:
        initialValues?.targetAmount !== undefined
          ? String(initialValues.targetAmount)
          : ('' as unknown as number),
      currentAmount:
        initialValues?.currentAmount !== undefined &&
        initialValues.currentAmount !== null
          ? String(initialValues.currentAmount)
          : ('' as unknown as number),
      targetDate: initialValues?.targetDate
        ? format(new Date(initialValues.targetDate), 'yyyy-MM-dd')
        : '',
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
        validators={{
          onChange: ({ value }) => {
            const trimmedValue = value.trim()

            if (!trimmedValue) {
              return 'Name is required'
            }

            if (trimmedValue.length > ENTITY_NAME_MAX_LENGTH) {
              return `Name must be ${ENTITY_NAME_MAX_LENGTH} characters or fewer`
            }

            return undefined
          },
        }}
      >
        {(field) => (
          <FormField
            label="Goal Name"
            htmlFor="goal-name"
            error={field.state.meta.errors[0]?.toString()}
            counter={`${field.state.value.length}/${ENTITY_NAME_MAX_LENGTH}`}
            required
          >
            <Input
              id="goal-name"
              name="goal-name"
              maxLength={ENTITY_NAME_MAX_LENGTH}
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
            if (!value || isNaN(n) || n <= 0)
              return 'Enter a valid target amount'
            if (n > MONEY_MAX_AMOUNT) {
              return `Amount can't be greater than ${MONEY_MAX_AMOUNT.toLocaleString()}`
            }
            return undefined
          },
        }}
      >
        {(field) => (
          <FormField
            label="Target Amount"
            htmlFor="goal-target-amount"
            error={field.state.meta.errors[0]?.toString()}
            required
          >
            <CurrencyInput
              id="goal-target-amount"
              name="goal-target-amount"
              value={field.state.value as unknown as string}
              onChange={(e) =>
                field.handleChange(e.target.value as unknown as number)
              }
              onBlur={field.handleBlur}
            />
          </FormField>
        )}
      </form.Field>

      <form.Field
        name="currentAmount"
        validators={{
          onChange: ({ value }) => {
            if (!value) return undefined

            const n = Number(value)
            if (isNaN(n) || n < 0) return 'Enter a valid amount'
            if (n > MONEY_MAX_AMOUNT) {
              return `Amount can't be greater than ${MONEY_MAX_AMOUNT.toLocaleString()}`
            }
            return undefined
          },
        }}
      >
        {(field) => (
          <FormField
            label="Already Saved"
            htmlFor="goal-current-amount"
            hint="Optional — how much you've saved so far"
            error={field.state.meta.errors[0]?.toString()}
          >
            <CurrencyInput
              id="goal-current-amount"
              name="goal-current-amount"
              value={field.state.value as unknown as string}
              onChange={(e) =>
                field.handleChange(e.target.value as unknown as number)
              }
            />
          </FormField>
        )}
      </form.Field>

      <form.Field name="targetDate">
        {(field) => (
          <FormField
            label="Target Date"
            htmlFor="goal-target-date"
            hint="Optional"
          >
            <DateInput
              id="goal-target-date"
              name="goal-target-date"
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
              disabled={!canSubmit || isSubmitting}
              fullWidth
            >
              {isSubmitting ? 'Saving…' : submitLabel}
            </Button>
          )}
        </form.Subscribe>
      </div>
      {(deleteBlockedReason || deleteNotice) && (
        <InfoBanner message={deleteBlockedReason ?? deleteNotice!} />
      )}
    </form>
  )
}

import { useForm } from '@tanstack/react-form'
import { Button } from '#/components/common/Button'
import { CurrencyInput } from '#/components/common/CurrencyInput'
import { FormField } from '#/components/common/FormField'
import { SelectInput } from '#/components/common/SelectInput'
import { useSmartFormAutofocus } from '#/lib/hooks/use-smart-form-autofocus'
import { MONEY_MAX_AMOUNT } from '#/lib/utils/schema'
import type { CategoryOptionDto } from '#/types/dto'
import type { Budget } from '#/types/domain'
import type { CreateBudgetInput } from '../schemas/budget.schemas'

interface BudgetFormProps {
  categories: CategoryOptionDto[]
  onSubmit: (values: CreateBudgetInput) => Promise<void>
  onDelete?: () => Promise<void>
  onCancel?: () => void
  submitLabel?: string
  initialValues?: Partial<Budget>
}

export function BudgetForm({
  categories,
  onSubmit,
  onDelete,
  onCancel,
  submitLabel = 'Save',
  initialValues,
}: BudgetFormProps) {
  const formRef = useSmartFormAutofocus()
  const form = useForm({
    defaultValues: {
      categoryId: initialValues?.categoryId ?? '',
      amount:
        initialValues?.amount !== undefined
          ? String(initialValues.amount)
          : ('' as unknown as number),
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
      ref={formRef}
      onSubmit={(e) => {
        e.preventDefault()
        form.handleSubmit()
      }}
      className="space-y-4"
    >
      <form.Field
        name="categoryId"
        validators={{
          onChange: ({ value }) => (!value ? 'Select a category' : undefined),
        }}
      >
        {(field) => (
          <FormField
            label="Category"
            htmlFor="budget-category"
            error={field.state.meta.errors[0]?.toString()}
            required
          >
            <SelectInput
              id="budget-category"
              name="budget-category"
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
            >
              <option value="">Select category</option>
              {categories.map((category) => (
                <option key={category.value} value={category.value}>
                  {category.label}
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
            label="Monthly Limit"
            htmlFor="budget-amount"
            error={field.state.meta.errors[0]?.toString()}
            required
          >
            <CurrencyInput
              id="budget-amount"
              name="budget-amount"
              value={field.state.value as unknown as string}
              onChange={(e) =>
                field.handleChange(e.target.value as unknown as number)
              }
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
              disabled={!canSubmit || isSubmitting}
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

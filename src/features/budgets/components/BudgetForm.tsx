import { useForm } from '@tanstack/react-form'
import { Button } from '#/components/common/Button'
import { CurrencyInput } from '#/components/common/CurrencyInput'
import { FormField } from '#/components/common/FormField'
import { SelectInput } from '#/components/common/SelectInput'
import type { CategoryOptionDto } from '#/types/dto'
import type { CreateBudgetInput } from '../schemas/budget.schemas'

interface BudgetFormProps {
  categories: CategoryOptionDto[]
  onSubmit: (values: CreateBudgetInput) => Promise<void>
  onCancel?: () => void
}

export function BudgetForm({ categories, onSubmit, onCancel }: BudgetFormProps) {
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
            <SelectInput
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
            return undefined
          },
        }}
      >
        {(field) => (
          <FormField label="Monthly Limit" error={field.state.meta.errors[0]?.toString()} required>
            <CurrencyInput
              value={field.state.value as unknown as string}
              onChange={(e) => field.handleChange(e.target.value as unknown as number)}
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
              disabled={!canSubmit || isSubmitting}
              fullWidth
            >
              {isSubmitting ? 'Saving…' : 'Set Budget'}
            </Button>
          )}
        </form.Subscribe>
      </div>
    </form>
  )
}

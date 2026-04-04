import { useForm } from '@tanstack/react-form'
import { Button } from '#/components/common/Button'
import { CurrencyInput } from '#/components/common/CurrencyInput'
import { FormField } from '#/components/common/FormField'
import { Input } from '#/components/common/Input'
import { cn } from '#/lib/utils/cn'
import type { CreateAccountInput } from '../schemas/account.schemas'

interface AccountFormProps {
  onSubmit: (values: CreateAccountInput) => Promise<void>
  onCancel?: () => void
  submitLabel?: string
  initialValues?: Partial<CreateAccountInput>
  showSafetyBuffer?: boolean
}

const ACCOUNT_TYPES = [
  { value: 'cash', label: 'Cash' },
  { value: 'bank', label: 'Bank' },
  { value: 'ewallet', label: 'E-wallet' },
  { value: 'other', label: 'Other' },
] as const

export function AccountForm({
  onSubmit,
  onCancel,
  submitLabel = 'Add Account',
  initialValues,
  showSafetyBuffer = true,
}: AccountFormProps) {
  const form = useForm({
    defaultValues: {
      name: initialValues?.name ?? '',
      type: initialValues?.type ?? ('bank' as CreateAccountInput['type']),
      initialBalance: initialValues?.initialBalance?.toString() ?? '',
      safetyBuffer: initialValues?.safetyBuffer?.toString() ?? '',
      isArchived: initialValues?.isArchived ?? false,
    },
    onSubmit: async ({ value }) => {
      await onSubmit({
        ...value,
        initialBalance: Number(value.initialBalance || 0),
        safetyBuffer: Number(value.safetyBuffer || 0),
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
          <FormField label="Account Name" error={field.state.meta.errors[0]?.toString()} required>
            <Input
              placeholder="e.g. BDO Savings"
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              onBlur={field.handleBlur}
            />
          </FormField>
        )}
      </form.Field>

      <form.Field name="type">
        {(field) => (
          <FormField label="Account Type" required>
            <div className="grid grid-cols-4 gap-2">
              {ACCOUNT_TYPES.map((t) => (
                <Button
                  key={t.value}
                  onClick={() => field.handleChange(t.value)}
                  className={cn(
                    'rounded-xl px-3 py-2.5 text-xs font-semibold transition',
                    field.state.value === t.value
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-secondary-foreground',
                  )}
                >
                  {t.label}
                </Button>
              ))}
            </div>
          </FormField>
        )}
      </form.Field>

      <form.Field
        name="initialBalance"
        validators={{
          onChange: ({ value }) => {
            const n = Number(value || 0)
            return n < 0 ? 'Balance cannot be negative' : undefined
          },
        }}
      >
        {(field) => (
          <FormField label="Starting Balance" error={field.state.meta.errors[0]?.toString()} hint="Current amount in this account">
            <CurrencyInput
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              onBlur={field.handleBlur}
            />
          </FormField>
        )}
      </form.Field>

      {showSafetyBuffer && (
        <form.Field
          name="safetyBuffer"
          validators={{
            onChange: ({ value }) => {
              const n = Number(value || 0)
              return n < 0 ? 'Safety buffer cannot be negative' : undefined
            },
          }}
        >
          {(field) => (
            <FormField
              label="Safety Buffer"
              error={field.state.meta.errors[0]?.toString()}
              hint="Reserved amount to keep untouched in this account"
            >
              <CurrencyInput
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                onBlur={field.handleBlur}
              />
            </FormField>
          )}
        </form.Field>
      )}

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
              {isSubmitting ? 'Saving…' : submitLabel}
            </Button>
          )}
        </form.Subscribe>
      </div>
    </form>
  )
}

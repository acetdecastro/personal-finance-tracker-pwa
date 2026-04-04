import { useForm } from '@tanstack/react-form'
import { FormField } from '#/components/common/FormField'
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
      initialBalance: initialValues?.initialBalance ?? 0,
      safetyBuffer: initialValues?.safetyBuffer ?? 0,
      isArchived: initialValues?.isArchived ?? false,
    },
    onSubmit: async ({ value }) => {
      await onSubmit(value)
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
            <input
              className="w-full rounded-xl bg-input px-4 py-3 text-sm text-foreground outline-none ring-1 ring-border transition focus:ring-2 focus:ring-ring"
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
                <button
                  key={t.value}
                  type="button"
                  onClick={() => field.handleChange(t.value)}
                  className={`rounded-xl px-3 py-2.5 text-xs font-semibold transition ${
                    field.state.value === t.value
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-secondary-foreground'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </FormField>
        )}
      </form.Field>

      <form.Field
        name="initialBalance"
        validators={{
          onChange: ({ value }) =>
            value < 0 ? 'Balance cannot be negative' : undefined,
        }}
      >
        {(field) => (
          <FormField label="Starting Balance" error={field.state.meta.errors[0]?.toString()} hint="Current amount in this account">
            <div className="relative">
              <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm font-medium text-muted-foreground">
                ₱
              </span>
              <input
                type="number"
                inputMode="decimal"
                step="0.01"
                min="0"
                className="w-full rounded-xl bg-input py-3 pl-8 pr-4 text-sm text-foreground outline-none ring-1 ring-border transition focus:ring-2 focus:ring-ring"
                value={field.state.value}
                onChange={(e) => field.handleChange(parseFloat(e.target.value) || 0)}
                onBlur={field.handleBlur}
              />
            </div>
          </FormField>
        )}
      </form.Field>

      {showSafetyBuffer && (
        <form.Field
          name="safetyBuffer"
          validators={{
            onChange: ({ value }) =>
              value < 0 ? 'Safety buffer cannot be negative' : undefined,
          }}
        >
          {(field) => (
            <FormField
              label="Safety Buffer"
              error={field.state.meta.errors[0]?.toString()}
              hint="Reserved amount to keep untouched in this account"
            >
              <div className="relative">
                <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm font-medium text-muted-foreground">
                  ₱
                </span>
                <input
                  type="number"
                  inputMode="decimal"
                  step="0.01"
                  min="0"
                  className="w-full rounded-xl bg-input py-3 pl-8 pr-4 text-sm text-foreground outline-none ring-1 ring-border transition focus:ring-2 focus:ring-ring"
                  value={field.state.value}
                  onChange={(e) =>
                    field.handleChange(parseFloat(e.target.value) || 0)
                  }
                  onBlur={field.handleBlur}
                />
              </div>
            </FormField>
          )}
        </form.Field>
      )}

      <div className="flex gap-3 pt-2">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 rounded-xl bg-muted py-3 text-sm font-semibold text-secondary-foreground transition active:scale-[0.98]"
          >
            Cancel
          </button>
        )}
        <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]}>
          {([canSubmit, isSubmitting]) => (
            <button
              type="submit"
              disabled={!canSubmit || isSubmitting}
              className="flex-1 rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground transition active:scale-[0.98] disabled:opacity-50"
            >
              {isSubmitting ? 'Saving…' : submitLabel}
            </button>
          )}
        </form.Subscribe>
      </div>
    </form>
  )
}

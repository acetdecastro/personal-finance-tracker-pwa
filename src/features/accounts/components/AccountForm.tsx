import { useForm } from '@tanstack/react-form'
import { Button } from '#/components/common/Button'
import { CurrencyInput } from '#/components/common/CurrencyInput'
import { FormField } from '#/components/common/FormField'
import { Input } from '#/components/common/Input'
import { useSmartFormAutofocus } from '#/lib/hooks/use-smart-form-autofocus'
import { ENTITY_NAME_MAX_LENGTH, MONEY_MAX_AMOUNT } from '#/lib/utils/schema'
import { formatPhpCurrency } from '#/lib/format/number.utils'
import { cn } from '#/lib/utils/cn'
import type { CreateAccountInput } from '../schemas/account.schemas'

interface AccountFormProps {
  onSubmit: (values: CreateAccountInput) => Promise<void>
  onEditCurrentBalance?: () => void
  onArchive?: () => Promise<void>
  onRestore?: () => Promise<void>
  onDelete?: () => Promise<void>
  onCancel?: () => void
  submitLabel?: string
  initialValues?: Partial<CreateAccountInput>
  showSafetyBuffer?: boolean
  currentBalance?: number
}

const ACCOUNT_TYPES = [
  { value: 'cash', label: 'Cash' },
  { value: 'bank', label: 'Bank' },
  { value: 'ewallet', label: 'E-wallet' },
  { value: 'other', label: 'Other' },
] as const

export function AccountForm({
  onSubmit,
  onEditCurrentBalance,
  onArchive,
  onRestore,
  onDelete,
  onCancel,
  submitLabel = 'Save',
  initialValues,
  showSafetyBuffer = true,
  currentBalance,
}: AccountFormProps) {
  const formRef = useSmartFormAutofocus()
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

  const isEditing = currentBalance !== undefined

  return (
    <form
      ref={formRef}
      onSubmit={(e) => {
        e.preventDefault()
        form.handleSubmit()
      }}
      className="space-y-4"
    >
      {isEditing && (
        <div className="bg-card rounded-2xl px-4 py-3 shadow">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-muted-foreground/70 text-[10px] font-bold tracking-widest uppercase">
                Current Balance
              </p>
              <p className="text-foreground mt-1 text-xl font-bold tabular-nums">
                {formatPhpCurrency(currentBalance)}
              </p>
            </div>
            {onEditCurrentBalance && (
              <Button
                variant="inline-primary"
                className="-mr-2"
                onClick={onEditCurrentBalance}
              >
                Edit
              </Button>
            )}
          </div>
          <div className="border-border/50 mt-2 flex items-center justify-between border-t pt-2">
            <p className="text-muted-foreground/70 text-[10px] font-bold tracking-widest uppercase">
              Starting Balance
            </p>
            <p className="text-muted-foreground text-xs font-semibold tabular-nums">
              {formatPhpCurrency(initialValues?.initialBalance ?? 0)}
            </p>
          </div>
        </div>
      )}

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
            label="Account Name"
            htmlFor="account-name"
            error={field.state.meta.errors[0]?.toString()}
            counter={`${field.state.value.length}/${ENTITY_NAME_MAX_LENGTH}`}
            required
          >
            <Input
              id="account-name"
              name="account-name"
              maxLength={ENTITY_NAME_MAX_LENGTH}
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

      {!isEditing && (
        <form.Field
          name="initialBalance"
          validators={{
            onChange: ({ value }) => {
              const n = Number(value || 0)
              if (n < 0) return 'Balance cannot be negative'
              if (n > MONEY_MAX_AMOUNT) {
                return `Amount can't be greater than ${MONEY_MAX_AMOUNT.toLocaleString()}`
              }
              return undefined
            },
          }}
        >
          {(field) => (
            <FormField
              label="Starting Balance"
              htmlFor="account-initial-balance"
              error={field.state.meta.errors[0]?.toString()}
              hint="The opening balance when this account was added"
            >
              <CurrencyInput
                id="account-initial-balance"
                name="account-initial-balance"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                onBlur={field.handleBlur}
              />
            </FormField>
          )}
        </form.Field>
      )}

      {showSafetyBuffer && (
        <form.Field
          name="safetyBuffer"
          validators={{
            onChange: ({ value }) => {
              const n = Number(value || 0)
              if (n < 0) return 'Safety buffer cannot be negative'
              if (n > MONEY_MAX_AMOUNT) {
                return `Amount can't be greater than ${MONEY_MAX_AMOUNT.toLocaleString()}`
              }
              return undefined
            },
          }}
        >
          {(field) => (
            <FormField
              label="Safety Buffer"
              htmlFor="account-safety-buffer"
              error={field.state.meta.errors[0]?.toString()}
              hint="Reserved amount to keep untouched in this account"
            >
              <CurrencyInput
                id="account-safety-buffer"
                name="account-safety-buffer"
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
        {onRestore && (
          <Button
            onClick={() => void onRestore()}
            variant="secondary"
            fullWidth
          >
            Restore
          </Button>
        )}
        {onArchive && (
          <Button
            onClick={() => void onArchive()}
            variant="secondary"
            fullWidth
          >
            Archive
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

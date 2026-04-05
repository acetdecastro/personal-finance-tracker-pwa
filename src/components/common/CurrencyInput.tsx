import type { ChangeEvent, FocusEvent, InputHTMLAttributes } from 'react'
import { useEffect, useState } from 'react'
import { Input } from '#/components/common/Input'
import { cn } from '#/lib/utils/cn'

interface CurrencyInputProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'type' | 'inputMode'
> {
  symbol?: string
}

function toRawValue(value: CurrencyInputProps['value']) {
  if (value === undefined) return ''

  const normalized = String(value).replace(/,/g, '')

  if (normalized === 'NaN') return ''

  return normalized
}

function sanitizeCurrencyInput(value: string) {
  const cleaned = value.replace(/[^\d.]/g, '')
  const firstDotIndex = cleaned.indexOf('.')

  if (firstDotIndex === -1) return cleaned

  const integerPart = cleaned.slice(0, firstDotIndex + 1)
  const decimalPart = cleaned.slice(firstDotIndex + 1).replace(/\./g, '')

  return integerPart + decimalPart
}

function formatCurrencyDisplay(rawValue: string) {
  if (!rawValue) return ''
  if (rawValue === '.') return '.'

  const parts = rawValue.split('.')
  const integerPart = parts[0] ?? ''
  const decimalPart = parts[1]
  const normalizedInteger = integerPart.replace(/^0+(?=\d)/, '') || '0'
  const formattedInteger = normalizedInteger.replace(
    /\B(?=(\d{3})+(?!\d))/g,
    ',',
  )

  if (parts.length === 1) return formattedInteger
  if (decimalPart === '') return `${formattedInteger}.`

  return `${formattedInteger}.${decimalPart}`
}

function normalizeCurrencyValue(rawValue: string) {
  if (!rawValue || rawValue === '.') return ''

  return rawValue
}

export function CurrencyInput({
  symbol = '₱',
  className,
  onChange,
  onFocus,
  onBlur,
  value,
  placeholder = '0.00',
  ...props
}: CurrencyInputProps) {
  const [hasInteracted, setHasInteracted] = useState(false)
  const rawValue = toRawValue(value)

  useEffect(() => {
    if (rawValue && rawValue !== '0' && rawValue !== '0.00') {
      setHasInteracted(true)
    }
  }, [rawValue])

  const shouldShowPlaceholder =
    !hasInteracted &&
    (rawValue === '' || rawValue === '0' || rawValue === '0.00')
  const displayValue = shouldShowPlaceholder
    ? ''
    : formatCurrencyDisplay(rawValue)

  function emitChange(
    nextRawValue: string,
    event: ChangeEvent<HTMLInputElement>,
  ) {
    if (!onChange) return

    const nextEvent = {
      ...event,
      target: { ...event.target, value: nextRawValue },
      currentTarget: { ...event.currentTarget, value: nextRawValue },
    } as ChangeEvent<HTMLInputElement>

    onChange(nextEvent)
  }

  return (
    <div className="relative">
      <span className="text-muted-foreground pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-sm font-medium">
        {symbol}
      </span>
      <Input
        {...props}
        type="text"
        inputMode="decimal"
        className={cn('pr-4 pl-8', className)}
        placeholder={placeholder}
        value={displayValue}
        onChange={(event) => {
          setHasInteracted(true)
          const nextRawValue = sanitizeCurrencyInput(event.target.value)
          emitChange(nextRawValue, event)
        }}
        onFocus={(event) => onFocus?.(event as FocusEvent<HTMLInputElement>)}
        onBlur={(event) => {
          const nextRawValue = normalizeCurrencyValue(
            sanitizeCurrencyInput(event.target.value),
          )
          emitChange(nextRawValue, event as ChangeEvent<HTMLInputElement>)
          onBlur?.(event as FocusEvent<HTMLInputElement>)
        }}
      />
    </div>
  )
}

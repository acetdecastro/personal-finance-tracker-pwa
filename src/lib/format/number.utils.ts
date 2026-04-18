const phpCurrencyFormatter = new Intl.NumberFormat('en-PH', {
  style: 'currency',
  currency: 'PHP',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

const defaultNumberFormatter = new Intl.NumberFormat('en-PH', {
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
})

type CurrencyTextSizeVariant = 'hero' | 'summary' | 'list' | 'monthly-flow'

function isFiniteNumber(value: number | null | undefined): value is number {
  return typeof value === 'number' && Number.isFinite(value)
}

export function formatPhpCurrency(
  value: number | null | undefined,
  fallback = '₱0.00',
): string {
  if (!isFiniteNumber(value)) {
    return fallback
  }

  return phpCurrencyFormatter.format(value)
}

export function formatNumber(
  value: number | null | undefined,
  fallback = '0',
): string {
  if (!isFiniteNumber(value)) {
    return fallback
  }

  return defaultNumberFormatter.format(value)
}

export function formatMoneyInputValue(
  value: number | null | undefined,
): string {
  if (!isFiniteNumber(value)) {
    return ''
  }

  return (Math.round((value + Number.EPSILON) * 100) / 100).toFixed(2)
}

export function getCurrencyTextSizeClass(
  formattedValue: string,
  variant: CurrencyTextSizeVariant = 'list',
): string {
  const length = formattedValue.length

  if (variant === 'hero') {
    if (length >= 18) return 'text-xl'
    if (length >= 14) return 'text-2xl'

    return 'text-3xl'
  }

  return 'text-xs'
}

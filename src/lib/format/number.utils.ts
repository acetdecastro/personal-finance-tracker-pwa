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

import { format, isValid, parse, parseISO } from 'date-fns'
import {
  DISPLAY_DATE_FORMAT,
  DISPLAY_DATE_TIME_FORMAT,
} from '#/lib/constants/date-format'

const STORED_DATE_PATTERN =
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})Z$/

function toDate(value: Date | string | number): Date {
  if (value instanceof Date) {
    if (!isValid(value)) {
      throw new Error('Invalid date value')
    }

    return value
  }

  const parsed =
    typeof value === 'string' ? parseISO(value) : new Date(value)

  if (!isValid(parsed)) {
    throw new Error('Invalid date value')
  }

  return parsed
}

export function toStoredDate(value: Date | string | number): string {
  return toDate(value).toISOString()
}

export function nowStoredAt(): string {
  return new Date().toISOString()
}

export function fromStoredDate(value: string): Date {
  if (!isStoredDateString(value)) {
    throw new Error('Invalid stored date value')
  }

  return parseISO(value)
}

export function isStoredDateString(value: string): boolean {
  if (!STORED_DATE_PATTERN.test(value)) {
    return false
  }

  return isValid(parseISO(value))
}

export function formatDisplayDate(value: Date | string | number): string {
  return format(toDate(value), DISPLAY_DATE_FORMAT)
}

export function formatDisplayDateTime(value: Date | string | number): string {
  return format(toDate(value), DISPLAY_DATE_TIME_FORMAT)
}

export function parseDisplayDate(value: string): Date {
  const parsed = parse(value, DISPLAY_DATE_FORMAT, new Date())

  if (!isValid(parsed)) {
    throw new Error('Invalid display date value')
  }

  return parsed
}

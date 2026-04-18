import { isValid, parse, parseISO } from 'date-fns'
import { DISPLAY_DATE_FORMAT } from '#/lib/constants/date-format'

const STORED_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})Z$/
const DATE_INPUT_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/
const DATE_TIME_INPUT_PATTERN = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/

export const APP_TIME_ZONE = 'Asia/Manila'
export const APP_UTC_OFFSET_MINUTES = 480
export const DEFAULT_RECURRING_TIME = '09:00'

const APP_UTC_OFFSET_MS = APP_UTC_OFFSET_MINUTES * 60 * 1000
const MONTH_LABELS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
] as const

function toDate(value: Date | string | number): Date {
  if (value instanceof Date) {
    if (!isValid(value)) {
      throw new Error('Invalid date value')
    }

    return value
  }

  const parsed = typeof value === 'string' ? parseISO(value) : new Date(value)

  if (!isValid(parsed)) {
    throw new Error('Invalid date value')
  }

  return parsed
}

export function toStoredDate(value: Date | string | number): string {
  return toDate(value).toISOString()
}

function pad2(value: number): string {
  return String(value).padStart(2, '0')
}

function getAppDate(value: Date | string | number): Date {
  return new Date(toDate(value).getTime() + APP_UTC_OFFSET_MS)
}

function parseDateInputParts(dateInput: string) {
  const match = DATE_INPUT_PATTERN.exec(dateInput)

  if (!match) {
    throw new Error('Expected date input in yyyy-MM-dd format')
  }

  return {
    year: Number(match[1]),
    month: Number(match[2]),
    day: Number(match[3]),
  }
}

function parseDateTimeInputParts(dateTimeInput: string) {
  const match = DATE_TIME_INPUT_PATTERN.exec(dateTimeInput)

  if (!match) {
    throw new Error('Expected date-time input in yyyy-MM-ddTHH:mm format')
  }

  return {
    year: Number(match[1]),
    month: Number(match[2]),
    day: Number(match[3]),
    hour: Number(match[4]),
    minute: Number(match[5]),
  }
}

function assertValidAppDateTime(input: {
  year: number
  month: number
  day: number
  hour: number
  minute: number
}) {
  const appDate = new Date(
    Date.UTC(input.year, input.month - 1, input.day, input.hour, input.minute),
  )

  if (
    appDate.getUTCFullYear() !== input.year ||
    appDate.getUTCMonth() !== input.month - 1 ||
    appDate.getUTCDate() !== input.day ||
    appDate.getUTCHours() !== input.hour ||
    appDate.getUTCMinutes() !== input.minute
  ) {
    throw new Error('Invalid app date-time input value')
  }
}

export function toStoredDateFromDateInput(dateInput: string): string {
  const { year, month, day } = parseDateInputParts(dateInput)

  return toStoredDateTimeFromInput(`${year}-${pad2(month)}-${pad2(day)}T00:00`)
}

export function toStoredDateTimeFromInput(dateTimeInput: string): string {
  const parts = parseDateTimeInputParts(dateTimeInput)

  assertValidAppDateTime(parts)

  return new Date(
    Date.UTC(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute) -
      APP_UTC_OFFSET_MS,
  ).toISOString()
}

export function toStoredDateTimeForDateInput(dateInput: string): string {
  return toStoredDateFromDateInput(dateInput)
}

export function formatDateInputValue(value: Date | string | number): string {
  const appDate = getAppDate(value)

  return [
    appDate.getUTCFullYear(),
    pad2(appDate.getUTCMonth() + 1),
    pad2(appDate.getUTCDate()),
  ].join('-')
}

export function formatDateTimeInputValue(
  value: Date | string | number,
): string {
  const appDate = getAppDate(value)

  return `${formatDateInputValue(value)}T${pad2(appDate.getUTCHours())}:${pad2(
    appDate.getUTCMinutes(),
  )}`
}

export function formatDateTimeInputValueForNewTransaction(): string {
  return formatDateTimeInputValue(new Date())
}

export function formatDateTimeInputValueForNewRecurringRule(): string {
  return `${formatDateInputValue(new Date())}T${DEFAULT_RECURRING_TIME}`
}

export function formatAppDate(value: Date | string | number): string {
  const appDate = getAppDate(value)

  return `${pad2(appDate.getUTCMonth() + 1)}/${pad2(
    appDate.getUTCDate(),
  )}/${appDate.getUTCFullYear()}`
}

export function formatAppDateLabel(value: Date | string | number): string {
  const appDate = getAppDate(value)

  return `${MONTH_LABELS[appDate.getUTCMonth()]} ${appDate.getUTCDate()}, ${appDate.getUTCFullYear()}`
}

export function formatAppTime(value: Date | string | number): string {
  const appDate = getAppDate(value)
  const hours = appDate.getUTCHours()
  const period = hours >= 12 ? 'PM' : 'AM'
  const displayHours = hours % 12 || 12

  return `${pad2(displayHours)}:${pad2(appDate.getUTCMinutes())} ${period}`
}

export function formatAppDateTime(value: Date | string | number): string {
  return `${formatAppDate(value)}, ${formatAppTime(value)}`
}

export function getAppDateKey(value: Date | string | number): string {
  return formatDateInputValue(value)
}

export function getAppMonthKey(value: Date | string | number): string {
  return getAppDateKey(value).slice(0, 7)
}

export function isSameAppDay(
  left: Date | string | number,
  right: Date | string | number,
): boolean {
  return getAppDateKey(left) === getAppDateKey(right)
}

export function isSameAppMonth(
  left: Date | string | number,
  right: Date | string | number,
): boolean {
  return getAppMonthKey(left) === getAppMonthKey(right)
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
  return formatAppDate(value)
}

export function formatCompactDisplayDate(
  value: Date | string | number,
): string {
  return formatAppDate(value)
}

export function formatDisplayDateTime(value: Date | string | number): string {
  return formatAppDateTime(value)
}

export function parseDisplayDate(value: string): Date {
  const parsed = parse(value, DISPLAY_DATE_FORMAT, new Date())

  if (!isValid(parsed)) {
    throw new Error('Invalid display date value')
  }

  return parsed
}

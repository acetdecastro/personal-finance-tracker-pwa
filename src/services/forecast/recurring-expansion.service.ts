import { compareAsc, isAfter, isBefore, parseISO } from 'date-fns'
import type { RecurringRule, Transaction } from '#/types/domain'
import type { RecurringOccurrenceDto } from '#/types/dto'
import { supportsSecondSalaryAmount } from '#/features/recurring/lib/salary-rule'
import {
  formatDateTimeInputValue,
  isSameAppDay,
  toStoredDateTimeFromInput,
} from '#/lib/dates'

interface ExpandRecurringOccurrencesInput {
  rules: RecurringRule[]
  transactions?: Transaction[]
  fromDate: Date | string
  endDate: Date | string
}

function toDate(value: Date | string): Date {
  return value instanceof Date ? value : parseISO(value)
}

function parseAppDateTimeParts(value: Date | string) {
  const input = formatDateTimeInputValue(value)

  return {
    year: Number(input.slice(0, 4)),
    month: Number(input.slice(5, 7)),
    day: Number(input.slice(8, 10)),
    hour: Number(input.slice(11, 13)),
    minute: Number(input.slice(14, 16)),
  }
}

function toAppComparableDate(parts: {
  year: number
  month: number
  day: number
  hour: number
  minute: number
}) {
  return new Date(
    Date.UTC(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute),
  )
}

function toStoredFromAppComparableDate(value: Date): Date {
  const input = [
    value.getUTCFullYear(),
    String(value.getUTCMonth() + 1).padStart(2, '0'),
    String(value.getUTCDate()).padStart(2, '0'),
  ].join('-')
  const time = [
    String(value.getUTCHours()).padStart(2, '0'),
    String(value.getUTCMinutes()).padStart(2, '0'),
  ].join(':')

  return parseISO(toStoredDateTimeFromInput(`${input}T${time}`))
}

function getDaysInAppMonth(year: number, month: number): number {
  return new Date(Date.UTC(year, month, 0)).getUTCDate()
}

function setClampedAppDay(
  year: number,
  month: number,
  targetDay: number,
  source: { hour: number; minute: number },
): Date {
  return new Date(
    Date.UTC(
      year,
      month - 1,
      Math.min(targetDay, getDaysInAppMonth(year, month)),
      source.hour,
      source.minute,
    ),
  )
}

function addAppMonths(year: number, month: number, amount: number) {
  const date = new Date(Date.UTC(year, month - 1 + amount, 1))

  return {
    year: date.getUTCFullYear(),
    month: date.getUTCMonth() + 1,
  }
}

function nextOccurrenceDateForRule(
  rule: RecurringRule,
  currentDate: Date,
): Date {
  const currentParts = parseAppDateTimeParts(currentDate)

  if (rule.cadence === 'weekly') {
    const currentAppDate = toAppComparableDate(currentParts)
    currentAppDate.setUTCDate(
      currentAppDate.getUTCDate() + 7 * (rule.weeklyInterval ?? 1),
    )

    return toStoredFromAppComparableDate(currentAppDate)
  }

  if (rule.cadence === 'monthly') {
    const nextMonth = addAppMonths(currentParts.year, currentParts.month, 1)

    return toStoredFromAppComparableDate(
      setClampedAppDay(
        nextMonth.year,
        nextMonth.month,
        rule.monthlyDay ?? currentParts.day,
        currentParts,
      ),
    )
  }

  const configuredDays = [...(rule.semiMonthlyDays ?? [])].sort(
    (left, right) => left - right,
  )

  if (configuredDays.length === 0) {
    throw new Error(`Semi-monthly recurring rule is missing days: ${rule.id}`)
  }

  const currentAppDate = toAppComparableDate(currentParts)
  const sameMonthCandidates = configuredDays
    .map((day) =>
      setClampedAppDay(
        currentParts.year,
        currentParts.month,
        day,
        currentParts,
      ),
    )
    .filter((candidate) => isAfter(candidate, currentAppDate))
    .sort(compareAsc)

  if (sameMonthCandidates[0]) {
    return toStoredFromAppComparableDate(sameMonthCandidates[0])
  }

  const nextMonth = addAppMonths(currentParts.year, currentParts.month, 1)
  return toStoredFromAppComparableDate(
    setClampedAppDay(
      nextMonth.year,
      nextMonth.month,
      configuredDays[0],
      currentParts,
    ),
  )
}

function hasPostedTransactionForOccurrence(
  ruleId: string,
  occurrenceDate: Date,
  transactions: Transaction[],
): boolean {
  return transactions.some((transaction) => {
    if (transaction.recurringRuleId !== ruleId) {
      return false
    }

    if (transaction.coveredRecurringOccurrenceDate) {
      return isSameAppDay(
        transaction.coveredRecurringOccurrenceDate,
        occurrenceDate,
      )
    }

    return isSameAppDay(transaction.transactionDate, occurrenceDate)
  })
}

function resolveOccurrenceAmount(rule: RecurringRule, occurrenceDate: Date) {
  if (
    rule.secondAmount === null ||
    !supportsSecondSalaryAmount({
      type: rule.type,
      categoryId: rule.categoryId,
      cadence: rule.cadence,
    }) ||
    rule.cadence !== 'semi-monthly'
  ) {
    return rule.amount
  }

  const configuredDays = [...(rule.semiMonthlyDays ?? [])].sort(
    (left, right) => left - right,
  )

  if (configuredDays.length < 2) {
    return rule.amount
  }

  return parseAppDateTimeParts(occurrenceDate).day === configuredDays[1]
    ? rule.secondAmount
    : rule.amount
}

function expandRecurringRule(
  rule: RecurringRule,
  fromDate: Date,
  endDate: Date,
  transactions: Transaction[],
): RecurringOccurrenceDto[] {
  if (!rule.isActive) {
    return []
  }

  const occurrences: RecurringOccurrenceDto[] = []
  let cursor = parseISO(rule.nextOccurrenceDate)

  while (isBefore(cursor, fromDate)) {
    cursor = nextOccurrenceDateForRule(rule, cursor)
  }

  while (!isAfter(cursor, endDate)) {
    if (!hasPostedTransactionForOccurrence(rule.id, cursor, transactions)) {
      occurrences.push({
        id: `${rule.id}:${cursor.toISOString()}`,
        recurringRuleId: rule.id,
        name: rule.name,
        type: rule.type,
        amount: resolveOccurrenceAmount(rule, cursor),
        categoryId: rule.categoryId,
        accountId: rule.accountId,
        date: cursor.toISOString(),
      })
    }

    cursor = nextOccurrenceDateForRule(rule, cursor)
  }

  return occurrences
}

export function getNextUpcomingOccurrenceDate(
  rule: RecurringRule,
  referenceDate: Date | string,
): string {
  const fromDate = toDate(referenceDate)
  let cursor = parseISO(rule.nextOccurrenceDate)

  while (isBefore(cursor, fromDate)) {
    cursor = nextOccurrenceDateForRule(rule, cursor)
  }

  return cursor.toISOString()
}

export function expandRecurringOccurrences({
  rules,
  transactions = [],
  fromDate,
  endDate,
}: ExpandRecurringOccurrencesInput): RecurringOccurrenceDto[] {
  const start = toDate(fromDate)
  const end = toDate(endDate)

  return rules
    .flatMap((rule) => expandRecurringRule(rule, start, end, transactions))
    .sort((left, right) =>
      compareAsc(parseISO(left.date), parseISO(right.date)),
    )
}

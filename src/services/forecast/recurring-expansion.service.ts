import {
  addMonths,
  addWeeks,
  compareAsc,
  getDaysInMonth,
  isAfter,
  isBefore,
  isSameDay,
  parseISO,
  startOfMonth,
} from 'date-fns'
import type { RecurringRule, Transaction } from '#/types/domain'
import type { RecurringOccurrenceDto } from '#/types/dto'

interface ExpandRecurringOccurrencesInput {
  rules: RecurringRule[]
  transactions?: Transaction[]
  fromDate: Date | string
  endDate: Date | string
}

function toDate(value: Date | string): Date {
  return value instanceof Date ? value : parseISO(value)
}

function setClampedDay(
  baseDate: Date,
  targetDay: number,
  sourceTime: Date,
): Date {
  const clampedDay = Math.min(targetDay, getDaysInMonth(baseDate))
  const result = new Date(baseDate)
  result.setDate(clampedDay)
  result.setHours(
    sourceTime.getHours(),
    sourceTime.getMinutes(),
    sourceTime.getSeconds(),
    sourceTime.getMilliseconds(),
  )
  return result
}

function nextOccurrenceDateForRule(
  rule: RecurringRule,
  currentDate: Date,
): Date {
  if (rule.cadence === 'weekly') {
    return addWeeks(currentDate, rule.weeklyInterval ?? 1)
  }

  if (rule.cadence === 'monthly') {
    const nextMonth = addMonths(startOfMonth(currentDate), 1)
    return setClampedDay(
      nextMonth,
      rule.monthlyDay ?? currentDate.getDate(),
      currentDate,
    )
  }

  const configuredDays = [...(rule.semiMonthlyDays ?? [])].sort(
    (left, right) => left - right,
  )

  if (configuredDays.length === 0) {
    throw new Error(`Semi-monthly recurring rule is missing days: ${rule.id}`)
  }

  const sameMonthCandidates = configuredDays
    .map((day) => setClampedDay(startOfMonth(currentDate), day, currentDate))
    .filter((candidate) => isAfter(candidate, currentDate))
    .sort(compareAsc)

  if (sameMonthCandidates[0]) {
    return sameMonthCandidates[0]
  }

  const nextMonth = addMonths(startOfMonth(currentDate), 1)
  return setClampedDay(nextMonth, configuredDays[0], currentDate)
}

function hasPostedTransactionForOccurrence(
  ruleId: string,
  occurrenceDate: Date,
  transactions: Transaction[],
): boolean {
  return transactions.some(
    (transaction) =>
      transaction.recurringRuleId === ruleId &&
      isSameDay(parseISO(transaction.transactionDate), occurrenceDate),
  )
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
        amount: rule.amount,
        categoryId: rule.categoryId,
        accountId: rule.accountId,
        date: cursor.toISOString(),
      })
    }

    cursor = nextOccurrenceDateForRule(rule, cursor)
  }

  return occurrences
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

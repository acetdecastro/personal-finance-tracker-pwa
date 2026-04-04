import { addDays, compareAsc, isBefore, parseISO } from 'date-fns'
import { expandRecurringOccurrences } from './recurring-expansion.service'
import type { Account, RecurringRule, Transaction } from '#/types/domain'
import type { ForecastSummaryDto, RecurringOccurrenceDto } from '#/types/dto'

interface CalculateForecastInput {
  accounts: Account[]
  transactions: Transaction[]
  recurringRules: RecurringRule[]
  now?: Date | string
}

function toDate(value: Date | string | undefined): Date {
  if (!value) {
    return new Date()
  }

  return value instanceof Date ? value : parseISO(value)
}

function toSignedAmount(type: 'income' | 'expense', amount: number) {
  return type === 'income' ? amount : -amount
}

function calculateTotalSafetyBuffers(accounts: Account[]) {
  return accounts
    .filter((account) => !account.isArchived)
    .reduce((sum, account) => sum + account.safetyBuffer, 0)
}

export function calculateCurrentBalance(
  accounts: Account[],
  transactions: Transaction[],
): number {
  const initialBalance = accounts.reduce(
    (sum, account) => sum + account.initialBalance,
    0,
  )

  const transactionNet = transactions.reduce((sum, transaction) => {
    if (transaction.type === 'income') {
      return sum + transaction.amount
    }

    if (transaction.type === 'expense') {
      return sum - transaction.amount
    }

    return sum
  }, 0)

  return initialBalance + transactionNet
}

function projectBalanceAtDate(
  currentBalance: number,
  occurrences: RecurringOccurrenceDto[],
  targetDate: Date,
): number {
  return occurrences.reduce((balance, occurrence) => {
    if (compareAsc(parseISO(occurrence.date), targetDate) > 0) {
      return balance
    }

    return balance + toSignedAmount(occurrence.type, occurrence.amount)
  }, currentBalance)
}

function calculateLowestProjectedBalance(
  currentBalance: number,
  occurrences: RecurringOccurrenceDto[],
): number {
  let runningBalance = currentBalance
  let lowestBalance = currentBalance

  for (const occurrence of occurrences) {
    runningBalance += toSignedAmount(occurrence.type, occurrence.amount)
    lowestBalance = Math.min(lowestBalance, runningBalance)
  }

  return lowestBalance
}

export function calculateForecastSummary({
  accounts,
  transactions,
  recurringRules,
  now,
}: CalculateForecastInput): ForecastSummaryDto {
  const currentDate = toDate(now)
  const currentBalance = calculateCurrentBalance(accounts, transactions)
  const window30d = addDays(currentDate, 30)
  const allOccurrences = expandRecurringOccurrences({
    rules: recurringRules.filter((rule) => rule.isActive),
    transactions,
    fromDate: currentDate,
    endDate: window30d,
  })

  const incomeOccurrences = allOccurrences.filter(
    (occurrence) => occurrence.type === 'income',
  )
  const expenseOccurrences = allOccurrences.filter(
    (occurrence) => occurrence.type === 'expense',
  )

  const nextSalaryDate = incomeOccurrences[0]?.date ?? null

  const totalUpcomingFixedExpensesBeforeNextSalary = nextSalaryDate
    ? expenseOccurrences
        .filter((occurrence) =>
          isBefore(parseISO(occurrence.date), parseISO(nextSalaryDate)),
        )
        .reduce((sum, occurrence) => sum + occurrence.amount, 0)
    : 0
  const totalSafetyBuffers = calculateTotalSafetyBuffers(accounts)

  const projectedBalance7d = projectBalanceAtDate(
    currentBalance,
    allOccurrences,
    addDays(currentDate, 7),
  )
  const projectedBalance14d = projectBalanceAtDate(
    currentBalance,
    allOccurrences,
    addDays(currentDate, 14),
  )
  const projectedBalance30d = projectBalanceAtDate(
    currentBalance,
    allOccurrences,
    window30d,
  )

  return {
    currentBalance,
    safeToSpend:
      currentBalance - totalUpcomingFixedExpensesBeforeNextSalary - totalSafetyBuffers,
    nextSalaryDate,
    projectedBalance7d,
    projectedBalance14d,
    projectedBalance30d,
    lowestProjectedBalance30d: calculateLowestProjectedBalance(
      currentBalance,
      allOccurrences,
    ),
    totalUpcomingFixedExpensesBeforeNextSalary,
    incomeOccurrences,
    expenseOccurrences,
  }
}

import { describe, expect, it } from 'vitest'
import {
  formatAppDate,
  formatAppDateLabel,
  formatAppDateTime,
  formatAppTime,
  formatDateInputValue,
  formatDateTimeInputValue,
  formatDateTimeInputValueForNewRecurringRule,
  formatDisplayDate,
  fromStoredDate,
  getAppDateKey,
  getAppMonthKey,
  isSameAppDay,
  isSameAppMonth,
  parseDisplayDate,
  toStoredDate,
  toStoredDateFromDateInput,
  toStoredDateTimeFromInput,
} from './date.utils'

describe('date utilities', () => {
  it('formats stored dates using the centralized display format', () => {
    expect(formatDisplayDate('2026-04-16T15:35:00.000Z')).toBe('04/16/2026')
  })

  it('round-trips complete stored ISO datetimes', () => {
    const stored = toStoredDate(new Date('2026-11-02T02:05:00.000Z'))

    expect(stored).toBe('2026-11-02T02:05:00.000Z')
    expect(fromStoredDate(stored).toISOString()).toBe(stored)
  })

  it('parses the display date format back into a valid date', () => {
    expect(formatDisplayDate(parseDisplayDate('04/16/2026'))).toBe('04/16/2026')
  })

  it('converts app date-time input values to stored UTC ISO timestamps', () => {
    expect(toStoredDateTimeFromInput('2026-04-18T19:42')).toBe(
      '2026-04-18T11:42:00.000Z',
    )
    expect(toStoredDateTimeFromInput('2026-04-18T00:00')).toBe(
      '2026-04-17T16:00:00.000Z',
    )
  })

  it('formats stored UTC ISO timestamps back to app date-time input values', () => {
    expect(formatDateTimeInputValue('2026-04-18T11:42:00.000Z')).toBe(
      '2026-04-18T19:42',
    )
    expect(formatDateInputValue('2026-04-17T16:00:00.000Z')).toBe('2026-04-18')
  })

  it('converts date-only inputs to stored app midnight timestamps', () => {
    expect(toStoredDateFromDateInput('2026-04-18')).toBe(
      '2026-04-17T16:00:00.000Z',
    )
  })

  it('formats app dates and times near UTC boundaries', () => {
    expect(formatAppDate('2026-04-17T16:30:00.000Z')).toBe('04/18/2026')
    expect(formatAppDateLabel('2026-04-17T16:30:00.000Z')).toBe('Apr 18, 2026')
    expect(formatAppTime('2026-04-17T16:30:00.000Z')).toBe('12:30 AM')
    expect(formatAppDateTime('2026-04-17T16:30:00.000Z')).toBe(
      '04/18/2026, 12:30 AM',
    )
  })

  it('compares app day and month keys in the app timezone', () => {
    expect(getAppDateKey('2026-03-31T16:30:00.000Z')).toBe('2026-04-01')
    expect(getAppMonthKey('2026-03-31T16:30:00.000Z')).toBe('2026-04')
    expect(
      isSameAppDay('2026-04-17T16:30:00.000Z', '2026-04-18T15:59:00.000Z'),
    ).toBe(true)
    expect(
      isSameAppMonth('2026-03-31T16:30:00.000Z', '2026-04-30T15:59:00.000Z'),
    ).toBe(true)
  })

  it('defaults new recurring rules to 9 AM app time', () => {
    const value = formatDateTimeInputValueForNewRecurringRule()

    expect(value.endsWith('T09:00')).toBe(true)
  })
})

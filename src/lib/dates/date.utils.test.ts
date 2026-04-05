import { describe, expect, it } from 'vitest'
import {
  formatDisplayDate,
  fromStoredDate,
  parseDisplayDate,
  toStoredDate,
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
})

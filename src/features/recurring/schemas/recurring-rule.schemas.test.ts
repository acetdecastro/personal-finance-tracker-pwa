import { describe, expect, it } from 'vitest'
import { createRecurringRuleInputSchema } from './recurring-rule.schemas'

describe('recurring rule schema', () => {
  it('allows a second amount for semi-monthly salary income rules', () => {
    const parsed = createRecurringRuleInputSchema.parse({
      name: 'Salary',
      type: 'income',
      amount: 25000,
      secondAmount: 27500,
      categoryId: 'category-income-salary',
      accountId: 'account-1',
      cadence: 'semi-monthly',
      semiMonthlyDays: [15, 30],
      monthlyDay: null,
      weeklyInterval: null,
      nextOccurrenceDate: '2026-04-15T00:00:00.000Z',
      isActive: true,
    })

    expect(parsed.secondAmount).toBe(27500)
  })

  it('rejects a second amount for non-salary recurring rules', () => {
    expect(() =>
      createRecurringRuleInputSchema.parse({
        name: 'Freelance',
        type: 'income',
        amount: 25000,
        secondAmount: 27500,
        categoryId: 'category-income-other-income',
        accountId: 'account-1',
        cadence: 'semi-monthly',
        semiMonthlyDays: [15, 30],
        monthlyDay: null,
        weeklyInterval: null,
        nextOccurrenceDate: '2026-04-15T00:00:00.000Z',
        isActive: true,
      }),
    ).toThrow('A second expected amount is only allowed')
  })
})

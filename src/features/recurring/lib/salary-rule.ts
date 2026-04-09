import type { RecurringCadence, RecurringRuleType } from '#/types/domain'

export const SALARY_CATEGORY_ID = 'category-income-salary'

export function supportsSecondSalaryAmount(input: {
  type: RecurringRuleType
  categoryId: string
  cadence: RecurringCadence
}) {
  return (
    input.type === 'income' &&
    input.categoryId === SALARY_CATEGORY_ID &&
    input.cadence === 'semi-monthly'
  )
}

import { createFileRoute } from '@tanstack/react-router'
import { RoutePlaceholder } from '../../components/layout/route-placeholder'

export const Route = createFileRoute('/_app/budget')({
  component: BudgetRoute,
})

function BudgetRoute() {
  return (
    <RoutePlaceholder
      eyebrow="Budget"
      title="Budget page placeholder"
      description="This page will later host category budgets, spending progress, and related planning UI."
    />
  )
}

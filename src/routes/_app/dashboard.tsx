import { createFileRoute } from '@tanstack/react-router'
import { RoutePlaceholder } from '../../components/layout/route-placeholder'

export const Route = createFileRoute('/_app/dashboard')({
  component: DashboardRoute,
})

function DashboardRoute() {
  return (
    <RoutePlaceholder
      eyebrow="Dashboard"
      title="Dashboard page placeholder"
      description="This page will hold the main financial overview, summary cards, forecast sections, and quick actions later."
    />
  )
}

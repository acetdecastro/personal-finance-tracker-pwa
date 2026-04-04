import { createFileRoute } from '@tanstack/react-router'
import { RoutePlaceholder } from '../components/layout/route-placeholder'

export const Route = createFileRoute('/onboarding')({
  component: OnboardingRoute,
})

function OnboardingRoute() {
  return (
    <main className="page-wrap px-4 pb-8 pt-10">
      <RoutePlaceholder
        eyebrow="Onboarding"
        title="Setup flow placeholder"
        description="This standalone route is reserved for the initial setup experience before the user enters the main app shell."
      />
    </main>
  )
}

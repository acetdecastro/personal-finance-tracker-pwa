import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { OnboardingFlow } from '#/features/onboarding/components/OnboardingFlow'

export const Route = createFileRoute('/onboarding')({
  component: OnboardingRoute,
})

function OnboardingRoute() {
  const navigate = useNavigate()

  function handleComplete() {
    navigate({ to: '/dashboard' })
  }

  return (
    <main className="mx-auto min-h-dvh max-w-lg px-5 py-10">
      <OnboardingFlow onComplete={handleComplete} />
    </main>
  )
}

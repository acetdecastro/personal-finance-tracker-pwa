import { useEffect } from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { OnboardingFlow } from '#/features/onboarding/components/OnboardingFlow'
import { useUser } from '#/features/user/hooks/use-user'

export const Route = createFileRoute('/onboarding')({
  component: OnboardingRoute,
})

function OnboardingRoute() {
  const navigate = useNavigate()
  const { data: user, isLoading } = useUser()

  useEffect(() => {
    if (isLoading) return
    if (user?.name) {
      void navigate({ to: '/dashboard', replace: true })
    }
  }, [isLoading, user, navigate])

  function handleComplete() {
    void navigate({ to: '/dashboard' })
  }

  if (isLoading || user?.name) return null

  return (
    <main className="mx-auto min-h-dvh max-w-lg px-5 py-10">
      <OnboardingFlow onComplete={handleComplete} />
    </main>
  )
}

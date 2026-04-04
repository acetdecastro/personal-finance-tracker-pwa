import { useEffect } from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { Loader2 } from 'lucide-react'
import { useSettingsScreenData } from '#/features/settings/hooks/use-settings'

export const Route = createFileRoute('/')({
  component: HomeRoute,
})

function HomeRoute() {
  const navigate = useNavigate()
  const { data: settings, isLoading } = useSettingsScreenData()

  useEffect(() => {
    if (isLoading || !settings) return
    if (settings.hasCompletedOnboarding) {
      navigate({ to: '/dashboard', replace: true })
    } else {
      navigate({ to: '/onboarding', replace: true })
    }
  }, [isLoading, settings, navigate])

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center px-5">
      <Loader2 className="size-6 animate-spin text-primary" />
    </main>
  )
}

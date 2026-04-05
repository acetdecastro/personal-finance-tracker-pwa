import { useEffect } from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { Loader2 } from 'lucide-react'
import { AppShell } from '../../components/layout/app-shell'
import { useSettingsScreenData } from '#/features/settings/hooks/use-settings'
import { useUser } from '#/features/user/hooks/use-user'

export const Route = createFileRoute('/_app')({
  component: AppLayoutRoute,
})

function AppLayoutRoute() {
  const navigate = useNavigate()
  const { data: settings, isLoading: settingsLoading } = useSettingsScreenData()
  const { data: user, isLoading: userLoading } = useUser()

  const isLoading = settingsLoading || userLoading

  useEffect(() => {
    if (isLoading) return
    const isOnboarded = settings?.hasCompletedOnboarding === true
    const hasName = !!user?.name
    if (!isOnboarded || !hasName) {
      void navigate({ to: '/onboarding', replace: true })
    }
  }, [isLoading, settings, user, navigate])

  if (isLoading) {
    return (
      <main className="flex min-h-dvh flex-col items-center justify-center">
        <Loader2 className="text-primary size-6 animate-spin" />
      </main>
    )
  }

  if (!settings?.hasCompletedOnboarding || !user?.name) {
    return null
  }

  return <AppShell />
}

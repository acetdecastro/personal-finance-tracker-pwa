import { createFileRoute } from '@tanstack/react-router'
import { RoutePlaceholder } from '../../components/layout/route-placeholder'

export const Route = createFileRoute('/_app/settings')({
  component: SettingsRoute,
})

function SettingsRoute() {
  return (
    <RoutePlaceholder
      eyebrow="Settings"
      title="Settings page placeholder"
      description="This page is reserved for app preferences, recurring rule setup, and other future settings screens."
    />
  )
}

import { Toaster as Sonner } from 'sonner'
import { useUIStore } from '#/stores/ui-store'

export function Toaster() {
  const themeMode = useUIStore((s) => s.themeMode)

  return (
    <Sonner
      theme={themeMode}
      className="toaster group"
      duration={4000}
      position="top-center"
      toastOptions={{
        classNames: {
          toast:
            'group toast group-[.toaster]:bg-card group-[.toaster]:shadow-lg group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg',
          description: 'group-[.toast]:text-muted-foreground',
          actionButton:
            'group-[.toast]:bg-primary group-[.toast]:text-primary-foreground',
          cancelButton:
            'group-[.toast]:bg-muted group-[.toast]:text-muted-foreground',
        },
      }}
    />
  )
}

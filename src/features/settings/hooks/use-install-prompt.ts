import { useEffect, useState } from 'react'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export type InstallState = 'standalone' | 'ios' | 'promptable' | 'unavailable'

export function useInstallPrompt() {
  const [installState, setInstallState] = useState<InstallState>('unavailable')
  const [promptEvent, setPromptEvent] =
    useState<BeforeInstallPromptEvent | null>(null)

  useEffect(() => {
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (navigator as Navigator & { standalone?: boolean }).standalone === true

    if (isStandalone) {
      setInstallState('standalone')
      return
    }

    const isIOS =
      /iphone|ipad|ipod/i.test(navigator.userAgent) &&
      !(window as Window & { MSStream?: unknown }).MSStream

    if (isIOS) {
      setInstallState('ios')
      return
    }

    function handlePrompt(e: Event) {
      e.preventDefault()
      setPromptEvent(e as BeforeInstallPromptEvent)
      setInstallState('promptable')
    }

    window.addEventListener('beforeinstallprompt', handlePrompt)
    return () => window.removeEventListener('beforeinstallprompt', handlePrompt)
  }, [])

  async function triggerInstall() {
    if (!promptEvent) return
    await promptEvent.prompt()
    const { outcome } = await promptEvent.userChoice
    if (outcome === 'accepted') {
      setInstallState('standalone')
      setPromptEvent(null)
    }
  }

  return { installState, triggerInstall }
}

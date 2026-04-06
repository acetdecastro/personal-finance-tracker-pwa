import { useEffect, useState } from 'react'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export type InstallState =
  | 'standalone'
  | 'ios'
  | 'mac-safari'
  | 'promptable'
  | 'unavailable'

export function useInstallPrompt() {
  const [installState, setInstallState] = useState<InstallState>('unavailable')
  const [promptEvent, setPromptEvent] =
    useState<BeforeInstallPromptEvent | null>(null)

  useEffect(() => {
    const userAgent = navigator.userAgent
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (navigator as Navigator & { standalone?: boolean }).standalone === true

    if (isStandalone) {
      setInstallState('standalone')
      return
    }

    const isIOS =
      /iphone|ipad|ipod/i.test(userAgent) &&
      !(window as Window & { MSStream?: unknown }).MSStream

    if (isIOS) {
      setInstallState('ios')
      return
    }

    const isMacSafari =
      /Macintosh/i.test(userAgent) &&
      /Safari/i.test(userAgent) &&
      !/Chrome|Chromium|CriOS|Edg|OPR|Firefox/i.test(userAgent)

    if (isMacSafari) {
      setInstallState('mac-safari')
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

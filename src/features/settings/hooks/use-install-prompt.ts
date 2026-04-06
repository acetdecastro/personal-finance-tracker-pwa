import { useEffect, useState } from 'react'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export type InstallState =
  | 'standalone'
  | 'ios'
  | 'mac-safari'
  | 'desktop-chrome'
  | 'promptable'
  | 'unavailable'

export function useInstallPrompt() {
  const [installState, setInstallState] = useState<InstallState>('unavailable')
  const [promptEvent, setPromptEvent] =
    useState<BeforeInstallPromptEvent | null>(null)

  useEffect(() => {
    const userAgent = navigator.userAgent
    const platform =
      (
        navigator as Navigator & {
          userAgentData?: { platform?: string }
        }
      ).userAgentData?.platform || navigator.platform
    const vendor = navigator.vendor
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (navigator as Navigator & { standalone?: boolean }).standalone === true

    if (isStandalone) {
      setInstallState('standalone')
      return
    }

    const isIOS =
      (/iphone|ipad|ipod/i.test(userAgent) ||
        /iphone|ipad|ipod/i.test(platform)) &&
      !(window as Window & { MSStream?: unknown }).MSStream

    if (isIOS) {
      setInstallState('ios')
      return
    }

    const isDesktopChrome =
      (/Mac|Win|Linux/i.test(platform) ||
        /Macintosh|Windows|Linux/i.test(userAgent)) &&
      /Chrome|Chromium|Edg|OPR/i.test(userAgent) &&
      !/Mobile|Android|CriOS/i.test(userAgent)

    if (isDesktopChrome) {
      setInstallState('desktop-chrome')
    }

    const isMacSafari =
      (/Mac/i.test(platform) || /Macintosh/i.test(userAgent)) &&
      /Safari/i.test(userAgent) &&
      /Apple/i.test(vendor) &&
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

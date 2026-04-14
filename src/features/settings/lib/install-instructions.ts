import type { ElementType } from 'react'
import { Share } from 'lucide-react'
import type { InstallState } from '../hooks/use-install-prompt'

interface InstallInstructionStep {
  text: string
  icon?: ElementType | null
}

interface InstallInstructionContent {
  eyebrow: string
  title: string
  description: string
  steps: InstallInstructionStep[]
  skipLabel?: string
}

export function getInstallInstructionContent(
  installState: InstallState,
): InstallInstructionContent | null {
  if (installState === 'standalone' || installState === 'unavailable') {
    return null
  }

  if (installState === 'promptable') {
    return {
      eyebrow: 'Recommended',
      title: 'Install for the best experience',
      description:
        'Installing FinKo keeps it easy to reopen and gives you a cleaner app-like experience.',
      steps: [],
      skipLabel: 'Skip, continue in browser',
    }
  }

  if (installState === 'desktop-chrome') {
    return {
      eyebrow: 'Recommended',
      title: 'Install for the best experience',
      description:
        'On Chrome for desktop, you can install FinKo from the address bar before continuing.',
      steps: [
        { text: 'Click the Install button in Chrome’s address bar' },
        { text: 'Click "Install" in the install dialog' },
        { text: 'Open FinKo from the installed app' },
      ],
      skipLabel: 'Skip, continue in Chrome',
    }
  }

  if (installState === 'mac-safari') {
    return {
      eyebrow: 'Recommended',
      title: 'Install for the best experience',
      description:
        'On Safari for Mac, you can add FinKo to your Dock before continuing.',
      steps: [
        { text: 'Click the Share button in Safari’s toolbar' },
        { text: 'Choose "Add to Dock"' },
        { text: 'Click "Add"' },
      ],
      skipLabel: 'Skip, continue in Safari',
    }
  }

  if (installState === 'iphone-safari') {
    return {
      eyebrow: 'Recommended',
      title: 'Install for the best experience',
      description:
        'Add FinKo to your Home Screen before setup so it feels more like an app on your iPhone.',
      steps: [
        {
          text: 'Tap the three-dot menu icon in the bottom right of the browser',
        },
        { text: 'Tap Share', icon: Share },
        { text: 'Scroll down and tap "Add to Home Screen"' },
        { text: 'Tap "Add", then reopen FinKo from your Home Screen' },
      ],
      skipLabel: 'Skip, continue in Safari',
    }
  }

  if (installState === 'iphone-chrome') {
    return {
      eyebrow: 'Recommended',
      title: 'Install for the best experience',
      description:
        'Add FinKo to your Home Screen before setup so it feels more like an app on your iPhone.',
      steps: [
        {
          text: 'Tap the Share button in the top-right corner of the browser',
          icon: Share,
        },
        { text: 'Tap "View More"' },
        { text: 'Scroll down and tap "Add to Home Screen"' },
        { text: 'Tap "Add", then reopen FinKo from your Home Screen' },
      ],
      skipLabel: 'Skip, continue in Chrome',
    }
  }

  return {
    eyebrow: 'Recommended',
    title: 'Install for the best experience',
    description:
      'Add FinKo to your Home Screen before setup so it feels more like an app on your Android device.',
    steps: [
      { text: 'Tap the three-dot menu in the top-right corner of the browser' },
      { text: 'Tap "View More"' },
      { text: 'Scroll down and tap "Add to Home Screen"' },
      { text: 'Tap "Add", then reopen FinKo from your Home Screen' },
    ],
    skipLabel: 'Skip, continue in Chrome',
  }
}

export function getInstallDoneDescription(installState: InstallState) {
  if (installState === 'standalone') {
    return "You're already running FinKo as an installed app."
  }

  if (installState === 'desktop-chrome') {
    return 'Install FinKo from Chrome’s address bar for an app-like experience and easier access on your computer.'
  }

  if (installState === 'mac-safari') {
    return 'Add FinKo to your Dock for an app-like experience and easier access on your Mac.'
  }

  if (installState === 'iphone-safari' || installState === 'iphone-chrome') {
    return 'Add FinKo to your Home Screen for an app-like experience and easier access on your iPhone.'
  }

  if (installState === 'android-chrome') {
    return 'Add FinKo to your Home Screen for an app-like experience and easier access on your Android device.'
  }

  if (installState === 'promptable') {
    return 'Install FinKo on your device for an app-like experience and easier access.'
  }

  return 'Your dashboard is ready. You can now add transactions, salary, recurring bills, budgets, and goals as needed.'
}

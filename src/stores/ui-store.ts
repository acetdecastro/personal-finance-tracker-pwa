import { create } from 'zustand'

type ThemeMode = 'light' | 'dark' | 'system'
type ResolvedTheme = 'light' | 'dark'

interface UIStore {
  themeMode: ThemeMode
  resolvedTheme: ResolvedTheme
  setThemeMode: (mode: ThemeMode) => void
}

function getSystemTheme(): ResolvedTheme {
  if (typeof window === 'undefined') return 'light'
  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light'
}

function resolveTheme(mode: ThemeMode): ResolvedTheme {
  if (mode === 'system') return getSystemTheme()
  return mode
}

function applyTheme(resolved: ResolvedTheme): void {
  if (typeof document === 'undefined') return
  const root = document.documentElement
  root.classList.remove('light', 'dark')
  root.classList.add(resolved)
  root.style.colorScheme = resolved
}

function getStoredTheme(): ThemeMode {
  if (typeof window === 'undefined') return 'system'
  const stored = window.localStorage.getItem('theme')
  if (stored === 'light' || stored === 'dark' || stored === 'system')
    return stored
  return 'system'
}

const initialMode = getStoredTheme()
const initialResolved = resolveTheme(initialMode)

export const useUIStore = create<UIStore>((set) => ({
  themeMode: initialMode,
  resolvedTheme: initialResolved,
  setThemeMode: (mode) => {
    const resolved = resolveTheme(mode)
    localStorage.setItem('theme', mode)
    applyTheme(resolved)
    set({ themeMode: mode, resolvedTheme: resolved })
  },
}))

// Listen for system theme changes when mode is 'system'
if (typeof window !== 'undefined') {
  const mql = window.matchMedia('(prefers-color-scheme: dark)')
  mql.addEventListener('change', () => {
    const { themeMode } = useUIStore.getState()
    if (themeMode === 'system') {
      const resolved = getSystemTheme()
      applyTheme(resolved)
      useUIStore.setState({ resolvedTheme: resolved })
    }
  })
}

import { Sun, Moon, Monitor } from 'lucide-react'
import { useUIStore } from '#/stores/ui-store'

type ThemeMode = 'light' | 'dark' | 'system'

const THEME_OPTIONS: { value: ThemeMode; label: string; Icon: typeof Sun }[] = [
  { value: 'light', label: 'Light', Icon: Sun },
  { value: 'dark', label: 'Dark', Icon: Moon },
  { value: 'system', label: 'System', Icon: Monitor },
]

export function ThemeToggle() {
  const { themeMode, setThemeMode } = useUIStore()

  return (
    <div className="grid grid-cols-3 gap-2">
      {THEME_OPTIONS.map(({ value, label, Icon }) => (
        <button
          key={value}
          onClick={() => setThemeMode(value)}
          className={`flex flex-col items-center gap-1.5 rounded-xl py-3 text-xs font-semibold transition active:scale-[0.98] ${
            themeMode === value
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted text-secondary-foreground'
          }`}
        >
          <Icon className="size-4" />
          {label}
        </button>
      ))}
    </div>
  )
}

# Theme Rules

## Modes

Three theme modes: `light`, `dark`, `system`.
Default: `system` (respects OS preference).

## Implementation

- Zustand store in `src/stores/ui-store.ts`
- Theme class (`light` or `dark`) applied to `<html>`
- Inline script in `__root.tsx` prevents flash on load
- `localStorage` key: `theme`

## Dark Mode Strategy

Uses Tailwind v4 class strategy:

```css
@variant dark (&:where(.dark, .dark *));
```

All components must use `dark:` variants for dark mode styling.

## Consuming Theme in Components

```tsx
import { useUIStore } from '#/stores/ui-store'

const { themeMode, resolvedTheme, setThemeMode } = useUIStore()
```

## Rules

- Every visible surface must have both light and dark variants
- Never hardcode colors as hex/rgb — use Tailwind utilities
- Background: `bg-gray-50` / `dark:bg-zinc-950`
- Cards: `bg-white` / `dark:bg-zinc-900`
- Text: `text-slate-900` / `dark:text-slate-100`
- Muted text: `text-slate-500` / `dark:text-slate-400`
- Borders: `border-slate-200/60` / `dark:border-zinc-800/60`
- `color-scheme` is set on `<html>` to match resolved theme

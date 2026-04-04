# Card & Surface Rules

## Surface Hierarchy

Inspired by DESIGN.md tonal layering approach:

1. **Page background**: `bg-gray-50` / `dark:bg-zinc-950`
2. **Card surface**: `bg-white` / `dark:bg-zinc-900`
3. **Recessed/inset**: `bg-slate-50` / `dark:bg-zinc-800`
4. **Floating (modal/sheet)**: `bg-white` / `dark:bg-zinc-900` with `backdrop-blur-xl`

## Card Conventions

- Border radius: `rounded-2xl` (standard), `rounded-3xl` (hero/feature cards)
- Padding: `p-5` standard, `p-6` for hero cards
- Borders: prefer tonal separation over borders. When needed: `border border-slate-200/60 dark:border-zinc-800/60`
- Shadows: minimal. Use only for floating elements (FAB, modals, sheets): `shadow-lg`
- No borders on cards when background contrast is sufficient (per DESIGN.md "No-Line" rule)

## Hero / Balance Card

- Use gradient: `bg-gradient-to-br from-emerald-700 to-emerald-800 dark:from-emerald-800 dark:to-emerald-900`
- Text: `text-white` or `text-white/80` for labels
- Rounded: `rounded-3xl`
- Padding: `p-6`

## List Items

- No divider lines between items (per DESIGN.md)
- Separation via spacing: `space-y-1` or `space-y-2`
- Alternating: subtle background on hover `hover:bg-slate-50 dark:hover:bg-zinc-800/50`
- Item padding: `p-4` with `rounded-2xl`

## Empty States

- Centered in available space
- Icon: `text-slate-300 dark:text-slate-600`, `size-12`
- Heading: `text-base font-semibold text-slate-500 dark:text-slate-400`
- Description: `text-sm text-slate-400 dark:text-slate-500`
- CTA button below

## Progress Bars

- Track: `h-1.5 rounded-full bg-slate-100 dark:bg-zinc-800`
- Fill: `bg-emerald-600` (healthy), `bg-teal-500` (goals), `bg-red-500` (danger)
- Rounded: `rounded-full`

## Icons

- Library: **Lucide** only (`lucide-react`)
- Size: `size-5` (20px default), `size-4` (small), `size-6` (large)
- Stroke width: default (2)
- Color: inherits from parent text color
- In icon containers: `size-10 rounded-xl bg-slate-100 dark:bg-zinc-800 flex items-center justify-center`

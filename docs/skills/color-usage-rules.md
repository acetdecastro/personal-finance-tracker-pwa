# Color Usage Rules

## Allowed Palette

Only these Tailwind color families are permitted:

| Role           | Light         | Dark                                 | Usage                                            |
| -------------- | ------------- | ------------------------------------ | ------------------------------------------------ |
| **Primary**    | `emerald-700` | `emerald-600` / `emerald-400` (text) | Brand, buttons, primary actions, positive values |
| **Accent**     | `teal-600`    | `teal-400`                           | Goals, links, secondary highlights               |
| **Neutral**    | `slate-500`   | `slate-400`                          | Secondary icons, muted text, labels              |
| **Danger**     | `red-600`     | `red-500`                            | Overspending, over-budget, destructive actions   |
| **Background** | `gray-50`     | `zinc-950`                           | Page background                                  |

## Neutral Surfaces

Use `slate`, `zinc`, and `gray` for structural surfaces:

- Cards light: `white`, `white/80`, `slate-50`
- Cards dark: `zinc-900`, `zinc-900/60`, `zinc-800`
- Borders light: `slate-200/60`
- Borders dark: `zinc-800/60`
- Body text: `slate-900` / `slate-100`
- Muted text: `slate-500` / `slate-400`

## Forbidden

Do not introduce: `purple`, `pink`, `indigo`, `rose`, `lime`, `amber`, `orange`, `violet`, `cyan`, `sky`, `blue`, `yellow`, `fuchsia`.

## Semantic Rules

- Positive amounts (income): `emerald-700` / `emerald-400`
- Negative amounts (expense): `slate-900` / `slate-100` (default body text)
- Over-budget / danger: `red-600` / `red-500`
- Goals / progress: `teal-600` / `teal-400`
- Inactive / disabled: `slate-300` / `slate-600`

## Button Colors

- Primary CTA: `bg-emerald-700 text-white` / `dark:bg-emerald-600`
- Secondary: `bg-slate-100 text-slate-700` / `dark:bg-zinc-800 dark:text-slate-200`
- Danger: `bg-red-600 text-white` / `dark:bg-red-500`
- Ghost: transparent with text color only

# Mobile UI Rules

## Layout

- Max content width: `max-w-lg` (32rem / 512px)
- Horizontal padding: `px-5` (20px) on main content
- Bottom nav is fixed; main content needs `pb-24` clearance
- Top header is fixed; main content needs `pt-16` clearance

## Touch Targets

- Minimum tappable area: 44x44px
- Buttons: at least `py-2.5 px-4` or equivalent
- Bottom nav items: full column width, `py-2.5`
- Use `active:scale-95` for press feedback

## Spacing

- Between page sections: `space-y-6` or `gap-6`
- Between cards: `gap-4`
- Inside cards: `p-5` standard, `p-4` compact
- Between card title and content: `mb-3` or `space-y-3`

## Typography

- Page title: `text-2xl font-bold tracking-tight` or `text-3xl font-extrabold tracking-tight`
- Section header: `text-lg font-bold tracking-tight`
- Card label (kicker): `text-[11px] font-bold uppercase tracking-widest`
- Body: `text-sm` (default)
- Small/meta: `text-xs`
- Currency amounts: `font-bold` always; large display uses `text-3xl` or `text-4xl`

## Navigation

- Bottom nav: 4 tabs max (Dashboard, Transactions, Budget, Settings)
- Active tab: `text-emerald-700` / `dark:text-emerald-400`
- Inactive: `text-slate-400` / `dark:text-slate-500`
- FAB for quick add: fixed `right-5 bottom-24`, `rounded-2xl`, `size-14`

## Forms

- Prefer selects/presets over free-text typing
- Input fields: `rounded-xl`, full width, `bg-slate-50` / `dark:bg-zinc-800`
- Labels: `text-sm font-medium text-slate-700` / `dark:text-slate-300`
- One-thumb friendly — primary actions at thumb reach

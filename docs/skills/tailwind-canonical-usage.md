# Tailwind Canonical Usage

## Class Ordering

Follow the canonical Tailwind class order. The project uses `prettier-plugin-tailwindcss` to enforce this automatically.

Run `pnpm check` to auto-sort classes.

## Rules

1. **Use Tailwind utilities first.** Only write custom CSS when Tailwind cannot express it.
2. **No arbitrary values when a utility exists.** Use `rounded-2xl` not `rounded-[1rem]`.
3. **No custom CSS classes for things Tailwind handles.** No `.card-padding` when `p-5` works.
4. **Keep class strings readable.** Group logically: layout → spacing → sizing → typography → colors → effects.
5. **Use `dark:` variant for dark mode.** Never use `[data-theme="dark"]` selectors.
6. **Use `clsx` for conditional classes.** Not string concatenation.
7. **Prefer Tailwind spacing scale.** `p-4`, `gap-3`, `mb-6` — not arbitrary pixel values.

## Forbidden Patterns

- `style={{}}` for anything Tailwind can express
- Custom CSS variables for colors (use Tailwind color utilities)
- `@apply` in component-scoped CSS (keep classes in JSX)
- Inline `rgba()` / `#hex` in className strings when Tailwind colors work

## Opacity

Use Tailwind opacity modifiers: `bg-emerald-700/10`, `text-slate-500/80`, `border-slate-200/60`.

## Responsive

Mobile-first. Base classes are mobile. Use `sm:`, `md:`, `lg:` for larger screens.
This app is primarily `max-w-lg` (mobile viewport), so responsive breakpoints are rarely needed.

## Transitions

Prefer: `transition-colors`, `transition-opacity`, `transition-transform`.
Use `active:scale-95` or `active:scale-[0.98]` for tap feedback.
Duration: default or `duration-200`. No long animations.

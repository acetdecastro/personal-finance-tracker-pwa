interface RoutePlaceholderProps {
  eyebrow: string
  title: string
  description: string
}

export function RoutePlaceholder({
  eyebrow,
  title,
  description,
}: RoutePlaceholderProps) {
  return (
    <section className="rounded-2xl bg-white/80 p-6 dark:bg-zinc-900/60">
      <p className="mb-2 text-[11px] font-bold uppercase tracking-widest text-emerald-700 dark:text-emerald-400">
        {eyebrow}
      </p>
      <h1 className="mb-3 text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
        {title}
      </h1>
      <p className="max-w-prose text-sm leading-relaxed text-slate-500 dark:text-slate-400">
        {description}
      </p>
    </section>
  )
}

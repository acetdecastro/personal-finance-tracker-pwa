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
    <section className="rounded-2xl bg-card/80 p-6">
      <p className="mb-2 text-[11px] font-bold uppercase tracking-widest text-primary">
        {eyebrow}
      </p>
      <h1 className="mb-3 text-2xl font-bold tracking-tight text-foreground">
        {title}
      </h1>
      <p className="max-w-prose text-sm leading-relaxed text-muted-foreground">
        {description}
      </p>
    </section>
  )
}

interface SectionHeaderProps {
  title: string
  action?: React.ReactNode
}

export function SectionHeader({ title, action }: SectionHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <h2 className="text-base font-bold tracking-tight text-foreground">
        {title}
      </h2>
      {action && <div>{action}</div>}
    </div>
  )
}

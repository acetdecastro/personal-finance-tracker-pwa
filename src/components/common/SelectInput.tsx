import type { ComponentPropsWithoutRef } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '#/lib/utils/cn'

type SelectInputProps = ComponentPropsWithoutRef<'select'>

const BASE_SELECT_CLS =
  'w-full appearance-none rounded-xl bg-input py-3 pl-4 pr-12 text-sm text-foreground outline-none ring-1 ring-border transition focus:ring-2 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-60'

export function SelectInput({
  className = '',
  children,
  ...props
}: SelectInputProps) {
  return (
    <div className="relative">
      <select className={cn(BASE_SELECT_CLS, className)} {...props}>
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute right-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
    </div>
  )
}

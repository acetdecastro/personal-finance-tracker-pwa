import type { InputHTMLAttributes } from 'react'
import { cn } from '#/lib/utils/cn'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {}

const INPUT_CLS =
  'block w-full min-w-0 max-w-full rounded-xl bg-input px-4 py-3 text-base text-foreground outline-none ring-1 ring-border transition focus:ring-2 focus:ring-ring md:text-sm'

export function Input({ className, ...props }: InputProps) {
  return <input className={cn(INPUT_CLS, className)} {...props} />
}

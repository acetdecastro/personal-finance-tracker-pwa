import type { InputHTMLAttributes } from 'react'
import { cn } from '#/lib/utils/cn'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {}

const INPUT_CLS =
  'w-full rounded-xl bg-input px-4 py-3 text-sm text-foreground outline-none ring-1 ring-border transition focus:ring-2 focus:ring-ring'

export function Input({ className, ...props }: InputProps) {
  return <input className={cn(INPUT_CLS, className)} {...props} />
}

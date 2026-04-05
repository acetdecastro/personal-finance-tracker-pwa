import type { ComponentPropsWithoutRef } from 'react'
import { CalendarDays } from 'lucide-react'
import { Input } from '#/components/common/Input'
import { cn } from '#/lib/utils/cn'

type DateInputProps = Omit<ComponentPropsWithoutRef<'input'>, 'type'>

const BASE_DATE_CLS =
  'min-w-0 max-w-full pr-12 [color-scheme:dark] [appearance:none] [-webkit-appearance:none] [&::-webkit-datetime-edit]:p-0 [&::-webkit-date-and-time-value]:min-h-[1.25rem] [&::-webkit-date-and-time-value]:text-left [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:right-4 [&::-webkit-calendar-picker-indicator]:size-5 [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-0'

export function DateInput({ className, ...props }: DateInputProps) {
  return (
    <div className="relative w-full min-w-0 max-w-full">
      <Input {...props} type="date" className={cn(BASE_DATE_CLS, className)} />
      <CalendarDays className="text-muted-foreground pointer-events-none absolute top-1/2 right-4 size-4 -translate-y-1/2" />
    </div>
  )
}

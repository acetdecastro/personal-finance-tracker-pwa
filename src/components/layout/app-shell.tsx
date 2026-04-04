import { Link, Outlet } from '@tanstack/react-router'
import {
  LayoutDashboard,
  ArrowLeftRight,
  PiggyBank,
  Settings,
} from 'lucide-react'
import type { ReactNode } from 'react'

const mainNavItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/transactions', label: 'Transactions', icon: ArrowLeftRight },
  { to: '/budget', label: 'Budget', icon: PiggyBank },
  { to: '/settings', label: 'Settings', icon: Settings },
] as const

export function AppShell() {
  return (
    <div className="mx-auto flex min-h-dvh max-w-lg flex-col">
      {/* Header */}
      {/* <header className="fixed inset-x-0 top-0 z-40 border-b border-slate-200/60 bg-gray-50/80 px-5 py-3 backdrop-blur-xl dark:border-zinc-800/60 dark:bg-zinc-950/80">
        <div className="mx-auto flex max-w-lg items-center justify-between">
          <h1 className="text-lg font-bold tracking-tight text-emerald-700 dark:text-emerald-400">
            FinTrack
          </h1>
        </div>
      </header> */}

      {/* Main content area */}
      <main className="flex-1 px-5 pb-24 pt-16">
        <Outlet />
      </main>

      {/* Bottom navigation */}
      <nav
        aria-label="Primary"
        className="fixed inset-x-0 bottom-0 z-40 border-t border-zinc-200/90 bg-white/90 pb-safe backdrop-blur-xl dark:border-emerald-800/90 dark:bg-zinc-900/50 rounded-tl-4xl rounded-tr-4xl"
      >
        <div className="flex items-center justify-between mx-auto max-w-lg">
          {mainNavItems.map((item) => (
            <NavItem key={item.to} to={item.to} label={item.label}>
              <item.icon className="size-5" />
            </NavItem>
          ))}
        </div>
      </nav>
    </div>
  )
}

function NavItem({
  to,
  label,
  children,
}: {
  to: string
  label: string
  children: ReactNode
}) {
  return (
    <Link
      to={to}
      activeProps={{
        className: 'text-emerald-700 dark:text-emerald-400',
      }}
      inactiveProps={{
        className: 'text-slate-400 dark:text-slate-500',
      }}
      className="flex flex-col items-center gap-1 px-2 py-2.5 text-center transition-colors active:scale-95"
    >
      {children}
      <span className="text-[11px] font-medium uppercase tracking-wide">
        {label}
      </span>
    </Link>
  )
}

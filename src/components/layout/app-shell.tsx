import { Link, Outlet } from '@tanstack/react-router'
import {
  LayoutDashboard,
  ArrowLeftRight,
  Wallet,
  PiggyBank,
  Settings,
} from 'lucide-react'
import type { ReactNode } from 'react'
import { cn } from '#/lib/utils/cn'

const mainNavItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/transactions', label: 'Transactions', icon: ArrowLeftRight },
  { to: '/budget', label: 'Budget', icon: PiggyBank },
  { to: '/accounts', label: 'Accounts', icon: Wallet },
  { to: '/settings', label: 'Settings', icon: Settings },
] as const

export function AppShell() {
  return (
    <div className="mx-auto flex min-h-dvh max-w-lg flex-col">
      {/* Header */}
      {/* <header className="fixed inset-x-0 top-0 z-40 border-b border-border/60 bg-background/80 px-5 py-3 backdrop-blur-xl">
        <div className="mx-auto flex max-w-lg items-center justify-between">
          <h1 className="text-lg font-bold tracking-tight text-primary">
            FinTrack
          </h1>
        </div>
      </header> */}

      {/* Main content area */}
      <main className="flex-1 px-5 pt-6 pb-24">
        <Outlet />
      </main>

      {/* Bottom navigation */}
      <nav
        aria-label="Primary"
        className="border-border/60 bg-card/90 pb-safe fixed inset-x-0 bottom-0 z-40 rounded-tl-3xl rounded-tr-3xl border-t backdrop-blur-xl"
      >
        <div className="mx-auto mb-2 flex max-w-lg items-center justify-between px-6 pt-3 pb-4">
          {mainNavItems.map((item) => (
            <NavItem key={item.to} to={item.to} label={item.label}>
              <item.icon className="size-4.5" />
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
        className: 'text-primary',
      }}
      inactiveProps={{
        className: 'text-muted-foreground',
      }}
      className={cn(
        'focus-visible:ring-ring focus-visible:ring-offset-background flex flex-col items-center gap-1 rounded-xl px-1 py-2 text-center transition-colors outline-none focus-visible:ring-2 focus-visible:ring-offset-2 active:scale-95',
      )}
    >
      {children}
      <span className="xs:block hidden text-[10px] leading-none font-medium">
        {label}
      </span>
    </Link>
  )
}

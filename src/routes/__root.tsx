import {
  HeadContent,
  Scripts,
  createRootRouteWithContext,
  useRouter,
} from '@tanstack/react-router'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'
import { TanStackDevtools } from '@tanstack/react-devtools'
import { AppProviders } from '../app/providers'
import type { AppRouterContext } from '../app/providers'

import TanStackQueryDevtools from '../app/query-devtools'
import { PwaUpdateToast } from '../components/common/PwaUpdateToast'
import { Toaster } from '../components/common/Toaster'

import appCss from '../styles.css?url'

/**
 * Inline script to apply theme class before first paint.
 * Reads localStorage 'theme' key. Defaults to system preference.
 * Avoids flash of wrong theme.
 */
const THEME_INIT_SCRIPT = `(function(){try{var s=localStorage.getItem('theme');var m=(s==='light'||s==='dark'||s==='system')?s:'system';var d=window.matchMedia('(prefers-color-scheme:dark)').matches;var r=m==='system'?(d?'dark':'light'):m;var h=document.documentElement;h.classList.remove('light','dark');h.classList.add(r);h.style.colorScheme=r;}catch(e){}})();`

export const Route = createRootRouteWithContext<AppRouterContext>()({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { title: 'FinKo - Personal Finance Tracker' },
      { name: 'description', content: 'Local-first personal finance tracker' },
      {
        name: 'theme-color',
        content: '#047857',
        media: '(prefers-color-scheme: light)',
      },
      {
        name: 'theme-color',
        content: '#09090b',
        media: '(prefers-color-scheme: dark)',
      },
      { name: 'mobile-web-app-capable', content: 'yes' },
      { name: 'apple-mobile-web-app-capable', content: 'yes' },
      { name: 'apple-mobile-web-app-status-bar-style', content: 'default' },
      { name: 'apple-mobile-web-app-title', content: 'FinKo' },
    ],
    links: [
      { rel: 'stylesheet', href: appCss },
      { rel: 'manifest', href: '/manifest.webmanifest' },
      { rel: 'apple-touch-icon', href: '/apple-touch-icon.png' },
    ],
  }),
  shellComponent: RootDocument,
  notFoundComponent: RootNotFound,
  errorComponent: RootError,
})

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
        <HeadContent />
      </head>
      <body className="min-h-dvh font-sans antialiased">
        <AppProviders>
          {children}
          <Toaster />
          <PwaUpdateToast />
        </AppProviders>
        {/* <TanStackDevtools
          config={{
            position: 'bottom-right',
          }}
          plugins={[
            {
              name: 'Tanstack Router',
              render: <TanStackRouterDevtoolsPanel />,
            },
            TanStackQueryDevtools,
          ]}
        /> */}
        <Scripts />
      </body>
    </html>
  )
}

function RootNotFound() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center px-5 text-center">
      <div className="bg-card text-card-foreground ring-border max-w-sm space-y-3 rounded-3xl p-6 shadow-sm ring-1">
        <p className="text-muted-foreground text-[11px] font-bold tracking-widest uppercase">
          Not Found
        </p>
        <h1 className="text-2xl font-extrabold tracking-tight">
          This page doesn&apos;t exist
        </h1>
        <p className="text-muted-foreground text-sm">
          The link may be outdated, or the page may have moved.
        </p>
        <a
          href="/dashboard"
          className="bg-primary text-primary-foreground inline-flex rounded-xl px-4 py-2.5 text-sm font-semibold transition active:scale-[0.98]"
        >
          Go to Dashboard
        </a>
      </div>
    </main>
  )
}

function RootError({ error }: { error: unknown }) {
  const router = useRouter()
  const message =
    error instanceof Error ? error.message : 'An unexpected error occurred.'

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center px-5 text-center">
      <div className="bg-card text-card-foreground ring-border max-w-sm space-y-3 rounded-3xl p-6 shadow-sm ring-1">
        <p className="text-destructive text-[11px] font-bold tracking-widest uppercase">
          Error
        </p>
        <h1 className="text-2xl font-extrabold tracking-tight">
          Something went wrong
        </h1>
        <p className="text-muted-foreground text-sm">{message}</p>
        <div className="flex flex-col gap-2">
          <button
            onClick={() => router.invalidate()}
            className="bg-primary text-primary-foreground inline-flex justify-center rounded-xl px-4 py-2.5 text-sm font-semibold transition active:scale-[0.98]"
          >
            Try Again
          </button>
          <a
            href="/dashboard"
            className="bg-muted text-secondary-foreground inline-flex justify-center rounded-xl px-4 py-2.5 text-sm font-semibold transition active:scale-[0.98]"
          >
            Go to Dashboard
          </a>
        </div>
      </div>
    </main>
  )
}

import {
  HeadContent,
  Scripts,
  createRootRouteWithContext,
} from '@tanstack/react-router'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'
import { TanStackDevtools } from '@tanstack/react-devtools'
import { AppProviders  } from '../app/providers'
import type { AppRouterContext } from '../app/providers';

import TanStackQueryDevtools from '../app/query-devtools'

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
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {
        title: 'Personal Finance Tracker PWA',
      },
    ],
    links: [
      {
        rel: 'stylesheet',
        href: appCss,
      },
    ],
  }),
  shellComponent: RootDocument,
  notFoundComponent: RootNotFound,
})

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
        <HeadContent />
      </head>
      <body className="min-h-dvh font-sans antialiased">
        <AppProviders>{children}</AppProviders>
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
      <div className="max-w-sm space-y-3 rounded-3xl bg-card p-6 text-card-foreground shadow-sm ring-1 ring-border">
        <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
          Not Found
        </p>
        <h1 className="text-2xl font-extrabold tracking-tight">
          This page doesn&apos;t exist
        </h1>
        <p className="text-sm text-muted-foreground">
          The link may be outdated, or the page may have moved.
        </p>
        <a
          href="/dashboard"
          className="inline-flex rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition active:scale-[0.98]"
        >
          Go to Dashboard
        </a>
      </div>
    </main>
  )
}

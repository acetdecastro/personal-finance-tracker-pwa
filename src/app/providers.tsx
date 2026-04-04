import type { ReactNode } from 'react'
import { useEffect, useRef } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { seedCoreData } from '#/services/seed/seed.service'

export interface AppRouterContext {
  queryClient: QueryClient
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Local-first: data is always fresh from IndexedDB
      staleTime: 0,
      retry: false,
    },
  },
})

export function getAppRouterContext(): AppRouterContext {
  return { queryClient }
}

export function AppProviders({ children }: { children?: ReactNode }) {
  const seeded = useRef(false)

  useEffect(() => {
    if (seeded.current) return
    seeded.current = true
    seedCoreData().catch(console.error)
  }, [])

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}

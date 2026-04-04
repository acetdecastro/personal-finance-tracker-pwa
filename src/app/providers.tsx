import type { ReactNode } from 'react'
import { useEffect, useRef } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { seedCoreData } from '#/services/seed/seed.service'
import { useUIStore } from '#/stores/ui-store'

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
  const initializeTheme = useUIStore((state) => state.initializeTheme)

  useEffect(() => {
    if (seeded.current) return
    seeded.current = true
    seedCoreData().catch(console.error)
  }, [])

  useEffect(() => {
    initializeTheme()
  }, [initializeTheme])

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}

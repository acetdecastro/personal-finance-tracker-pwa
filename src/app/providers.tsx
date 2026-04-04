import type { ReactNode } from 'react'
import { QueryClient } from '@tanstack/react-query'

export interface AppRouterContext {
  queryClient: QueryClient
}

export function getAppRouterContext(): AppRouterContext {
  return {
    queryClient: new QueryClient(),
  }
}

export function AppProviders({
  children,
}: {
  children?: ReactNode
}) {
  return children ?? null
}

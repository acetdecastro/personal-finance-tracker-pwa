import { useQuery } from '@tanstack/react-query'
import { db } from '#/db/dexie'

export const USER_QUERY_KEY = ['user'] as const

export function useUser() {
  return useQuery({
    queryKey: USER_QUERY_KEY,
    queryFn: () => db.users.get('primary').then((u) => u ?? null),
  })
}

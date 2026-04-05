import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { userSettingsRepository } from '../services/user-settings.repository'
import type { UpdateUserSettingsInput } from '../schemas/user-settings.schemas'

export const USER_SETTINGS_QUERY_KEY = ['user-settings'] as const

export function useUserSettings() {
  return useQuery({
    queryKey: USER_SETTINGS_QUERY_KEY,
    queryFn: () => userSettingsRepository.get().then((s) => s ?? null),
  })
}

export function useUpdateUserSettings() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (changes: UpdateUserSettingsInput) =>
      userSettingsRepository.update(changes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: USER_SETTINGS_QUERY_KEY })
    },
  })
}

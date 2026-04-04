import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { settingsService } from '../services/settings.service'
import type { ThemePreference } from '#/types/domain'

export const SETTINGS_SCREEN_QUERY_KEY = ['settings-screen'] as const

export function useSettingsScreenData() {
  return useQuery({
    queryKey: SETTINGS_SCREEN_QUERY_KEY,
    queryFn: () => settingsService.getScreenData(),
  })
}

export function useUpdateThemePreference() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (theme: ThemePreference) => settingsService.updateTheme(theme),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SETTINGS_SCREEN_QUERY_KEY })
    },
  })
}

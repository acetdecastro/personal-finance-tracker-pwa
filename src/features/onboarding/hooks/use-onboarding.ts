import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { SETTINGS_SCREEN_QUERY_KEY } from '#/features/settings/hooks/use-settings'
import { USER_SETTINGS_QUERY_KEY } from '#/features/settings/hooks/use-user-settings'
import { mapSettingsToDto } from '#/features/settings/services/settings.service'
import { USER_QUERY_KEY } from '#/features/user/hooks/use-user'
import { onboardingService } from '../services/onboarding.service'
import type { CompleteOnboardingInput } from '../schemas/onboarding.schemas'

export const ONBOARDING_BOOTSTRAP_QUERY_KEY = ['onboarding-bootstrap'] as const

export function useOnboardingBootstrap() {
  return useQuery({
    queryKey: ONBOARDING_BOOTSTRAP_QUERY_KEY,
    queryFn: () => onboardingService.getBootstrapData(),
  })
}

export function useCompleteOnboarding() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: CompleteOnboardingInput) =>
      onboardingService.complete(input),
    onSuccess: (result) => {
      queryClient.setQueryData(USER_QUERY_KEY, result.user)
      queryClient.setQueryData(
        SETTINGS_SCREEN_QUERY_KEY,
        mapSettingsToDto(result.userSettings),
      )
      queryClient.setQueryData(USER_SETTINGS_QUERY_KEY, result.userSettings)

      queryClient.invalidateQueries({
        queryKey: ONBOARDING_BOOTSTRAP_QUERY_KEY,
      })
      queryClient.invalidateQueries({ queryKey: ['accounts'] })
    },
  })
}

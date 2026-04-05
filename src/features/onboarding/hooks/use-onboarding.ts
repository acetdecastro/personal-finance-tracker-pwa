import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
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
    onSuccess: async () => {
      // Refetch before navigating so _app/route.tsx guard sees fresh data.
      // invalidateQueries only marks stale — the guard reads synchronously
      // and would see undefined, redirecting back to /onboarding.
      await Promise.all([
        queryClient.refetchQueries({ queryKey: ['user'] }),
        queryClient.refetchQueries({ queryKey: ['settings-screen'] }),
      ])
      queryClient.invalidateQueries({
        queryKey: ONBOARDING_BOOTSTRAP_QUERY_KEY,
      })
      queryClient.invalidateQueries({ queryKey: ['user-settings'] })
      queryClient.invalidateQueries({ queryKey: ['accounts'] })
      queryClient.invalidateQueries({ queryKey: ['recurring-rules'] })
    },
  })
}

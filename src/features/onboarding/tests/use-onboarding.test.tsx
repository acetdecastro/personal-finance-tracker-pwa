import type { ReactNode } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { SETTINGS_SCREEN_QUERY_KEY } from '#/features/settings/hooks/use-settings'
import { USER_SETTINGS_QUERY_KEY } from '#/features/settings/hooks/use-user-settings'
import { USER_QUERY_KEY } from '#/features/user/hooks/use-user'
import type { CompleteOnboardingResultDto } from '#/types/dto'
import { useCompleteOnboarding } from '../hooks/use-onboarding'

const completeMock =
  vi.fn<(input: unknown) => Promise<CompleteOnboardingResultDto>>()

vi.mock('../services/onboarding.service', () => ({
  onboardingService: {
    complete: (input: unknown) => completeMock(input),
    getBootstrapData: vi.fn(),
  },
}))

function createWrapper(queryClient: QueryClient) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    )
  }
}

function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: Infinity,
      },
      mutations: {
        gcTime: Infinity,
      },
    },
  })
}

afterEach(() => {
  vi.clearAllMocks()
})

describe('useCompleteOnboarding', () => {
  it('hydrates the guard queries immediately after onboarding completes', async () => {
    const queryClient = createTestQueryClient()
    const wrapper = createWrapper(queryClient)
    const resultPayload: CompleteOnboardingResultDto = {
      initialAccount: {
        id: 'account-1',
        name: 'Main Wallet',
        type: 'ewallet',
        initialBalance: 2500,
        safetyBuffer: 1000,
        isArchived: false,
        createdAt: '2026-04-06T00:00:00.000Z',
        updatedAt: '2026-04-06T00:00:00.000Z',
      },
      userSettings: {
        id: 'primary',
        currency: 'PHP',
        theme: 'system',
        hasCompletedOnboarding: true,
        createdAt: '2026-04-06T00:00:00.000Z',
        updatedAt: '2026-04-06T00:00:00.000Z',
      },
      user: {
        id: 'primary',
        name: 'Alex',
        createdAt: '2026-04-06T00:00:00.000Z',
        updatedAt: '2026-04-06T00:00:00.000Z',
      },
    }

    completeMock.mockResolvedValue(resultPayload)

    const { result } = renderHook(() => useCompleteOnboarding(), { wrapper })

    await act(async () => {
      await result.current.mutateAsync({
        userName: 'Alex',
        initialAccount: {
          name: 'Main Wallet',
          type: 'ewallet',
          initialBalance: 2500,
          safetyBuffer: 1000,
          isArchived: false,
        },
      })
    })

    expect(queryClient.getQueryData(USER_QUERY_KEY)).toEqual(resultPayload.user)
    expect(queryClient.getQueryData(USER_SETTINGS_QUERY_KEY)).toEqual(
      resultPayload.userSettings,
    )
    expect(queryClient.getQueryData(SETTINGS_SCREEN_QUERY_KEY)).toEqual({
      currency: 'PHP',
      theme: 'system',
      hasCompletedOnboarding: true,
    })

    queryClient.clear()
  })
})

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

afterEach(() => {
  vi.clearAllMocks()
})

describe('useCompleteOnboarding', () => {
  it('hydrates the guard queries immediately after onboarding completes', async () => {
    const queryClient = new QueryClient()
    const wrapper = createWrapper(queryClient)
    const resultPayload: CompleteOnboardingResultDto = {
      primaryAccount: {
        id: 'account-1',
        name: 'Main Wallet',
        type: 'ewallet',
        initialBalance: 2500,
        safetyBuffer: 1000,
        isArchived: false,
        createdAt: '2026-04-06T00:00:00.000Z',
        updatedAt: '2026-04-06T00:00:00.000Z',
      },
      salaryRule: {
        id: 'rule-1',
        name: 'Salary',
        type: 'income',
        amount: 15000,
        categoryId: 'category-income-salary',
        accountId: 'account-1',
        cadence: 'semi-monthly',
        semiMonthlyDays: [15, 30],
        monthlyDay: null,
        weeklyInterval: null,
        nextOccurrenceDate: '2026-04-15T00:00:00.000Z',
        isActive: true,
        createdAt: '2026-04-06T00:00:00.000Z',
        updatedAt: '2026-04-06T00:00:00.000Z',
      },
      recurringExpenseRules: [],
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
        primaryAccount: {
          name: 'Main Wallet',
          type: 'ewallet',
          initialBalance: 2500,
          safetyBuffer: 1000,
          isArchived: false,
        },
        salary: {
          name: 'Salary',
          amount: 15000,
          cadence: 'semi-monthly',
          semiMonthlyDays: [15, 30],
          monthlyDay: null,
          weeklyInterval: null,
          nextOccurrenceDate: '2026-04-15T00:00:00.000Z',
        },
        recurringExpenses: [],
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
  })
})

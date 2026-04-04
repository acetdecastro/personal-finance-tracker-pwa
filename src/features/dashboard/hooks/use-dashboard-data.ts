import { useQuery } from '@tanstack/react-query'
import { dashboardQueryService } from '../services/dashboard-query.service'

export const DASHBOARD_QUERY_KEY = ['dashboard'] as const

export function useDashboardData() {
  return useQuery({
    queryKey: DASHBOARD_QUERY_KEY,
    queryFn: () => dashboardQueryService.getDashboardData(),
  })
}

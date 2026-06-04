import { useQuery } from '@tanstack/react-query'
import { QUERY_KEYS } from '@/constants'
import { dashboardService } from '../api/dashboard.api'

export const useDashboardSummary = () =>
  useQuery({
    queryKey: QUERY_KEYS.DASHBOARD,
    queryFn: dashboardService.dashboard,
    refetchOnWindowFocus: false,
  })

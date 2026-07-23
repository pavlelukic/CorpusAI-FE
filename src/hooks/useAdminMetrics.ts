import { useQuery } from '@tanstack/react-query'
import { fetchMetrics } from '@/api/admin'
import type { ApiError, MetricsParams, MetricsResponse } from '@/types'

export function useAdminMetrics(params: MetricsParams) {
  return useQuery<MetricsResponse, ApiError>({
    queryKey: ['admin-metrics', params.from, params.to, params.groupBy],
    queryFn: () => fetchMetrics(params),
  })
}

// ─────────────────────────────────────────
// TANSTACK QUERY CLIENT
// Konfigurasi global - default behavior
// untuk semua useQuery & useMutation
// ─────────────────────────────────────────

import { QueryClient } from '@tanstack/react-query'
import { isAxiosError } from 'axios'
import { QUERY_CONFIG } from '@/constants'

// Cek apakah error sebaiknya di-retry
// Jangan retry untuk error 4xx (client error)
const shouldRetry = (failureCount: number, error: unknown): boolean => {
  if (isAxiosError(error)) {
    const status = error.response?.status
    if (status && status >= 400 && status < 500) return false
  }
  return failureCount < QUERY_CONFIG.RETRY
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime:    QUERY_CONFIG.STALE_TIME,
      gcTime:       QUERY_CONFIG.CACHE_TIME,
      retry:        shouldRetry,
      retryDelay:   QUERY_CONFIG.RETRY_DELAY,
      refetchOnWindowFocus: false, // disable - terlalu agresif untuk dashboard internal
    },
    mutations: {
      retry: false, // mutasi tidak di-retry otomatis
    },
  },
})
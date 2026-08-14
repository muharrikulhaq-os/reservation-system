// ─────────────────────────────────────────
// usePagination
// State management untuk pagination params
// - sync dengan URL search params opsional
// ─────────────────────────────────────────

import { useState, useCallback } from 'react'
import { PAGINATION } from '@/constants'

interface PaginationState {
  page: number
  limit: number
}

interface PaginationReturn extends PaginationState {
  setPage: (page: number) => void
  setLimit: (limit: number) => void
  reset: () => void
  // Helper untuk dipass ke API params
  params: PaginationState
}

export const usePagination = (
  initialLimit: number = PAGINATION.DEFAULT_LIMIT,
): PaginationReturn => {
  const [page,  setPageState]  = useState<number>(PAGINATION.DEFAULT_PAGE)
  const [limit, setLimitState] = useState<number>(initialLimit)

  const setPage = useCallback((p: number) => setPageState(p), [])

  const setLimit = useCallback((l: number) => {
    setLimitState(l)
    setPageState(PAGINATION.DEFAULT_PAGE) // reset ke halaman 1 saat limit berubah
  }, [])

  const reset = useCallback(() => {
    setPageState(PAGINATION.DEFAULT_PAGE)
    setLimitState(initialLimit)
  }, [initialLimit])

  return { page, limit, setPage, setLimit, reset, params: { page, limit } }
}

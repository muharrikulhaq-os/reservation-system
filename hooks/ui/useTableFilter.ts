// ─────────────────────────────────────────
// useTableFilter
// Gabungan search + pagination dengan
// debounce - pola yang sering dipakai
// di halaman list (bookings, vehicles, dll)
// ─────────────────────────────────────────

import { useState, useCallback } from 'react'
import { usePagination } from './usePagination'
import { useDebounce } from './useDebounce'
import { PAGINATION } from '@/constants'

type SortOrder = 'asc' | 'desc'

interface TableFilterReturn<TFilters extends Record<string, unknown>> {
  // Search
  search: string
  searchDebounced: string
  setSearch: (v: string) => void
  // Sorting - server-side, dikirim sebagai sortBy/sortOrder ke query hook
  sortBy: string | undefined
  sortOrder: SortOrder | undefined
  setSort: (sortBy: string | undefined, sortOrder?: SortOrder) => void
  // Pagination
  page: number
  limit: number
  setPage: (p: number) => void
  setLimit: (l: number) => void
  // Extra filters
  filters: TFilters
  setFilter: <K extends keyof TFilters>(key: K, value: TFilters[K]) => void
  resetFilters: () => void
  // Combined params - langsung dipass ke query hook
  params: { search: string; page: number; limit: number; sortBy?: string; sortOrder?: SortOrder } & TFilters
}

export const useTableFilter = <TFilters extends Record<string, unknown>>(
  initialFilters: TFilters,
  initialLimit: number = PAGINATION.DEFAULT_LIMIT,
): TableFilterReturn<TFilters> => {
  const [search, setSearchRaw]   = useState('')
  const [filters, setFiltersState] = useState<TFilters>(initialFilters)
  const [sortBy, setSortByRaw]     = useState<string | undefined>(undefined)
  const [sortOrder, setSortOrderRaw] = useState<SortOrder | undefined>(undefined)
  const { page, limit, setPage, setLimit, reset } = usePagination(initialLimit)
  const searchDebounced = useDebounce(search)

  const setSearch = useCallback((v: string) => {
    setSearchRaw(v)
    setPage(1) // reset page saat search berubah
  }, [setPage])

  const setSort = useCallback((by: string | undefined, order: SortOrder = 'asc') => {
    setSortByRaw(by)
    setSortOrderRaw(by ? order : undefined)
    setPage(1) // reset page saat urutan berubah
  }, [setPage])

  const setFilter = useCallback(<K extends keyof TFilters>(
    key: K,
    value: TFilters[K],
  ) => {
    setFiltersState((prev) => ({ ...prev, [key]: value }))
    setPage(1)
  }, [setPage])

  const resetFilters = useCallback(() => {
    setSearchRaw('')
    setFiltersState(initialFilters)
    setSortByRaw(undefined)
    setSortOrderRaw(undefined)
    reset()
  }, [initialFilters, reset])

  return {
    search,
    searchDebounced,
    setSearch,
    sortBy,
    sortOrder,
    setSort,
    page,
    limit,
    setPage,
    setLimit,
    filters,
    setFilter,
    resetFilters,
    params: {
      search: searchDebounced,
      page,
      limit,
      sortBy,
      sortOrder,
      ...filters,
    },
  }
}

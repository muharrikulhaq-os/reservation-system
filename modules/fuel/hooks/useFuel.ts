// ─────────────────────────────────────────
// FUEL EXPENSE HOOKS
// ─────────────────────────────────────────

import { useQuery, useQueries, useMutation, useQueryClient } from '@tanstack/react-query'
import { QUERY_KEYS } from '@/constants'
import { fuelApi } from '../api/fuel.api'
import type { FuelExpenseParams, CreateFuelPayload } from '@/types'

// ── Queries ──────────────────────────────

export const useFuelExpenses = (params?: FuelExpenseParams) =>
  useQuery({
    queryKey: [...QUERY_KEYS.FUEL, params],
    queryFn:  () => fuelApi.getAll(params),
  })

// Riwayat BBM gabungan untuk beberapa booking sekaligus - dipakai saat booking
// sudah di-merge, supaya pengisian yang dicatat di booking pasangannya (primary
// atau merged, siapapun) tetap muncul di kedua sisi.
export const useFuelExpensesForBookings = (bookingIds: number[]) => {
  const results = useQueries({
    queries: bookingIds.map((bookingId) => ({
      queryKey: [...QUERY_KEYS.FUEL, { bookingId, limit: 50 }],
      queryFn:  () => fuelApi.getAll({ bookingId, limit: 50 }),
    })),
  })
  const isLoading = results.some((r) => r.isLoading)
  const items = results
    .flatMap((r) => r.data?.data ?? [])
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  return { items, isLoading }
}

export const useFuelExpense = (id: number) =>
  useQuery({
    queryKey: [...QUERY_KEYS.FUEL, id],
    queryFn:  () => fuelApi.getById(id).then((r) => r.data),
    enabled:  !!id,
  })

// ── Mutations ────────────────────────────

export const useCreateFuel = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateFuelPayload) => fuelApi.create(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.FUEL })
      qc.invalidateQueries({ queryKey: QUERY_KEYS.VEHICLES })
    },
  })
}

export const useDeleteFuel = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => fuelApi.delete(id),
    onSuccess:  () => qc.invalidateQueries({ queryKey: QUERY_KEYS.FUEL }),
  })
}

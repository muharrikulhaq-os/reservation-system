// ─────────────────────────────────────────
// FUEL EXPENSE HOOKS
// ─────────────────────────────────────────

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { QUERY_KEYS } from '@/constants'
import { fuelService } from '@/services'
import type {
  FuelExpenseQueryParams,
  CreateBbmExpensePayload,
  CreateListrikExpensePayload,
} from '@/types'

// ── Queries ──────────────────────────────

export const useFuelExpenses = (params?: FuelExpenseQueryParams) =>
  useQuery({
    queryKey: [...QUERY_KEYS.FUEL_EXPENSES, params],
    queryFn:  () => fuelService.getAll(params).then((r) => r.data),
  })

export const useFuelExpense = (id: number) =>
  useQuery({
    queryKey: [...QUERY_KEYS.FUEL_EXPENSES, id],
    queryFn:  () => fuelService.getById(id).then((r) => r.data),
    enabled:  !!id,
  })

// ── Mutations ────────────────────────────

export const useCreateBbmExpense = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ driverId, payload }: { driverId: number; payload: CreateBbmExpensePayload }) =>
      fuelService.createBbm(driverId, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.FUEL_EXPENSES })
      // Odometer kendaraan berubah — invalidate vehicles
      qc.invalidateQueries({ queryKey: QUERY_KEYS.VEHICLES })
    },
  })
}

export const useCreateListrikExpense = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ driverId, payload }: { driverId: number; payload: CreateListrikExpensePayload }) =>
      fuelService.createListrik(driverId, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: QUERY_KEYS.FUEL_EXPENSES }),
  })
}

export const useDeleteFuelExpense = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => fuelService.delete(id),
    onSuccess:  () => qc.invalidateQueries({ queryKey: QUERY_KEYS.FUEL_EXPENSES }),
  })
}

// ─────────────────────────────────────────
// FUEL EXPENSE HOOKS
// ─────────────────────────────────────────

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { QUERY_KEYS } from '@/constants'
import { fuelApi } from '../api/fuel.api'
import type { FuelExpenseParams, CreateFuelPayload } from '@/types'

// ── Queries ──────────────────────────────

export const useFuelExpenses = (params?: FuelExpenseParams) =>
  useQuery({
    queryKey: [...QUERY_KEYS.FUEL, params],
    queryFn:  () => fuelApi.getAll(params),
  })

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

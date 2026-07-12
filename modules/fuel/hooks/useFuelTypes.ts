// ─────────────────────────────────────────
// FUEL TYPES HOOKS (master data)
// ─────────────────────────────────────────

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { QUERY_KEYS } from '@/constants'
import { fuelTypeApi } from '../api/fuelType.api'
import type { CreateFuelTypePayload } from '@/types'

export const useFuelTypes = () =>
  useQuery({
    queryKey: QUERY_KEYS.FUEL_TYPES,
    queryFn:  () => fuelTypeApi.getAll().then((r) => r.data),
    staleTime: 5 * 60 * 1000,
  })

export const useCreateFuelType = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateFuelTypePayload) => fuelTypeApi.create(payload),
    onSuccess:  () => qc.invalidateQueries({ queryKey: QUERY_KEYS.FUEL_TYPES }),
  })
}

export const useUpdateFuelType = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: CreateFuelTypePayload }) =>
      fuelTypeApi.update(id, payload),
    onSuccess:  () => qc.invalidateQueries({ queryKey: QUERY_KEYS.FUEL_TYPES }),
  })
}

export const useDeleteFuelType = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => fuelTypeApi.delete(id),
    onSuccess:  () => qc.invalidateQueries({ queryKey: QUERY_KEYS.FUEL_TYPES }),
  })
}

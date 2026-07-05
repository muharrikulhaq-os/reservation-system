// ─────────────────────────────────────────
// MAINTENANCE HOOKS
// ─────────────────────────────────────────

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { QUERY_KEYS } from '@/constants'
import { maintenanceApi } from '../api/maintenance.api'
import type {
  MaintenanceQueryParams,
  CreateMaintenancePayload,
  CompleteMaintenancePayload,
} from '@/types'

// ── Queries ──────────────────────────────

// Mengembalikan PaginatedResponse penuh (data + pagination)
export const useMaintenanceRecords = (params?: MaintenanceQueryParams) =>
  useQuery({
    queryKey: [...QUERY_KEYS.MAINTENANCE, params],
    queryFn:  () => maintenanceApi.getAll(params),
  })

export const useMaintenanceRecord = (id: number) =>
  useQuery({
    queryKey: [...QUERY_KEYS.MAINTENANCE, id],
    queryFn:  () => maintenanceApi.getById(id).then((r) => r.data),
    enabled:  !!id,
  })

// ── Mutations ────────────────────────────

export const useCreateMaintenance = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateMaintenancePayload) => maintenanceApi.create(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.MAINTENANCE })
      // Status resource berubah → MAINTENANCE
      qc.invalidateQueries({ queryKey: QUERY_KEYS.VEHICLES })
      qc.invalidateQueries({ queryKey: QUERY_KEYS.ROOMS })
    },
  })
}

export const useCompleteMaintenance = (id: number) => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: CompleteMaintenancePayload) => maintenanceApi.complete(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.MAINTENANCE })
      qc.invalidateQueries({ queryKey: [...QUERY_KEYS.MAINTENANCE, id] })
      // Status resource kembali AVAILABLE
      qc.invalidateQueries({ queryKey: QUERY_KEYS.VEHICLES })
      qc.invalidateQueries({ queryKey: QUERY_KEYS.ROOMS })
    },
  })
}

export const useDeleteMaintenance = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => maintenanceApi.delete(id),
    onSuccess:  () => qc.invalidateQueries({ queryKey: QUERY_KEYS.MAINTENANCE }),
  })
}

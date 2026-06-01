// ─────────────────────────────────────────
// MAINTENANCE HOOKS
// ─────────────────────────────────────────

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { QUERY_KEYS } from '@/constants'
import { maintenanceService } from '@/services'
import type {
  MaintenanceQueryParams,
  CreateMaintenancePayload,
  UpdateMaintenancePayload,
} from '@/types'

// ── Queries ──────────────────────────────

export const useMaintenanceRecords = (params?: MaintenanceQueryParams) =>
  useQuery({
    queryKey: [...QUERY_KEYS.MAINTENANCE, params],
    queryFn:  () => maintenanceService.getAll(params).then((r) => r.data),
  })

export const useMaintenanceRecord = (id: number) =>
  useQuery({
    queryKey: [...QUERY_KEYS.MAINTENANCE, id],
    queryFn:  () => maintenanceService.getById(id).then((r) => r.data),
    enabled:  !!id,
  })

// ── Mutations ────────────────────────────

export const useCreateMaintenance = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateMaintenancePayload) =>
      maintenanceService.create(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.MAINTENANCE })
      // Status resource berubah → MAINTENANCE, invalidate vehicles & rooms
      qc.invalidateQueries({ queryKey: QUERY_KEYS.VEHICLES })
      qc.invalidateQueries({ queryKey: QUERY_KEYS.ROOMS })
    },
  })
}

export const useUpdateMaintenance = (id: number) => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: UpdateMaintenancePayload) =>
      maintenanceService.update(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.MAINTENANCE })
      // endDate diisi → status resource kembali AVAILABLE
      qc.invalidateQueries({ queryKey: QUERY_KEYS.VEHICLES })
      qc.invalidateQueries({ queryKey: QUERY_KEYS.ROOMS })
    },
  })
}

export const useDeleteMaintenance = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => maintenanceService.delete(id),
    onSuccess:  () => qc.invalidateQueries({ queryKey: QUERY_KEYS.MAINTENANCE }),
  })
}

// ─────────────────────────────────────────
// MAINTENANCE HOOKS
// ─────────────────────────────────────────

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { QUERY_KEYS } from '@/constants'
import { maintenanceApi } from '../api/maintenance.api'
import type {
  MaintenanceParams,
  CreateMaintenancePayload,
  UpdateMaintenancePayload,
  CompleteMaintenancePayload,
} from '@/types'

// ── Queries ──────────────────────────────

export const useMaintenanceRecords = (params?: MaintenanceParams) =>
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

const invalidateResources = (qc: ReturnType<typeof useQueryClient>) => {
  qc.invalidateQueries({ queryKey: QUERY_KEYS.MAINTENANCE })
  qc.invalidateQueries({ queryKey: QUERY_KEYS.VEHICLES })
  qc.invalidateQueries({ queryKey: QUERY_KEYS.ROOMS })
}

export const useCreateMaintenance = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateMaintenancePayload) => maintenanceApi.create(payload),
    onSuccess:  () => invalidateResources(qc),
  })
}

export const useUpdateMaintenance = (id: number) => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: UpdateMaintenancePayload) => maintenanceApi.update(id, payload),
    onSuccess: () => {
      invalidateResources(qc)
      qc.invalidateQueries({ queryKey: [...QUERY_KEYS.MAINTENANCE, id] })
    },
  })
}

export const useCompleteMaintenance = (id: number) => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: CompleteMaintenancePayload) => maintenanceApi.complete(id, payload),
    onSuccess: () => {
      invalidateResources(qc)
      qc.invalidateQueries({ queryKey: [...QUERY_KEYS.MAINTENANCE, id] })
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

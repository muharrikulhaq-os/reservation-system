// ─────────────────────────────────────────
// DRIVER HOOKS
// ─────────────────────────────────────────

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { QUERY_KEYS } from '@/constants'
import { driverService } from '../api/driver.api'
import type {
  DriverQueryParams,
  DriverAvailabilityParams,
  CreateDriverPayload,
  UpdateDriverPayload,
  AssignDriverToVehiclePayload,
} from '@/types'

// ── Queries ──────────────────────────────

export const useDrivers = (params?: DriverQueryParams) =>
  useQuery({
    queryKey: [...QUERY_KEYS.DRIVERS, params],
    queryFn:  () => driverService.getAll(params).then((r) => r.data),
  })

export const useDriver = (id: number) =>
  useQuery({
    queryKey: [...QUERY_KEYS.DRIVERS, id],
    queryFn:  () => driverService.getById(id).then((r) => r.data),
    enabled:  !!id,
  })

export const useDriverAssignmentHistory = (id: number) =>
  useQuery({
    queryKey: [...QUERY_KEYS.DRIVERS, id, 'assignments'],
    queryFn:  () => driverService.getAssignmentHistory(id).then((r) => r.data),
    enabled:  !!id,
  })

// Ketersediaan driver — hanya fetch jika startDate & endDate ada
export const useDriverAvailability = (params: Partial<DriverAvailabilityParams>) =>
  useQuery({
    queryKey: [...QUERY_KEYS.DRIVERS, 'availability', params],
    queryFn:  () =>
      driverService
        .getAvailability(params as DriverAvailabilityParams)
        .then((r) => r.data),
    enabled: !!params.startDate && !!params.endDate,
  })

// ── Mutations ────────────────────────────

export const useCreateDriver = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateDriverPayload) => driverService.create(payload),
    onSuccess:  () => qc.invalidateQueries({ queryKey: QUERY_KEYS.DRIVERS }),
  })
}

export const useUpdateDriver = (id: number) => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: UpdateDriverPayload) => driverService.update(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.DRIVERS })
      qc.invalidateQueries({ queryKey: [...QUERY_KEYS.DRIVERS, id] })
    },
  })
}

export const useToggleDriverActive = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => driverService.toggleActive(id),
    onSuccess:  () => qc.invalidateQueries({ queryKey: QUERY_KEYS.DRIVERS }),
  })
}

export const useAssignDriverToVehicle = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: AssignDriverToVehiclePayload }) =>
      driverService.assignToVehicle(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.DRIVERS })
      // Invalidate vehicles juga — assignedPlate di vehicle bisa berubah
      qc.invalidateQueries({ queryKey: QUERY_KEYS.VEHICLES })
    },
  })
}

export const useReleaseDriverFromVehicle = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => driverService.releaseFromVehicle(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.DRIVERS })
      qc.invalidateQueries({ queryKey: QUERY_KEYS.VEHICLES })
    },
  })
}

// ─────────────────────────────────────────
// VEHICLE HOOKS
// ─────────────────────────────────────────

import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from '@tanstack/react-query'
import { QUERY_KEYS } from '@/constants'
import { vehicleService } from '../api/vehicle.api'
import type {
  VehicleQueryParams,
  CreateVehiclePayload,
  UpdateVehiclePayload,
  UpdateVehicleStatusPayload,
  CreateVehicleCategoryPayload,
  CreateAttachmentPayload,
} from '@/types'

// ── Queries ──────────────────────────────

export const useVehicles = (params?: VehicleQueryParams) =>
  useQuery({
    queryKey: [...QUERY_KEYS.VEHICLES, params],
    queryFn:  () => vehicleService.getAll(params).then((r) => r.data),
  })

// Varian dengan PaginatedResponse penuh (data + pagination) untuk picker/list
export const useVehiclesPaginated = (
  params?: VehicleQueryParams,
  options?: { enabled?: boolean },
) =>
  useQuery({
    queryKey: [...QUERY_KEYS.VEHICLES, 'paginated', params],
    queryFn:  () => vehicleService.getAll(params),
    enabled:  options?.enabled ?? true,
    // Tahan data halaman sebelumnya saat pindah halaman -
    // tanpa ini pager ikut hilang tiap kali refetch.
    placeholderData: keepPreviousData,
  })

export const useVehicle = (id: number) =>
  useQuery({
    queryKey: [...QUERY_KEYS.VEHICLES, id],
    queryFn:  () => vehicleService.getById(id).then((r) => r.data),
    enabled:  !!id,
  })

export const useVehicleCategories = () =>
  useQuery({
    queryKey: QUERY_KEYS.VEHICLE_CATEGORIES,
    queryFn:  () => vehicleService.getCategories().then((r) => r.data),
    staleTime: Infinity,
  })

export const useVehicleAttachments = (vehicleId: number) =>
  useQuery({
    queryKey: [...QUERY_KEYS.VEHICLES, vehicleId, 'attachments'],
    queryFn:  () => vehicleService.getAttachments(vehicleId).then((r) => r.data),
    enabled:  !!vehicleId,
  })

// ── Mutations ────────────────────────────

export const useCreateVehicle = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateVehiclePayload) => vehicleService.create(payload),
    onSuccess:  () => qc.invalidateQueries({ queryKey: QUERY_KEYS.VEHICLES }),
  })
}

export const useUpdateVehicle = (id: number) => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: UpdateVehiclePayload) => vehicleService.update(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.VEHICLES })
      qc.invalidateQueries({ queryKey: [...QUERY_KEYS.VEHICLES, id] })
    },
  })
}

export const useUpdateVehicleStatus = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdateVehicleStatusPayload }) =>
      vehicleService.updateStatus(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: QUERY_KEYS.VEHICLES }),
  })
}

export const useUpdateVehiclePhoto = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, file }: { id: number; file: File }) =>
      vehicleService.updatePhoto(id, file),
    onSuccess: (_data, { id }) =>
      qc.invalidateQueries({ queryKey: [...QUERY_KEYS.VEHICLES, id] }),
  })
}

export const useDeleteVehicle = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => vehicleService.delete(id),
    onSuccess:  () => qc.invalidateQueries({ queryKey: QUERY_KEYS.VEHICLES }),
  })
}

// Sinkron dua arah dengan driver (mengubah kolom yang sama di backend) -
// invalidate DRIVERS juga supaya form/daftar supir ikut ter-update.
export const useSetVehicleFixedDriver = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, driverId }: { id: number; driverId: number | null }) =>
      vehicleService.setFixedDriver(id, driverId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.VEHICLES })
      qc.invalidateQueries({ queryKey: QUERY_KEYS.DRIVERS })
    },
  })
}

// ── Category Mutations ────────────────────

export const useCreateVehicleCategory = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateVehicleCategoryPayload) =>
      vehicleService.createCategory(payload),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: QUERY_KEYS.VEHICLE_CATEGORIES }),
  })
}

export const useDeleteVehicleCategory = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => vehicleService.deleteCategory(id),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: QUERY_KEYS.VEHICLE_CATEGORIES }),
  })
}

// ── Attachment Mutations ──────────────────

export const useUploadVehicleAttachment = (vehicleId: number) => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateAttachmentPayload) =>
      vehicleService.uploadAttachment(vehicleId, payload),
    onSuccess: () =>
      qc.invalidateQueries({
        queryKey: [...QUERY_KEYS.VEHICLES, vehicleId, 'attachments'],
      }),
  })
}

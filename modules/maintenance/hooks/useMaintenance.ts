// ─────────────────────────────────────────
// MAINTENANCE HOOKS
// Menu lain (kendaraan, dashboard, laporan) ikut diperbarui lewat DataSync
// (header X-Data-Changed) - onSuccess cukup key milik modul ini.
// ─────────────────────────────────────────

import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useMutation } from '@/lib/mutation'
import { QUERY_KEYS } from '@/constants'
import {
  maintenanceApi,
  vendorApi,
  vehicleIssueApi,
  documentSettingsApi,
} from '../api/maintenance.api'
import type {
  MaintenanceParams,
  MaintenancePlanPayload,
  ScheduleMaintenancePayload,
  HandoverMaintenancePayload,
  ReturnMaintenancePayload,
  MaintenanceCostPayload,
  MaintenanceDocumentKind,
  VendorParams,
  VendorPayload,
  VehicleIssueParams,
  DocumentSettingsPayload,
} from '@/types'

// ── Maintenance ──────────────────────────

export const useMaintenanceRecords = (params?: MaintenanceParams) =>
  useQuery({
    queryKey: [...QUERY_KEYS.MAINTENANCE, 'list', params],
    queryFn: () => maintenanceApi.getAll(params),
  })

export const useMaintenanceRecord = (id: number) =>
  useQuery({
    queryKey: [...QUERY_KEYS.MAINTENANCE, 'detail', id],
    queryFn: () => maintenanceApi.getById(id).then((r) => r.data),
    enabled: !!id,
  })

export const useMaintenanceOptions = () =>
  useQuery({
    queryKey: QUERY_KEYS.MAINTENANCE_OPTIONS,
    queryFn: () => maintenanceApi.options().then((r) => r.data),
    staleTime: Infinity,
  })

const useMaintenanceMutation = <V,>(fn: (vars: V) => Promise<unknown>) => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: fn,
    onSuccess: () => qc.invalidateQueries({ queryKey: QUERY_KEYS.MAINTENANCE }),
  })
}

export const useCreateMaintenance = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: MaintenancePlanPayload) => maintenanceApi.create(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: QUERY_KEYS.MAINTENANCE }),
  })
}

export const useUpdateMaintenance = (id: number) => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: MaintenancePlanPayload) => maintenanceApi.update(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: QUERY_KEYS.MAINTENANCE }),
  })
}

export const useSubmitMaintenance = () =>
  useMaintenanceMutation((id: number) => maintenanceApi.submit(id))

export const useScheduleMaintenance = (id: number) => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (p: ScheduleMaintenancePayload) => maintenanceApi.schedule(id, p),
    onSuccess: () => qc.invalidateQueries({ queryKey: QUERY_KEYS.MAINTENANCE }),
  })
}

export const useHandoverMaintenance = (id: number) => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (p: HandoverMaintenancePayload) => maintenanceApi.handover(id, p),
    onSuccess: () => qc.invalidateQueries({ queryKey: QUERY_KEYS.MAINTENANCE }),
  })
}

export const useReturnMaintenance = (id: number) => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (p: ReturnMaintenancePayload) => maintenanceApi.returnVehicle(id, p),
    onSuccess: () => qc.invalidateQueries({ queryKey: QUERY_KEYS.MAINTENANCE }),
  })
}

export const useCancelMaintenance = (id: number) => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (reason: string) => maintenanceApi.cancel(id, reason),
    onSuccess: () => qc.invalidateQueries({ queryKey: QUERY_KEYS.MAINTENANCE }),
  })
}

export const useUpdateMaintenanceCost = (id: number) => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (p: MaintenanceCostPayload) => maintenanceApi.updateCost(id, p),
    onSuccess: () => qc.invalidateQueries({ queryKey: QUERY_KEYS.MAINTENANCE }),
  })
}

export const useUploadMaintenanceDocuments = (id: number) => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ kind, files }: { kind: MaintenanceDocumentKind; files: File[] }) =>
      maintenanceApi.uploadDocuments(id, kind, files),
    onSuccess: () => qc.invalidateQueries({ queryKey: QUERY_KEYS.MAINTENANCE }),
  })
}

export const useDeleteMaintenanceDocument = (id: number) => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (docId: number) => maintenanceApi.deleteDocument(id, docId),
    onSuccess: () => qc.invalidateQueries({ queryKey: QUERY_KEYS.MAINTENANCE }),
  })
}

export const useDeleteMaintenance = () =>
  useMaintenanceMutation((id: number) => maintenanceApi.delete(id))

// ── Vendor ───────────────────────────────

export const useVendors = (params?: VendorParams) =>
  useQuery({
    queryKey: [...QUERY_KEYS.VENDORS, params],
    queryFn: () => vendorApi.getAll(params).then((r) => r.data),
  })

export const useSaveVendor = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id?: number; payload: VendorPayload }) =>
      id ? vendorApi.update(id, payload) : vendorApi.create(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: QUERY_KEYS.VENDORS }),
  })
}

export const useToggleVendor = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => vendorApi.toggle(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: QUERY_KEYS.VENDORS }),
  })
}

export const useDeleteVendor = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => vendorApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: QUERY_KEYS.VENDORS }),
  })
}

// ── Laporan kendala ──────────────────────

export const useVehicleIssues = (params?: VehicleIssueParams) =>
  useQuery({
    queryKey: [...QUERY_KEYS.VEHICLE_ISSUES, params],
    queryFn: () => vehicleIssueApi.getAll(params),
  })

export const useConvertVehicleIssue = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => vehicleIssueApi.convert(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.VEHICLE_ISSUES })
      qc.invalidateQueries({ queryKey: QUERY_KEYS.MAINTENANCE })
    },
  })
}

export const useDismissVehicleIssue = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, note }: { id: number; note: string }) => vehicleIssueApi.dismiss(id, note),
    onSuccess: () => qc.invalidateQueries({ queryKey: QUERY_KEYS.VEHICLE_ISSUES }),
  })
}

// ── Pengaturan dokumen ───────────────────

export const useDocumentSettings = () =>
  useQuery({
    queryKey: QUERY_KEYS.DOCUMENT_SETTINGS,
    queryFn: () => documentSettingsApi.get().then((r) => r.data),
  })

export const useUpdateDocumentSettings = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (p: DocumentSettingsPayload) => documentSettingsApi.update(p),
    onSuccess: () => qc.invalidateQueries({ queryKey: QUERY_KEYS.DOCUMENT_SETTINGS }),
  })
}

export const useDocumentLogo = () => {
  const qc = useQueryClient()
  const done = () => qc.invalidateQueries({ queryKey: QUERY_KEYS.DOCUMENT_SETTINGS })
  const upload = useMutation({ mutationFn: (f: File) => documentSettingsApi.uploadLogo(f), onSuccess: done })
  const remove = useMutation({ mutationFn: () => documentSettingsApi.deleteLogo(), onSuccess: done })
  return { upload, remove }
}

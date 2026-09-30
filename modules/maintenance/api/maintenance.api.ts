// ─────────────────────────────────────────
// MAINTENANCE SERVICE - maintenance oleh vendor/bengkel luar, master vendor,
// laporan kendala supir, dan pengaturan dokumen (kop surat).
// ─────────────────────────────────────────

import { apiClient } from '@/lib'
import { API_ENDPOINTS } from '@/constants'
import type {
  ApiResponse,
  PaginatedResponse,
  MaintenanceRecord,
  MaintenanceParams,
  MaintenancePlanPayload,
  MaintenanceActionResponse,
  MaintenanceOptions,
  ScheduleMaintenancePayload,
  HandoverMaintenancePayload,
  ReturnMaintenancePayload,
  MaintenanceCostPayload,
  MaintenanceDocument,
  MaintenanceDocumentKind,
  MaintenancePdfKind,
  Vendor,
  VendorPayload,
  VendorParams,
  VehicleIssue,
  VehicleIssueParams,
  DocumentSettings,
  DocumentSettingsPayload,
} from '@/types'

const E = API_ENDPOINTS.MAINTENANCE

const action = (url: string, body?: unknown) =>
  apiClient.post<MaintenanceActionResponse>(url, body ?? {}).then((r) => r.data)

export const maintenanceApi = {
  getAll: (params?: MaintenanceParams) =>
    apiClient.get<PaginatedResponse<MaintenanceRecord>>(E.BASE, { params }).then((r) => r.data),

  getById: (id: number) =>
    apiClient.get<ApiResponse<MaintenanceRecord>>(E.BY_ID(id)).then((r) => r.data),

  options: () =>
    apiClient.get<ApiResponse<MaintenanceOptions>>(E.OPTIONS).then((r) => r.data),

  create: (payload: MaintenancePlanPayload) => action(E.BASE, payload),

  update: (id: number, payload: MaintenancePlanPayload) =>
    apiClient.put<MaintenanceActionResponse>(E.BY_ID(id), payload).then((r) => r.data),

  submit: (id: number) => action(E.SUBMIT(id)),
  schedule: (id: number, payload: ScheduleMaintenancePayload) => action(E.SCHEDULE(id), payload),
  handover: (id: number, payload: HandoverMaintenancePayload) => action(E.HANDOVER(id), payload),
  returnVehicle: (id: number, payload: ReturnMaintenancePayload) => action(E.RETURN(id), payload),
  cancel: (id: number, reason: string) => action(E.CANCEL(id), { reason }),

  updateCost: (id: number, payload: MaintenanceCostPayload) =>
    apiClient.patch<ApiResponse<MaintenanceRecord>>(E.COST(id), payload).then((r) => r.data),

  uploadDocuments: (id: number, kind: MaintenanceDocumentKind, files: File[]) => {
    const fd = new FormData()
    fd.append('kind', kind)
    files.forEach((f) => fd.append('files[]', f))
    return apiClient
      .post<ApiResponse<MaintenanceDocument[]>>(E.DOCUMENTS(id), fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .then((r) => r.data)
  },

  deleteDocument: (id: number, docId: number) =>
    apiClient.delete<ApiResponse<null>>(E.DOCUMENT(id, docId)).then((r) => r.data),

  delete: (id: number) => apiClient.delete<ApiResponse<null>>(E.BY_ID(id)).then((r) => r.data),

  /** PDF dibuat backend; dikembalikan sebagai Blob + nama file. */
  pdf: async (id: number, kind: MaintenancePdfKind) => {
    const res = await apiClient.get<Blob>(E.PDF(id, kind), { responseType: 'blob' })
    const disp = String(res.headers['content-disposition'] ?? '')
    const name = /filename="?([^";]+)"?/.exec(disp)?.[1] ?? `maintenance-${id}-${kind}.pdf`
    return { blob: res.data, name }
  },
}

export const vendorApi = {
  getAll: (params?: VendorParams) =>
    apiClient
      .get<ApiResponse<Vendor[]>>(API_ENDPOINTS.VENDORS.BASE, { params })
      .then((r) => r.data),
  create: (payload: VendorPayload) =>
    apiClient.post<ApiResponse<Vendor>>(API_ENDPOINTS.VENDORS.BASE, payload).then((r) => r.data),
  update: (id: number, payload: VendorPayload) =>
    apiClient.put<ApiResponse<Vendor>>(API_ENDPOINTS.VENDORS.BY_ID(id), payload).then((r) => r.data),
  toggle: (id: number) =>
    apiClient.patch<ApiResponse<Vendor>>(API_ENDPOINTS.VENDORS.TOGGLE(id)).then((r) => r.data),
  delete: (id: number) =>
    apiClient.delete<ApiResponse<null>>(API_ENDPOINTS.VENDORS.BY_ID(id)).then((r) => r.data),
}

export const vehicleIssueApi = {
  getAll: (params?: VehicleIssueParams) =>
    apiClient
      .get<PaginatedResponse<VehicleIssue>>(API_ENDPOINTS.VEHICLE_ISSUES.BASE, { params })
      .then((r) => r.data),
  convert: (id: number) =>
    apiClient
      .post<ApiResponse<VehicleIssue>>(API_ENDPOINTS.VEHICLE_ISSUES.CONVERT(id))
      .then((r) => r.data),
  dismiss: (id: number, note: string) =>
    apiClient
      .post<ApiResponse<VehicleIssue>>(API_ENDPOINTS.VEHICLE_ISSUES.DISMISS(id), { note })
      .then((r) => r.data),
}

export const documentSettingsApi = {
  get: () =>
    apiClient
      .get<ApiResponse<DocumentSettings>>(API_ENDPOINTS.DOCUMENT_SETTINGS.BASE)
      .then((r) => r.data),
  update: (payload: DocumentSettingsPayload) =>
    apiClient
      .put<ApiResponse<DocumentSettings>>(API_ENDPOINTS.DOCUMENT_SETTINGS.BASE, payload)
      .then((r) => r.data),
  uploadLogo: (file: File) => {
    const fd = new FormData()
    fd.append('logo', file)
    return apiClient
      .post<ApiResponse<DocumentSettings>>(API_ENDPOINTS.DOCUMENT_SETTINGS.LOGO, fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .then((r) => r.data)
  },
  deleteLogo: () =>
    apiClient
      .delete<ApiResponse<DocumentSettings>>(API_ENDPOINTS.DOCUMENT_SETTINGS.LOGO)
      .then((r) => r.data),
}

// ─────────────────────────────────────────
// MAINTENANCE SERVICE
// ─────────────────────────────────────────

import { apiClient } from '@/lib'
import { API_ENDPOINTS } from '@/constants'
import type {
  ApiResponse,
  PaginatedResponse,
  MaintenanceRecord,
  MaintenanceQueryParams,
  CreateMaintenancePayload,
  CompleteMaintenancePayload,
} from '@/types'

export const maintenanceApi = {
  getAll: (params?: MaintenanceQueryParams) =>
    apiClient
      .get<PaginatedResponse<MaintenanceRecord>>(API_ENDPOINTS.MAINTENANCE.BASE, { params })
      .then((r) => r.data),

  getById: (id: number) =>
    apiClient
      .get<ApiResponse<MaintenanceRecord>>(API_ENDPOINTS.MAINTENANCE.BY_ID(id))
      .then((r) => r.data),

  // POST otomatis ubah status resource → MAINTENANCE (backend handle)
  create: (payload: CreateMaintenancePayload) =>
    apiClient
      .post<ApiResponse<MaintenanceRecord>>(API_ENDPOINTS.MAINTENANCE.BASE, payload)
      .then((r) => r.data),

  // PATCH complete + upload bukti → status resource kembali AVAILABLE (backend handle)
  complete: (id: number, payload: CompleteMaintenancePayload) => {
    const fd = new FormData()
    fd.append('endDate', payload.endDate)
    fd.append('cost', String(payload.cost))
    if (payload.proofPhotos) payload.proofPhotos.forEach((p) => fd.append('proofPhotos[]', p))
    if (payload.note) fd.append('note', payload.note)
    return apiClient
      .patch<ApiResponse<MaintenanceRecord>>(API_ENDPOINTS.MAINTENANCE.COMPLETE(id), fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .then((r) => r.data)
  },

  delete: (id: number) =>
    apiClient
      .delete<ApiResponse<null>>(API_ENDPOINTS.MAINTENANCE.BY_ID(id))
      .then((r) => r.data),
}

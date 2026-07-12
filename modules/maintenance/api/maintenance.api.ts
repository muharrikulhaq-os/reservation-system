// ─────────────────────────────────────────
// MAINTENANCE SERVICE (sesuai API contract)
// ─────────────────────────────────────────

import { apiClient } from '@/lib'
import { API_ENDPOINTS } from '@/constants'
import type {
  ApiResponse,
  PaginatedResponse,
  MaintenanceRecord,
  MaintenanceParams,
  CreateMaintenancePayload,
  UpdateMaintenancePayload,
  CompleteMaintenancePayload,
} from '@/types'

export const maintenanceApi = {
  getAll: (params?: MaintenanceParams) =>
    apiClient
      .get<PaginatedResponse<MaintenanceRecord>>(API_ENDPOINTS.MAINTENANCE.BASE, { params })
      .then((r) => r.data),

  getById: (id: number) =>
    apiClient
      .get<ApiResponse<MaintenanceRecord>>(API_ENDPOINTS.MAINTENANCE.BY_ID(id))
      .then((r) => r.data),

  // POST otomatis ubah status resource → MAINTENANCE (backend)
  create: (payload: CreateMaintenancePayload) =>
    apiClient
      .post<ApiResponse<MaintenanceRecord>>(API_ENDPOINTS.MAINTENANCE.BASE, payload)
      .then((r) => r.data),

  // PUT — update (isi endDate → status resource kembali AVAILABLE)
  update: (id: number, payload: UpdateMaintenancePayload) =>
    apiClient
      .put<ApiResponse<MaintenanceRecord>>(API_ENDPOINTS.MAINTENANCE.BY_ID(id), payload)
      .then((r) => r.data),

  // PATCH /:id/complete — multipart, upload foto bukti + set completedAt + AVAILABLE
  complete: (id: number, payload: CompleteMaintenancePayload) => {
    const fd = new FormData()
    if (payload.photos) payload.photos.forEach((p) => fd.append('photos', p))
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

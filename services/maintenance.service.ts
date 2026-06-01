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
  UpdateMaintenancePayload,
} from '@/types'

export const maintenanceService = {
  getAll: (params?: MaintenanceQueryParams) =>
    apiClient
      .get<PaginatedResponse<MaintenanceRecord>>(
        API_ENDPOINTS.MAINTENANCE.BASE,
        { params },
      )
      .then((r) => r.data),

  getById: (id: number) =>
    apiClient
      .get<ApiResponse<MaintenanceRecord>>(API_ENDPOINTS.MAINTENANCE.BY_ID(id))
      .then((r) => r.data),

  // POST otomatis ubah status resource → MAINTENANCE
  create: (payload: CreateMaintenancePayload) =>
    apiClient
      .post<ApiResponse<MaintenanceRecord>>(API_ENDPOINTS.MAINTENANCE.BASE, payload)
      .then((r) => r.data),

  // PUT dengan endDate → status resource otomatis kembali AVAILABLE
  update: (id: number, payload: UpdateMaintenancePayload) =>
    apiClient
      .put<ApiResponse<MaintenanceRecord>>(
        API_ENDPOINTS.MAINTENANCE.BY_ID(id),
        payload,
      )
      .then((r) => r.data),

  delete: (id: number) =>
    apiClient
      .delete<ApiResponse<null>>(API_ENDPOINTS.MAINTENANCE.BY_ID(id))
      .then((r) => r.data),
}

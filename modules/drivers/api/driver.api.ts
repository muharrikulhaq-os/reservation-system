// ─────────────────────────────────────────
// DRIVER SERVICE
// ─────────────────────────────────────────

import { apiClient } from '@/lib'
import { API_ENDPOINTS } from '@/constants'
import type {
  ApiResponse,
  PaginatedResponse,
  Driver,
  DriverAssignment,
  DriverWithAvailability,
  DriverAvailabilityParams,
  ToggleDriverActiveResponse,
  DriverQueryParams,
  CreateDriverPayload,
  UpdateDriverPayload,
  AssignDriverToVehiclePayload,
} from '@/types'

export const driverService = {
  getAll: (params?: DriverQueryParams) =>
    apiClient
      .get<PaginatedResponse<Driver>>(API_ENDPOINTS.DRIVERS.BASE, { params })
      .then((r) => r.data),

  getById: (id: number) =>
    apiClient
      .get<ApiResponse<Driver>>(API_ENDPOINTS.DRIVERS.BY_ID(id))
      .then((r) => r.data),

  create: (payload: CreateDriverPayload) =>
    apiClient
      .post<ApiResponse<Driver>>(API_ENDPOINTS.DRIVERS.BASE, payload)
      .then((r) => r.data),

  update: (id: number, payload: UpdateDriverPayload) =>
    apiClient
      .put<ApiResponse<Driver>>(API_ENDPOINTS.DRIVERS.BY_ID(id), payload)
      .then((r) => r.data),

  toggleActive: (id: number) =>
    apiClient
      .patch<ApiResponse<ToggleDriverActiveResponse>>(
        API_ENDPOINTS.DRIVERS.TOGGLE_ACTIVE(id),
      )
      .then((r) => r.data),

  assignToVehicle: (id: number, payload: AssignDriverToVehiclePayload) =>
    apiClient
      .post<ApiResponse<Driver>>(API_ENDPOINTS.DRIVERS.ASSIGN(id), payload)
      .then((r) => r.data),

  releaseFromVehicle: (id: number) =>
    apiClient
      .patch<ApiResponse<Driver>>(API_ENDPOINTS.DRIVERS.RELEASE(id))
      .then((r) => r.data),

  getAssignmentHistory: (id: number) =>
    apiClient
      .get<ApiResponse<DriverAssignment[]>>(API_ENDPOINTS.DRIVERS.ASSIGNMENTS(id))
      .then((r) => r.data),

  // Ketersediaan driver pada rentang tanggal/waktu (untuk pemilihan saat create booking)
  getAvailability: (params: DriverAvailabilityParams) =>
    apiClient
      .get<ApiResponse<DriverWithAvailability[]>>(
        API_ENDPOINTS.DRIVERS.AVAILABILITY,
        { params },
      )
      .then((r) => r.data),
}

// ─────────────────────────────────────────
// FUEL TYPES SERVICE (master data /fuel-types)
// ─────────────────────────────────────────

import { apiClient } from '@/lib'
import { API_ENDPOINTS } from '@/constants'
import type {
  ApiResponse,
  FuelTypeMaster,
  CreateFuelTypePayload,
} from '@/types'

export const fuelTypeApi = {
  getAll: () =>
    apiClient
      .get<ApiResponse<FuelTypeMaster[]>>(API_ENDPOINTS.FUEL_TYPES.BASE)
      .then((r) => r.data),

  create: (payload: CreateFuelTypePayload) =>
    apiClient
      .post<ApiResponse<FuelTypeMaster>>(API_ENDPOINTS.FUEL_TYPES.BASE, payload)
      .then((r) => r.data),

  update: (id: number, payload: CreateFuelTypePayload) =>
    apiClient
      .put<ApiResponse<FuelTypeMaster>>(API_ENDPOINTS.FUEL_TYPES.BY_ID(id), payload)
      .then((r) => r.data),

  delete: (id: number) =>
    apiClient
      .delete<ApiResponse<null>>(API_ENDPOINTS.FUEL_TYPES.BY_ID(id))
      .then((r) => r.data),
}

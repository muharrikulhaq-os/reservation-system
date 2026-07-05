// ─────────────────────────────────────────
// FUEL EXPENSE SERVICE (unified — multipart)
// ─────────────────────────────────────────

import { apiClient } from '@/lib'
import { API_ENDPOINTS } from '@/constants'
import type {
  ApiResponse,
  PaginatedResponse,
  FuelExpense,
  FuelExpenseQueryParams,
  CreateFuelPayload,
} from '@/types'

export const fuelApi = {
  getAll: (params?: FuelExpenseQueryParams) =>
    apiClient
      .get<PaginatedResponse<FuelExpense>>(API_ENDPOINTS.FUEL.BASE, { params })
      .then((r) => r.data),

  getById: (id: number) =>
    apiClient
      .get<ApiResponse<FuelExpense>>(API_ENDPOINTS.FUEL.BY_ID(id))
      .then((r) => r.data),

  create: (payload: CreateFuelPayload) => {
    const fd = new FormData()
    fd.append('vehicleId', String(payload.vehicleId))
    if (payload.bookingId) fd.append('bookingId', String(payload.bookingId))
    fd.append('fuelType', payload.fuelType)
    fd.append('fuelGrade', payload.fuelGrade)
    if (payload.liter != null) fd.append('liter', String(payload.liter))
    if (payload.pricePerLiter != null) fd.append('pricePerLiter', String(payload.pricePerLiter))
    if (payload.kwh != null) fd.append('kwh', String(payload.kwh))
    if (payload.pricePerKwh != null) fd.append('pricePerKwh', String(payload.pricePerKwh))
    fd.append('odometerBefore', String(payload.odometerBefore))
    fd.append('odometerAfter', String(payload.odometerAfter))
    fd.append('proofPhoto', payload.proofPhoto)
    if (payload.note) fd.append('note', payload.note)
    return apiClient
      .post<ApiResponse<FuelExpense>>(API_ENDPOINTS.FUEL.BASE, fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .then((r) => r.data)
  },

  delete: (id: number) =>
    apiClient
      .delete<ApiResponse<null>>(API_ENDPOINTS.FUEL.BY_ID(id))
      .then((r) => r.data),
}

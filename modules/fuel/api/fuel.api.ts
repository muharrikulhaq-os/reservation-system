// ─────────────────────────────────────────
// FUEL EXPENSE SERVICE (sesuai API contract)
// ─────────────────────────────────────────

import { apiClient } from '@/lib'
import { API_ENDPOINTS } from '@/constants'
import type {
  ApiResponse,
  PaginatedResponse,
  FuelExpense,
  FuelExpenseParams,
  CreateFuelPayload,
} from '@/types'

export const fuelApi = {
  getAll: (params?: FuelExpenseParams) =>
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
    fd.append('fuelTypeId', String(payload.fuelTypeId))
    if (payload.fuelGrade) fd.append('fuelGrade', payload.fuelGrade)
    if (payload.liter != null) fd.append('liter', String(payload.liter))
    if (payload.pricePerLiter != null) fd.append('pricePerLiter', String(payload.pricePerLiter))
    if (payload.kwh != null) fd.append('kwh', String(payload.kwh))
    if (payload.pricePerKwh != null) fd.append('pricePerKwh', String(payload.pricePerKwh))
    if (payload.odometerBefore != null) fd.append('odometerBefore', String(payload.odometerBefore))
    if (payload.odometerAfter != null) fd.append('odometerAfter', String(payload.odometerAfter))
    if (payload.note) fd.append('note', payload.note)
    fd.append('proofPhoto', payload.proofPhoto)
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

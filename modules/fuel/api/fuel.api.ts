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
    if (payload.meterStartKwh != null) fd.append('meterStartKwh', String(payload.meterStartKwh))
    if (payload.meterEndKwh != null) fd.append('meterEndKwh', String(payload.meterEndKwh))
    if (payload.batteryBefore != null) fd.append('batteryBefore', String(payload.batteryBefore))
    if (payload.batteryAfter != null) fd.append('batteryAfter', String(payload.batteryAfter))
    fd.append('odometer', String(payload.odometer))
    if (payload.stationId) fd.append('stationId', String(payload.stationId))
    if (payload.stationName) fd.append('stationName', payload.stationName)
    if (payload.reason) fd.append('reason', payload.reason)
    if (payload.note) fd.append('note', payload.note)
    fd.append('proofPhoto', payload.proofPhoto)
    return apiClient
      .post<ApiResponse<FuelExpense>>(API_ENDPOINTS.FUEL.BASE, fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .then((r) => r.data)
  },

  // Pembatalan (pengganti hapus): data tetap ada, liter kembali ke saldo.
  void: (id: number, reason: string, odometerTypo = false) =>
    apiClient
      .patch<ApiResponse<null>>(API_ENDPOINTS.FUEL.VOID(id), { reason, odometerTypo })
      .then((r) => r.data),
}

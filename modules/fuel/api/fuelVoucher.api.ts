// ─────────────────────────────────────────
// SALDO BBM, SPBU MITRA, VOUCHER BBM
// (rancangan: booking-system-api docs/RANCANGAN_VOUCHER_BBM.md)
// ─────────────────────────────────────────

import { apiClient } from '@/lib'
import { API_ENDPOINTS } from '@/constants'
import type {
  ApiResponse,
  PaginatedResponse,
  FuelAdjustmentPayload,
  FuelLedgerEntry,
  FuelProfilePayload,
  FuelStation,
  FuelStationPayload,
  FuelVoucher,
  FuelVoucherParams,
  FuelVoucherPayload,
  FuelVoucherPreview,
  FuelVoucherSummary,
  VehicleFuelBalance,
} from '@/types'

export type FuelVoucherListResponse = PaginatedResponse<FuelVoucher> & {
  summary: FuelVoucherSummary[] | null
}

export const fuelBalanceApi = {
  getAll: () =>
    apiClient
      .get<ApiResponse<VehicleFuelBalance[]>>(API_ENDPOINTS.FUEL_BALANCES.BASE)
      .then((r) => r.data),

  getByVehicle: (vehicleId: number) =>
    apiClient
      .get<ApiResponse<VehicleFuelBalance>>(API_ENDPOINTS.FUEL_BALANCES.BY_VEHICLE(vehicleId))
      .then((r) => r.data),

  getLedger: (vehicleId: number, params?: { page?: number; limit?: number; energy?: string }) =>
    apiClient
      .get<PaginatedResponse<FuelLedgerEntry>>(API_ENDPOINTS.FUEL_BALANCES.LEDGER(vehicleId), { params })
      .then((r) => r.data),

  updateProfile: (vehicleId: number, payload: FuelProfilePayload) =>
    apiClient
      .put<ApiResponse<VehicleFuelBalance>>(API_ENDPOINTS.FUEL_BALANCES.PROFILE(vehicleId), payload)
      .then((r) => r.data),

  adjust: (vehicleId: number, payload: FuelAdjustmentPayload) =>
    apiClient
      .post<ApiResponse<VehicleFuelBalance>>(API_ENDPOINTS.FUEL_BALANCES.ADJUSTMENTS(vehicleId), payload)
      .then((r) => r.data),
}

export const fuelStationApi = {
  getAll: (activeOnly = false) =>
    apiClient
      .get<ApiResponse<FuelStation[]>>(API_ENDPOINTS.FUEL_STATIONS.BASE, {
        params: activeOnly ? { active: true } : undefined,
      })
      .then((r) => r.data),

  create: (payload: FuelStationPayload) =>
    apiClient
      .post<ApiResponse<FuelStation>>(API_ENDPOINTS.FUEL_STATIONS.BASE, payload)
      .then((r) => r.data),

  update: (id: number, payload: FuelStationPayload) =>
    apiClient
      .put<ApiResponse<FuelStation>>(API_ENDPOINTS.FUEL_STATIONS.BY_ID(id), payload)
      .then((r) => r.data),

  delete: (id: number) =>
    apiClient
      .delete<ApiResponse<null>>(API_ENDPOINTS.FUEL_STATIONS.BY_ID(id))
      .then((r) => r.data),
}

export const fuelVoucherApi = {
  getAll: (params?: FuelVoucherParams) =>
    apiClient
      .get<FuelVoucherListResponse>(API_ENDPOINTS.FUEL_VOUCHERS.BASE, { params })
      .then((r) => r.data),

  getById: (id: number) =>
    apiClient
      .get<ApiResponse<FuelVoucher>>(API_ENDPOINTS.FUEL_VOUCHERS.BY_ID(id))
      .then((r) => r.data),

  preview: (payload: FuelVoucherPayload) =>
    apiClient
      .post<ApiResponse<FuelVoucherPreview>>(API_ENDPOINTS.FUEL_VOUCHERS.PREVIEW, payload)
      .then((r) => r.data),

  issue: (payload: FuelVoucherPayload) =>
    apiClient
      .post<ApiResponse<FuelVoucher>>(API_ENDPOINTS.FUEL_VOUCHERS.BASE, payload)
      .then((r) => r.data),

  use: (id: number, payload: { odometer?: number; note?: string; receiptPhoto?: File | null }) => {
    const fd = new FormData()
    if (payload.odometer) fd.append('odometer', String(payload.odometer))
    if (payload.note) fd.append('note', payload.note)
    if (payload.receiptPhoto) fd.append('receiptPhoto', payload.receiptPhoto)
    return apiClient
      .patch<ApiResponse<FuelVoucher>>(API_ENDPOINTS.FUEL_VOUCHERS.USE(id), fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .then((r) => r.data)
  },

  cancel: (id: number, reason: string) =>
    apiClient
      .patch<ApiResponse<FuelVoucher>>(API_ENDPOINTS.FUEL_VOUCHERS.CANCEL(id), { reason })
      .then((r) => r.data),

  reconcile: (ids: number[], invoiceNumber: string) =>
    apiClient
      .post<ApiResponse<{ reconciled: number }>>(API_ENDPOINTS.FUEL_VOUCHERS.RECONCILE, { ids, invoiceNumber })
      .then((r) => r.data),
}

// ─────────────────────────────────────────
// FUEL EXPENSE SERVICE
// ─────────────────────────────────────────

import { apiClient } from '@/lib'
import { API_ENDPOINTS } from '@/constants'
import type {
  ApiResponse,
  PaginatedResponse,
  FuelExpense,
  FuelExpenseQueryParams,
  CreateBbmExpensePayload,
  CreateListrikExpensePayload,
} from '@/types'

export const fuelService = {
  getAll: (params?: FuelExpenseQueryParams) =>
    apiClient
      .get<PaginatedResponse<FuelExpense>>(API_ENDPOINTS.FUEL_EXPENSES.BASE, { params })
      .then((r) => r.data),

  getById: (id: number) =>
    apiClient
      .get<ApiResponse<FuelExpense>>(API_ENDPOINTS.FUEL_EXPENSES.BY_ID(id))
      .then((r) => r.data),

  // POST /fuel-expenses/bbm?driverId=1
  createBbm: (driverId: number, payload: CreateBbmExpensePayload) =>
    apiClient
      .post<ApiResponse<FuelExpense>>(
        API_ENDPOINTS.FUEL_EXPENSES.BBM,
        payload,
        { params: { driverId } },
      )
      .then((r) => r.data),

  // POST /fuel-expenses/listrik?driverId=1
  createListrik: (driverId: number, payload: CreateListrikExpensePayload) =>
    apiClient
      .post<ApiResponse<FuelExpense>>(
        API_ENDPOINTS.FUEL_EXPENSES.LISTRIK,
        payload,
        { params: { driverId } },
      )
      .then((r) => r.data),

  delete: (id: number) =>
    apiClient
      .delete<ApiResponse<null>>(API_ENDPOINTS.FUEL_EXPENSES.BY_ID(id))
      .then((r) => r.data),
}

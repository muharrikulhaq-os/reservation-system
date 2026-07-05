// ─────────────────────────────────────────
// MASTER SETTINGS SERVICE
// ─────────────────────────────────────────

import { apiClient } from '@/lib'
import { API_ENDPOINTS } from '@/constants'
import type {
  ApiResponse,
  MasterSetting,
  UpdateSettingPayload,
  FuelPriceSetting,
} from '@/types'

export const settingService = {
  getAll: () =>
    apiClient
      .get<ApiResponse<MasterSetting[]>>(API_ENDPOINTS.MASTER_SETTINGS.BASE)
      .then((r) => r.data),

  getByKey: (key: string) =>
    apiClient
      .get<ApiResponse<MasterSetting>>(API_ENDPOINTS.MASTER_SETTINGS.BY_KEY(key))
      .then((r) => r.data),

  // PUT — create or update
  upsert: (key: string, payload: UpdateSettingPayload) =>
    apiClient
      .put<ApiResponse<MasterSetting>>(
        API_ENDPOINTS.MASTER_SETTINGS.BY_KEY(key),
        payload,
      )
      .then((r) => r.data),

  // --- Fuel prices (harga default per grade) ---
  getFuelPrices: () =>
    apiClient
      .get<ApiResponse<FuelPriceSetting[]>>(API_ENDPOINTS.SETTINGS.FUEL_PRICES)
      .then((r) => r.data),

  upsertFuelPrice: (grade: string, price: number) =>
    apiClient
      .put<ApiResponse<MasterSetting>>(
        API_ENDPOINTS.SETTINGS.BY_KEY(`fuel_price_${grade.toLowerCase()}`),
        { value: String(price) },
      )
      .then((r) => r.data),
}

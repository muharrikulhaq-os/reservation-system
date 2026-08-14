// ─────────────────────────────────────────
// MASTER SETTINGS SERVICE (/settings)
// ─────────────────────────────────────────

import { apiClient } from '@/lib'
import { API_ENDPOINTS } from '@/constants'
import type { ApiResponse, MasterSetting } from '@/types'

export const settingService = {
  getAll: () =>
    apiClient
      .get<ApiResponse<MasterSetting[]>>(API_ENDPOINTS.SETTINGS.BASE)
      .then((r) => r.data),

  getByKey: (key: string) =>
    apiClient
      .get<ApiResponse<MasterSetting>>(API_ENDPOINTS.SETTINGS.BY_KEY(key))
      .then((r) => r.data),

  // PUT - create or update (value sebagai string)
  upsert: (key: string, value: string) =>
    apiClient
      .put<ApiResponse<MasterSetting>>(API_ENDPOINTS.SETTINGS.BY_KEY(key), { value })
      .then((r) => r.data),
}

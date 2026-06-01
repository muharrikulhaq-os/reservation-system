// ─────────────────────────────────────────
// MASTER SETTINGS SERVICE
// ─────────────────────────────────────────

import { apiClient } from '@/lib'
import { API_ENDPOINTS } from '@/constants'
import type {
  ApiResponse,
  MasterSetting,
  UpdateSettingPayload,
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
}

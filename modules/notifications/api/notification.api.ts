// ─────────────────────────────────────────
// NOTIFICATION SERVICE
// ─────────────────────────────────────────

import { apiClient } from '@/lib'
import { API_ENDPOINTS } from '@/constants'
import type {
  ApiResponse,
  PaginatedResponse,
  AppNotification,
  NotificationQueryParams,
  UnreadCountResponse,
  SaveDeviceTokenPayload,
} from '@/types'

export const notificationApi = {
  getAll: (params?: NotificationQueryParams) =>
    apiClient
      .get<PaginatedResponse<AppNotification>>(API_ENDPOINTS.NOTIFICATIONS.BASE, { params })
      .then((r) => r.data),

  getUnreadCount: () =>
    apiClient
      .get<ApiResponse<UnreadCountResponse>>(API_ENDPOINTS.NOTIFICATIONS.UNREAD_COUNT)
      .then((r) => r.data),

  markAsRead: (id: number) =>
    apiClient
      .patch<ApiResponse<null>>(API_ENDPOINTS.NOTIFICATIONS.MARK_READ(id))
      .then((r) => r.data),

  markAllAsRead: () =>
    apiClient
      .patch<ApiResponse<null>>(API_ENDPOINTS.NOTIFICATIONS.MARK_ALL_READ)
      .then((r) => r.data),

  // Dipakai app mobile (FCM push saat app ditutup) - lihat catatan di
  // types/notification.ts. Aman dipanggil dari web juga, backend tidak
  // membedakan, hanya saja web belum punya alur untuk mendapatkan token FCM.
  saveDeviceToken: (payload: SaveDeviceTokenPayload) =>
    apiClient
      .post<ApiResponse<null>>(API_ENDPOINTS.NOTIFICATIONS.DEVICE_TOKENS, payload)
      .then((r) => r.data),

  removeDeviceToken: (token: string) =>
    apiClient
      .delete<ApiResponse<null>>(API_ENDPOINTS.NOTIFICATIONS.DEVICE_TOKENS, { data: { token } })
      .then((r) => r.data),
}

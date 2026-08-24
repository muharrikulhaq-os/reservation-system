// ─────────────────────────────────────────
// NOTIFICATION HOOKS - TanStack Query
// ─────────────────────────────────────────

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { QUERY_KEYS } from '@/constants'
import { notificationApi } from '../api/notification.api'
import type { NotificationQueryParams, SaveDeviceTokenPayload } from '@/types'
import { useAuthStore } from '@/store/auth.store'

export const useNotifications = (params?: NotificationQueryParams) => {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  return useQuery({
    queryKey: [...QUERY_KEYS.NOTIFICATIONS, params],
    queryFn: () => notificationApi.getAll(params),
    enabled: isAuthenticated,
  })
}

// Fallback polling 60 detik - WebSocket (useNotificationSocket) yang
// menjaga ini tetap realtime lewat invalidateQueries, polling cuma jaring
// pengaman kalau koneksi WS putus/reconnect gagal.
export const useUnreadCount = () => {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  return useQuery({
    queryKey: QUERY_KEYS.NOTIFICATIONS_UNREAD_COUNT,
    queryFn: () => notificationApi.getUnreadCount().then((r) => r.data.count),
    enabled: isAuthenticated,
    refetchInterval: 60_000,
  })
}

export const useMarkNotificationAsRead = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => notificationApi.markAsRead(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.NOTIFICATIONS })
      qc.invalidateQueries({ queryKey: QUERY_KEYS.NOTIFICATIONS_UNREAD_COUNT })
    },
  })
}

export const useMarkAllNotificationsAsRead = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () => notificationApi.markAllAsRead(),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.NOTIFICATIONS })
      qc.invalidateQueries({ queryKey: QUERY_KEYS.NOTIFICATIONS_UNREAD_COUNT })
    },
  })
}

// Untuk app mobile (RN) mendaftarkan/menghapus FCM token - lihat catatan
// di types/notification.ts.
export const useSaveDeviceToken = () =>
  useMutation({
    mutationFn: (payload: SaveDeviceTokenPayload) => notificationApi.saveDeviceToken(payload),
  })

export const useRemoveDeviceToken = () =>
  useMutation({
    mutationFn: (token: string) => notificationApi.removeDeviceToken(token),
  })

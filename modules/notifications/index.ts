// ─────────────────────────────────────────
// NOTIFICATIONS MODULE - public API
// import { NotificationsPage, NotificationBell } from '@/modules/notifications'
// ─────────────────────────────────────────

export { NotificationsPage } from './Notifications'
export { NotificationBell } from './components/NotificationBell'
export { NotificationItem } from './components/NotificationItem'
export { notificationApi } from './api/notification.api'
export * from './hooks/useNotifications'
export { useNotificationSocket } from './hooks/useNotificationSocket'

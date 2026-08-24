// ─────────────────────────────────────────
// NOTIFICATION TYPES
// `type` sengaja string bebas (bukan union) - backend menyimpannya sebagai
// kolom teks biasa, bukan enum DB, dan daftar tipe notifikasi terus
// bertambah seiring fitur baru menambahkan pemicu (lihat NOTIFICATION_TYPE
// di constants/notification.ts untuk daftar yang sudah diketahui + fallback
// generik untuk tipe yang belum dikenal frontend).
// ─────────────────────────────────────────

export interface AppNotification {
  id: number
  title: string
  body: string
  type: string
  // Saat ini selalu bookingId (semua notifikasi backend berpusat di booking
  // lifecycle) - null bila tidak terkait entity manapun.
  relatedEntityId: number | null
  isRead: boolean
  createdAt: string
}

export interface NotificationQueryParams {
  page?: number
  limit?: number
}

export interface UnreadCountResponse {
  count: number
}

// POST/DELETE /users/me/device-tokens - dipakai app mobile (FCM) untuk
// menerima push saat app ditutup. Web belum memakai (butuh Firebase Web
// Push + service worker terpisah) - hook & API layer disiapkan agar RN app
// tinggal panggil, tanpa frontend web perlu tahu detailnya.
export interface SaveDeviceTokenPayload {
  token: string
  platform?: 'android' | 'ios' | 'web'
}

// ─────────────────────────────────────────
// WEBSOCKET PUSH PAYLOAD
// Bentuk pesan realtime dari /ws - BEDA dari AppNotification (REST), karena
// backend menulisnya manual sebagai map literal di notification_service.go
// (createAndSend), bukan lewat struct/sqlc.
// ─────────────────────────────────────────

export interface NotificationSocketMessage {
  type: string
  title: string
  message: string // catatan: field body di REST, "message" di sini
  data: {
    notificationId: number
    isRead: boolean
    createdAt: string
    bookingId?: number
    [key: string]: unknown
  }
}

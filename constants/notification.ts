// ─────────────────────────────────────────
// NOTIFICATION TYPE CONFIG
// `type` notifikasi adalah string bebas di backend (bukan enum DB) - daftar
// di bawah adalah SEMUA tipe yang backend kirim saat ini (grep
// `s.notif.Notify/NotifyAdmins/NotifyRoomKeepers` di booking_service.go).
// Tipe baru di backend otomatis jatuh ke DEFAULT_NOTIFICATION_CONFIG, tidak
// perlu update di sini supaya tidak crash - tapi sebaiknya ditambahkan agar
// label & warna lebih pas.
// ─────────────────────────────────────────

export interface NotificationTypeConfig {
  label: string
  icon: string // nama lucide icon, diresolve di komponen (bukan constants - hindari import React di sini)
  color: string
}

export const NOTIFICATION_TYPE_CONFIG: Record<string, NotificationTypeConfig> = {
  BOOKING_CREATED:    { label: 'Booking Baru',        icon: 'Plus',          color: '#0284C7' },
  BOOKING_CANCELLED:  { label: 'Booking Dibatalkan',  icon: 'Ban',           color: '#9CA3AF' },
  BOOKING_APPROVED:   { label: 'Booking Disetujui',   icon: 'Check',         color: '#16A34A' },
  BOOKING_REJECTED:   { label: 'Booking Ditolak',     icon: 'X',             color: '#DC2626' },
  BOOKING_STARTED:    { label: 'Perjalanan Dimulai',  icon: 'Play',          color: '#0284C7' },
  BOOKING_COMPLETED:  { label: 'Booking Selesai',     icon: 'CheckCircle',   color: '#16A34A' },
  BOOKING_SUBSTITUTED:{ label: 'Resource Dialihkan',  icon: 'ArrowRightLeft',color: '#7C3AED' },
  BOOKING_MERGED:     { label: 'Booking Digabung',    icon: 'Merge',         color: '#0284C7' },
  NEW_BOOKING:        { label: 'Penugasan Baru',      icon: 'UserCheck',     color: '#2D2CE8' },
  ROOM_BOOKED:        { label: 'Ruangan Dipesan',     icon: 'Building2',     color: '#0284C7' },
  RETURN_REPORT:      { label: 'Laporan Pengembalian',icon: 'FileCheck',     color: '#0284C7' },
  OVERTIME_RECORDED:  { label: 'Overtime Tercatat',   icon: 'Clock',         color: '#D97706' },
  DRIVER_RATED:       { label: 'Penilaian Diterima',  icon: 'Star',          color: '#D97706' },
} as const

export const DEFAULT_NOTIFICATION_CONFIG: NotificationTypeConfig = {
  label: 'Notifikasi',
  icon: 'Bell',
  color: '#6B7280',
}

export const notificationTypeConfig = (type: string): NotificationTypeConfig =>
  NOTIFICATION_TYPE_CONFIG[type] ?? DEFAULT_NOTIFICATION_CONFIG

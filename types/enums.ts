// ─────────────────────────────────────────
// ENUM TYPES
// ─────────────────────────────────────────

// Role API terbaru: 'USER' lama → 'EMPLOYEE', + 'ROOM_KEEPER' (pengawas ruangan)
export type RoleName = 'ADMIN' | 'EMPLOYEE' | 'DRIVER' | 'ROOM_KEEPER'

export type ResourceType = 'VEHICLE' | 'ROOM'

export type ResourceStatus = 'AVAILABLE' | 'MAINTENANCE' | 'INACTIVE' | 'IN_USE'

export type BookingStatus =
  | 'PENDING'
  | 'APPROVED'
  | 'REJECTED'
  | 'ONGOING'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'OVERDUE'
  | 'EXPIRED'  // APPROVED tapi tidak pernah dimulai sampai endDate lewat
  | 'IGNORED'  // PENDING tapi admin tidak merespons sampai endDate lewat

export type ApprovalAction = 'APPROVED' | 'REJECTED'

// SPD (Surat Perintah Dinas / perjalanan jauh, dinas resmi) vs NON_SPD
// (perjalanan dekat, kena hitungan keterlambatan & lembur). Hanya relevan
// untuk booking VEHICLE - default NON_SPD bila tidak dipilih.
export type BookingType = 'SPD' | 'NON_SPD'

export type FuelType = 'BBM' | 'LISTRIK'

// Aksi yang tercatat di timeline aktivitas booking
export type BookingActivityAction =
  | 'CREATE'
  | 'APPROVE'
  | 'REJECT'
  | 'CANCEL'
  | 'ASSIGN'
  | 'START'
  | 'COMPLETE'
  | 'RATE_DRIVER'
  | 'SUBSTITUTE_RESOURCE'
  | 'MERGE'
  | 'SUBMIT_RETURN_REPORT'
  | 'OVERDUE'
// ─────────────────────────────────────────
// ENUM TYPES
// ─────────────────────────────────────────

// Role API terbaru: 'USER' lama → 'EMPLOYEE', + 'ROOM_KEEPER' (pengawas ruangan)
export type RoleName = 'ADMIN' | 'EMPLOYEE' | 'DRIVER' | 'ROOM_KEEPER'

export type ResourceType = 'VEHICLE' | 'ROOM'

export type ResourceStatus = 'AVAILABLE' | 'MAINTENANCE' | 'INACTIVE'

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
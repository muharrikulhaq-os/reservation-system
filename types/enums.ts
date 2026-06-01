// ─────────────────────────────────────────
// ENUM TYPES
// ⚠ Catatan perubahan dari ERD:
//   - RoleName: ERD pakai 'EMPLOYEE', API pakai 'USER'
// ─────────────────────────────────────────

// API menggunakan 'USER', bukan 'EMPLOYEE' seperti di ERD
export type RoleName = 'ADMIN' | 'USER' | 'DRIVER'

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

export type ApprovalAction = 'APPROVED' | 'REJECTED'

export type FuelType = 'BBM' | 'LISTRIK'
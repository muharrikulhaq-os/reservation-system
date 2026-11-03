// ─────────────────────────────────────────
// BIAYA PERJALANAN (tol, parkir, lainnya)
// Rancangan: booking-system-api docs/RANCANGAN_BIAYA_PERJALANAN.md.
// Dua tingkat fitur dipilih backend (master setting tersembunyi):
// SIMPLE = tol masuk/keluar + nominal + foto; FULL = gerbang, cara bayar,
// reimburse, anggaran tol SPD.
// ─────────────────────────────────────────

export type TripExpenseMode = 'SIMPLE' | 'FULL'
export type TripExpenseCategory = 'TOLL' | 'PARKING' | 'OTHER'
export type TripTollPoint = 'ENTRY' | 'EXIT'
export type TripPaymentMethod = 'COMPANY_EMONEY' | 'PERSONAL'
export type TripReimburseStatus = 'NONE' | 'PENDING' | 'PAID'

export interface TripExpense {
  id: number
  bookingId: number
  vehicle: { id: number | null; plateNumber: string | null }
  driver: { id: number; name: string | null } | null
  category: TripExpenseCategory
  tollPoint: TripTollPoint | null
  entryGate: string | null
  exitGate: string | null
  amount: number
  paymentMethod: TripPaymentMethod | null
  reimburseStatus: TripReimburseStatus
  reimbursedAt: string | null
  proofPhotoUrl: string
  note: string | null
  occurredAt: string
  recordedBy: { id: number; name: string }
  isVoided: boolean
  voidedAt: string | null
  voidedBy: string | null
  voidReason: string | null
  createdAt: string
}

/** Uang parkir perjalanan (docs/RANCANGAN_PARKIR_PENUMPANG.md §2). */
export type ParkingDirection = 'TO_DRIVER' | 'TO_OFFICE' | 'NONE'

export interface ParkingSettlement {
  id: number
  bookingId: number
  driver: { id: number; name: string }
  direction: Exclude<ParkingDirection, 'NONE'>
  amount: number
  allowance: number
  used: number
  reimbursementId: number | null
  settledAt: string
  note: string | null
  createdBy: string
  bookingPurpose: string
  bookingStart: string
}

export interface TripParkingInfo {
  /** Booking utama perjalanan (sama dengan booking ini bila tidak digabung). */
  leadBookingId: number
  allowance: number
  hasAllowance: boolean
  used: number
  count: number
  /** TO_OFFICE = sisa dikembalikan supir, TO_DRIVER = kekurangan diganti ke supir. */
  direction: ParkingDirection
  amount: number
  settlement: ParkingSettlement | null
  canSettle: boolean
}

export interface PendingParkingItem {
  bookingId: number
  purpose: string
  startDate: string
  resourceName: string
  plateNumber: string
  status: string
  allowance: number
  used: number
  count: number
  direction: Exclude<ParkingDirection, 'NONE'>
  amount: number
}

export interface PendingParkingGroup {
  driver: { id: number; name: string }
  toDriver: number
  toOffice: number
  count: number
  items: PendingParkingItem[]
}

export interface SettleParkingPayload {
  driverId: number
  bookingIds: number[]
  settledAt?: string
  note?: string
}

export interface TripExpenseSummary {
  total: number
  count: number
  byCategory: Partial<Record<TripExpenseCategory, number>>
  companyPaid: number
  personalPaid: number
  reimbursePending: number
  reimbursePaid: number
  tollBudget: number | null
  budgetRemaining: number | null
  parking: TripParkingInfo
}

export interface TripExpenseList {
  mode: TripExpenseMode
  items: TripExpense[]
  summary: TripExpenseSummary
}

export interface CreateTripExpensePayload {
  amount: number
  proofPhoto: File
  category?: TripExpenseCategory
  tollPoint?: TripTollPoint
  entryGate?: string
  exitGate?: string
  paymentMethod?: TripPaymentMethod
  note?: string
}

export interface PendingTripReimbursement {
  driver: { id: number; name: string }
  total: number
  count: number
  items: TripExpense[]
}

export interface TripReimbursement {
  id: number
  driver: { id: number; name: string }
  amount: number
  paidAt: string
  note: string | null
  createdBy: string
  expenseCount: number
  /** Perjalanan yang kekurangan parkirnya ikut dibayar di pembayaran ini. */
  parkingCount: number
  createdAt: string
}

export interface PayTripReimbursementPayload {
  driverId: number
  expenseIds: number[]
  paidAt?: string
  note?: string
}

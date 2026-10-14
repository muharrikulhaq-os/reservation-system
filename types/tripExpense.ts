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
  createdAt: string
}

export interface PayTripReimbursementPayload {
  driverId: number
  expenseIds: number[]
  paidAt?: string
  note?: string
}

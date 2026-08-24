// ─────────────────────────────────────────
// BOOKING TYPES
// ─────────────────────────────────────────

import type { Timestamps } from './common'
import type { BookingStatus, ApprovalAction, ResourceType, BookingActivityAction, BookingType } from './enums'
import type { UserSummary } from './auth'
import type { ResourceRef, VehicleSummary } from './resource'
import type { DriverSummary } from './driver'

// --- Booking ---

export interface Booking extends Timestamps {
  id: number
  status: BookingStatus
  bookingType: BookingType
  purpose: string
  user: UserSummary
  resource: ResourceRef
  startDate: string
  endDate: string
  approvedBy: Pick<UserSummary, 'id' | 'name'> | null
  approvedAt: string | null
  assignedAt: string | null
  returnedAt: string | null
  assignedDriver: DriverSummary | null
  assignedVehicle: VehicleSummary | null
  // Pengalihan resource oleh admin saat approve
  isReassigned?: boolean
  originalResource?: OriginalResource | null
  // true jika driver yang dipilih sudah punya booking lain → kandidat merge
  hasMergeSuggestion?: boolean
  // Info penggabungan (dari list booking):
  isMerged?: boolean
  mergedIntoId?: number | null // booking ini digabung KE booking mana (sekunder)
  mergeCount?: number          // jumlah booking yang digabung ke booking ini (main/primary)
}

// --- Resource Substitution ---

export interface OriginalResource {
  id: number
  name: string
  type: ResourceType
}

export interface SubstituteResourcePayload {
  resourceId: number
  note?: string
}

// --- Booking Merge ---

export interface LinkedBooking {
  bookingId: number
  userId: number
  userName: string
  employeeId: string
  department: string
  purpose: string
}

export interface BookingMergeInfo {
  mergeId: number
  primaryBookingId: number
  mergedBookingId: number
  isPrimary: boolean
  mergedBy: string
  reason: string | null
  createdAt: string
  linkedBooking: LinkedBooking
}

export interface BookingMergeResponse {
  mergeId: number
  primaryBookingId: number
  mergedBookingId: number
  mergedBy: number
  reason: string | null
  effectiveStartDate: string
  effectiveEndDate: string
  createdAt: string
}

export interface MergeBookingPayload {
  targetBookingId: number
  reason: string // WAJIB - alasan penggabungan
  startDate?: string
  endDate?: string
}

// --- Return Report (laporan pengembalian kendaraan) ---

export interface ReturnReportPhoto {
  id: number
  filePath: string
  fileName: string
  fileType: string
}

export interface ReturnReport {
  id: number
  bookingId: number
  submittedBy: {
    id: number
    name: string
  }
  note: string
  location: string
  submittedAt: string
  photos: ReturnReportPhoto[]
}

export interface SubmitReturnReportPayload {
  note: string
  location: string
  photos?: File[] // multipart
}

// --- Booking Activity Timeline ---

export interface BookingActivity {
  id: number
  action: BookingActivityAction
  description: string | null
  actor: string | null
  createdAt: string
}

// --- Approval Log ---

/** @deprecated Digantikan oleh {@link BookingActivity} + endpoint /activity. */
export interface ApprovalLog {
  id: number
  bookingId: number
  action: ApprovalAction
  note: string | null
  actionBy: Pick<UserSummary, 'id' | 'name'>
  actionAt: string
}

// --- Guest Booking ---

export interface GuestBooking {
  id: number
  guestName: string
  guestEmail: string
  status: BookingStatus
  resource: Pick<ResourceRef, 'id' | 'name' | 'type'>
  startDate: string
  endDate: string
  approvedBy: string | null  // nama string, bukan objek
  approvedAt: string | null
  rejectionNote: string | null
  returnedAt: string | null
  createdAt: string
}

// Shape saat buat guest booking (response include accessToken)
export interface GuestBookingCreated extends GuestBooking {
  accessToken: string
}

// --- Query Params ---

export interface BookingQueryParams {
  page?: number
  limit?: number
  userId?: number
  status?: BookingStatus
  resourceId?: number
  resourceType?: ResourceType
  driverId?: number
  startDate?: string // RFC3339
  endDate?: string
}

export interface GuestBookingQueryParams {
  page?: number
  limit?: number
  status?: BookingStatus
}

// --- Payloads ---

export interface CreateBookingPayload {
  resourceId: number
  startDate: string // RFC3339
  endDate: string
  purpose: string
  passengerCount: number // WAJIB - untuk validasi kapasitas
  driverId?: number      // opsional - jika kosong, di-auto-pick / admin assign
  // Opsional, VEHICLE saja - default NON_SPD di backend bila tidak dikirim.
  bookingType?: BookingType
}

export interface ApproveBookingPayload {
  note?: string
}

export interface RejectBookingPayload {
  note: string
}

export interface AssignVehiclePayload {
  driverId: number
  vehicleId: number
}

export interface RateDriverPayload {
  rating: 1 | 2 | 3 | 4 | 5
  review?: string
}

export interface CreateGuestBookingPayload {
  guestName: string
  guestEmail: string
  guestPhone: string
  departmentName: string
  resourceId: number
  startDate: string
  endDate: string
  purpose: string
}

// --- Partial responses dari action endpoints ---

export interface BookingStatusResponse {
  id: number
  status: BookingStatus
}

export interface DriverRatingResponse {
  id: number
  bookingId: number
  driverId: number
  rating: number
  review: string | null
  createdAt: string
}

export interface DriverRatingSummary {
  id: number
  bookingId: number
  rating: 1 | 2 | 3 | 4 | 5
  review: string | null
  reviewerName: string
  createdAt: string
}
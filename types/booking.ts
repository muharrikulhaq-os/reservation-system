// ─────────────────────────────────────────
// BOOKING TYPES
// ─────────────────────────────────────────

import type { Timestamps } from './common'
import type { BookingStatus, ApprovalAction, ResourceType } from './enums'
import type { UserSummary } from './auth'
import type { ResourceRef, VehicleSummary } from './resource'
import type { DriverSummary } from './driver'

// --- Booking ---

export interface Booking extends Timestamps {
  id: number
  status: BookingStatus
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
}

// --- Approval Log ---

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
// ─────────────────────────────────────────
// GUEST BOOKING SERVICE
// ─────────────────────────────────────────

import { apiClient } from '@/lib'
import { API_ENDPOINTS } from '@/constants'
import type {
  ApiResponse,
  PaginatedResponse,
  GuestBooking,
  GuestBookingCreated,
  GuestBookingQueryParams,
  CreateGuestBookingPayload,
  RejectBookingPayload,
} from '@/types'

export const guestBookingService = {
  // ── Public (no auth) ─────────────────

  create: (payload: CreateGuestBookingPayload) =>
    apiClient
      .post<ApiResponse<GuestBookingCreated>>(
        API_ENDPOINTS.GUEST_BOOKINGS.BASE,
        payload,
      )
      .then((r) => r.data),

  getByToken: (token: string) =>
    apiClient
      .get<ApiResponse<GuestBooking>>(API_ENDPOINTS.GUEST_BOOKINGS.BY_TOKEN(token))
      .then((r) => r.data),

  completeByToken: (token: string) =>
    apiClient
      .patch<ApiResponse<GuestBooking>>(API_ENDPOINTS.GUEST_BOOKINGS.COMPLETE(token))
      .then((r) => r.data),

  cancelByToken: (token: string) =>
    apiClient
      .patch<ApiResponse<GuestBooking>>(API_ENDPOINTS.GUEST_BOOKINGS.CANCEL(token))
      .then((r) => r.data),

  // ── Admin ─────────────────────────────

  getAll: (params?: GuestBookingQueryParams) =>
    apiClient
      .get<PaginatedResponse<GuestBooking>>(
        API_ENDPOINTS.GUEST_BOOKINGS.BASE,
        { params },
      )
      .then((r) => r.data),

  approve: (id: number) =>
    apiClient
      .post<ApiResponse<GuestBooking>>(API_ENDPOINTS.GUEST_BOOKINGS.APPROVE(id))
      .then((r) => r.data),

  reject: (id: number, payload: RejectBookingPayload) =>
    apiClient
      .post<ApiResponse<GuestBooking>>(
        API_ENDPOINTS.GUEST_BOOKINGS.REJECT(id),
        payload,
      )
      .then((r) => r.data),

  start: (id: number) =>
    apiClient
      .patch<ApiResponse<GuestBooking>>(API_ENDPOINTS.GUEST_BOOKINGS.START(id))
      .then((r) => r.data),
}

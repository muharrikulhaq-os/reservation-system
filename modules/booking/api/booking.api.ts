// ─────────────────────────────────────────
// BOOKING SERVICE
// ─────────────────────────────────────────

import { apiClient } from '@/lib'
import { API_ENDPOINTS } from '@/constants'
import type {
  ApiResponse,
  PaginatedResponse,
  Booking,
  ApprovalLog,
  Attachment,
  BookingStatusResponse,
  DriverRatingResponse,
  DriverRatingsResult,
  BookingQueryParams,
  CreateBookingPayload,
  ApproveBookingPayload,
  RejectBookingPayload,
  AssignVehiclePayload,
  RateDriverPayload,
  CreateAttachmentPayload,
  SubstituteResourcePayload,
  MergeBookingPayload,
  BookingMergeResponse,
  BookingMergeInfo,
  BookingActivity,
  ReturnReport,
  SubmitReturnReportPayload,
} from '@/types'

export const bookingService = {
  // ── Core CRUD ────────────────────────

  getAll: (params?: BookingQueryParams) =>
    apiClient
      .get<PaginatedResponse<Booking>>(API_ENDPOINTS.BOOKINGS.BASE, { params })
      .then((r) => r.data),

  getById: (id: number) =>
    apiClient
      .get<ApiResponse<Booking>>(API_ENDPOINTS.BOOKINGS.BY_ID(id))
      .then((r) => r.data),

  create: (payload: CreateBookingPayload) =>
    apiClient
      .post<ApiResponse<Booking>>(API_ENDPOINTS.BOOKINGS.BASE, payload)
      .then((r) => r.data),

  // ── Status Transitions ────────────────

  cancel: (id: number) =>
    apiClient
      .patch<ApiResponse<BookingStatusResponse>>(API_ENDPOINTS.BOOKINGS.CANCEL(id))
      .then((r) => r.data),

  approve: (id: number, payload?: ApproveBookingPayload) =>
    apiClient
      .post<ApiResponse<Booking>>(API_ENDPOINTS.BOOKINGS.APPROVE(id), payload)
      .then((r) => r.data),

  reject: (id: number, payload: RejectBookingPayload) =>
    apiClient
      .post<ApiResponse<Booking>>(API_ENDPOINTS.BOOKINGS.REJECT(id), payload)
      .then((r) => r.data),

  assignVehicle: (id: number, payload: AssignVehiclePayload) =>
    apiClient
      .post<ApiResponse<Booking>>(API_ENDPOINTS.BOOKINGS.ASSIGN_VEHICLE(id), payload)
      .then((r) => r.data),

  start: (id: number) =>
    apiClient
      .patch<ApiResponse<Booking>>(API_ENDPOINTS.BOOKINGS.START(id))
      .then((r) => r.data),

  complete: (id: number) =>
    apiClient
      .patch<ApiResponse<Booking>>(API_ENDPOINTS.BOOKINGS.COMPLETE(id))
      .then((r) => r.data),

  // ── Driver Rating ─────────────────────

  rateDriver: (bookingId: number, payload: RateDriverPayload) =>
    apiClient
      .post<ApiResponse<DriverRatingResponse>>(
        API_ENDPOINTS.BOOKINGS.RATE_DRIVER(bookingId),
        payload,
      )
      .then((r) => r.data),

  // Rating milik satu booking (404 bila belum dinilai)
  getBookingRating: (bookingId: number) =>
    apiClient
      .get<ApiResponse<DriverRatingResponse>>(
        API_ENDPOINTS.BOOKINGS.DRIVER_RATING_BY_BOOKING(bookingId),
      )
      .then((r) => r.data),

  getDriverRatings: (driverId: number) =>
    apiClient
      .get<ApiResponse<DriverRatingsResult>>(
        API_ENDPOINTS.BOOKINGS.DRIVER_RATINGS(driverId),
      )
      .then((r) => r.data),

  // ── Resource Substitution & Merge ─────

  substituteResource: (id: number, payload: SubstituteResourcePayload) =>
    apiClient
      .patch<ApiResponse<Booking>>(API_ENDPOINTS.BOOKINGS.SUBSTITUTE_RESOURCE(id), payload)
      .then((r) => r.data),

  merge: (id: number, payload: MergeBookingPayload) =>
    apiClient
      .post<ApiResponse<BookingMergeResponse>>(API_ENDPOINTS.BOOKINGS.MERGE(id), payload)
      .then((r) => r.data),

  getMergeInfo: (id: number) =>
    apiClient
      .get<ApiResponse<BookingMergeInfo[]>>(API_ENDPOINTS.BOOKINGS.MERGE_INFO(id))
      .then((r) => r.data),

  // ── Activity Timeline ─────────────────

  getActivity: (id: number) =>
    apiClient
      .get<ApiResponse<BookingActivity[]>>(API_ENDPOINTS.BOOKINGS.ACTIVITY(id))
      .then((r) => r.data),

  // ── Approval Log (deprecated → getActivity) ──

  /** @deprecated Gunakan {@link bookingService.getActivity}. */
  getApprovalLog: (id: number) =>
    apiClient
      .get<ApiResponse<ApprovalLog[]>>(API_ENDPOINTS.BOOKINGS.APPROVAL_LOG(id))
      .then((r) => r.data),

  // ── Return Report ─────────────────────

  getReturnReport: (bookingId: number) =>
    apiClient
      .get<ApiResponse<ReturnReport>>(API_ENDPOINTS.BOOKINGS.RETURN_REPORT(bookingId))
      .then((r) => r.data),

  submitReturnReport: (bookingId: number, payload: SubmitReturnReportPayload) => {
    const form = new FormData()
    form.append('note', payload.note)
    form.append('location', payload.location)
    if (payload.photos) {
      payload.photos.forEach((photo) => form.append('photos[]', photo))
    }
    return apiClient
      .post<ApiResponse<ReturnReport>>(
        API_ENDPOINTS.BOOKINGS.RETURN_REPORT(bookingId),
        form,
        { headers: { 'Content-Type': 'multipart/form-data' } },
      )
      .then((r) => r.data)
  },

  // ── Attachments ───────────────────────

  getAttachments: (bookingId: number) =>
    apiClient
      .get<ApiResponse<Attachment[]>>(API_ENDPOINTS.BOOKINGS.ATTACHMENTS(bookingId))
      .then((r) => r.data),

  uploadAttachment: (bookingId: number, payload: CreateAttachmentPayload) => {
    const form = new FormData()
    form.append('file', payload.file)
    if (payload.description) form.append('description', payload.description)
    return apiClient
      .post<ApiResponse<Attachment>>(
        API_ENDPOINTS.BOOKINGS.ATTACHMENTS(bookingId),
        form,
        { headers: { 'Content-Type': 'multipart/form-data' } },
      )
      .then((r) => r.data)
  },
}

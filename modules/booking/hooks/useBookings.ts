// ─────────────────────────────────────────
// BOOKING HOOKS
// ─────────────────────────────────────────

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { QUERY_KEYS } from '@/constants'
import { bookingService } from '../api/booking.api'
import type {
  BookingQueryParams,
  CreateBookingPayload,
  StartBookingPayload,
  ApproveBookingPayload,
  RejectBookingPayload,
  AssignVehiclePayload,
  RateDriverPayload,
  CreateAttachmentPayload,
  SubstituteResourcePayload,
  MergeBookingPayload,
  SubmitReturnReportPayload,
} from '@/types'

// ── Queries ──────────────────────────────

// Mengembalikan PaginatedResponse penuh (data + pagination)
// agar halaman list bisa pakai meta pagination.
// `options.enabled` untuk menahan fetch (mis. di kalender
// saat resourceId belum dipilih).
export const useBookings = (
  params?: BookingQueryParams,
  options?: { enabled?: boolean },
) =>
  useQuery({
    queryKey: [...QUERY_KEYS.BOOKINGS, params],
    queryFn:  () => bookingService.getAll(params),
    enabled:  options?.enabled ?? true,
  })

export const useBooking = (id: number) =>
  useQuery({
    queryKey: [...QUERY_KEYS.BOOKINGS, id],
    queryFn:  () => bookingService.getById(id).then((r) => r.data),
    enabled:  !!id,
  })

/** @deprecated Gunakan {@link useBookingActivity}. */
export const useBookingApprovalLog = (bookingId: number) =>
  useQuery({
    queryKey: [...QUERY_KEYS.BOOKINGS, bookingId, 'approval-log'],
    queryFn:  () => bookingService.getApprovalLog(bookingId).then((r) => r.data),
    enabled:  !!bookingId,
  })

export const useBookingActivity = (bookingId: number) =>
  useQuery({
    queryKey: [...QUERY_KEYS.BOOKINGS, bookingId, 'activity'],
    queryFn:  () => bookingService.getActivity(bookingId).then((r) => r.data),
    enabled:  !!bookingId,
  })

export const useBookingMergeInfo = (bookingId: number) =>
  useQuery({
    queryKey: [...QUERY_KEYS.BOOKINGS, bookingId, 'merge-info'],
    queryFn:  () => bookingService.getMergeInfo(bookingId).then((r) => r.data),
    enabled:  !!bookingId,
  })

export const useDriverRatings = (driverId: number) =>
  useQuery({
    queryKey: [...QUERY_KEYS.BOOKINGS, 'driver-ratings', driverId],
    queryFn:  () => bookingService.getDriverRatings(driverId).then((r) => r.data),
    enabled:  !!driverId,
  })

// Rating milik satu booking - 404 = belum dinilai (jangan retry)
export const useBookingDriverRating = (bookingId: number, enabled = true) =>
  useQuery({
    queryKey: [...QUERY_KEYS.BOOKINGS, bookingId, 'driver-rating'],
    queryFn:  () => bookingService.getBookingRating(bookingId).then((r) => r.data),
    enabled:  !!bookingId && enabled,
    retry:    false,
  })

export const useBookingAttachments = (bookingId: number) =>
  useQuery({
    queryKey: [...QUERY_KEYS.BOOKINGS, bookingId, 'attachments'],
    queryFn:  () => bookingService.getAttachments(bookingId).then((r) => r.data),
    enabled:  !!bookingId,
  })

export const useReturnReport = (bookingId: number) =>
  useQuery({
    queryKey: [...QUERY_KEYS.BOOKINGS, bookingId, 'return-report'],
    queryFn:  () => bookingService.getReturnReport(bookingId).then((r) => r.data),
    enabled:  !!bookingId,
    retry:    false, // 404 = belum ada report, jangan retry
  })

// ── Mutations ────────────────────────────

export const useCreateBooking = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateBookingPayload) => bookingService.create(payload),
    onSuccess:  () => qc.invalidateQueries({ queryKey: QUERY_KEYS.BOOKINGS }),
  })
}

export const useCancelBooking = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => bookingService.cancel(id),
    onSuccess:  () => qc.invalidateQueries({ queryKey: QUERY_KEYS.BOOKINGS }),
  })
}

export const useApproveBooking = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload?: ApproveBookingPayload }) =>
      bookingService.approve(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: QUERY_KEYS.BOOKINGS }),
  })
}

export const useRejectBooking = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: RejectBookingPayload }) =>
      bookingService.reject(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: QUERY_KEYS.BOOKINGS }),
  })
}

export const useAssignVehicle = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: AssignVehiclePayload }) =>
      bookingService.assignVehicle(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: QUERY_KEYS.BOOKINGS }),
  })
}

export const useStartBooking = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload?: StartBookingPayload }) =>
      bookingService.start(id, payload),
    onSuccess:  () => qc.invalidateQueries({ queryKey: QUERY_KEYS.BOOKINGS }),
  })
}

export const useCompleteBooking = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => bookingService.complete(id),
    onSuccess:  () => qc.invalidateQueries({ queryKey: QUERY_KEYS.BOOKINGS }),
  })
}

export const useRateDriver = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ bookingId, payload }: { bookingId: number; payload: RateDriverPayload }) =>
      bookingService.rateDriver(bookingId, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: QUERY_KEYS.BOOKINGS }),
  })
}

export const useSubstituteResource = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: SubstituteResourcePayload }) =>
      bookingService.substituteResource(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: QUERY_KEYS.BOOKINGS }),
  })
}

export const useMergeBooking = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: MergeBookingPayload }) =>
      bookingService.merge(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: QUERY_KEYS.BOOKINGS }),
  })
}

export const useSubmitReturnReport = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ bookingId, payload }: { bookingId: number; payload: SubmitReturnReportPayload }) =>
      bookingService.submitReturnReport(bookingId, payload),
    onSuccess: (_, { bookingId }) =>
      qc.invalidateQueries({ queryKey: [...QUERY_KEYS.BOOKINGS, bookingId] }),
  })
}

export const useUploadBookingAttachment = (bookingId: number) => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateAttachmentPayload) =>
      bookingService.uploadAttachment(bookingId, payload),
    onSuccess: () =>
      qc.invalidateQueries({
        queryKey: [...QUERY_KEYS.BOOKINGS, bookingId, 'attachments'],
      }),
  })
}

// ─────────────────────────────────────────
// BOOKING HOOKS
// ─────────────────────────────────────────

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { QUERY_KEYS } from '@/constants'
import { bookingService } from '../api/booking.api'
import type {
  BookingQueryParams,
  CreateBookingPayload,
  ApproveBookingPayload,
  RejectBookingPayload,
  AssignVehiclePayload,
  RateDriverPayload,
  CreateAttachmentPayload,
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

export const useBookingApprovalLog = (bookingId: number) =>
  useQuery({
    queryKey: [...QUERY_KEYS.BOOKINGS, bookingId, 'approval-log'],
    queryFn:  () => bookingService.getApprovalLog(bookingId).then((r) => r.data),
    enabled:  !!bookingId,
  })

export const useDriverRatings = (driverId: number) =>
  useQuery({
    queryKey: [...QUERY_KEYS.BOOKINGS, 'driver-ratings', driverId],
    queryFn:  () => bookingService.getDriverRatings(driverId).then((r) => r.data),
    enabled:  !!driverId,
  })

export const useBookingAttachments = (bookingId: number) =>
  useQuery({
    queryKey: [...QUERY_KEYS.BOOKINGS, bookingId, 'attachments'],
    queryFn:  () => bookingService.getAttachments(bookingId).then((r) => r.data),
    enabled:  !!bookingId,
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
    mutationFn: (id: number) => bookingService.start(id),
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

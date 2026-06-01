// ─────────────────────────────────────────
// GUEST BOOKING HOOKS
// ─────────────────────────────────────────

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { QUERY_KEYS } from '@/constants'
import { guestBookingService } from '@/services'
import type {
  GuestBookingQueryParams,
  CreateGuestBookingPayload,
  RejectBookingPayload,
} from '@/types'

// ── Queries ──────────────────────────────

// Public — untuk halaman track status tamu
export const useGuestBookingByToken = (token: string) =>
  useQuery({
    queryKey: [...QUERY_KEYS.GUEST_BOOKINGS, token],
    queryFn:  () => guestBookingService.getByToken(token).then((r) => r.data),
    enabled:  !!token,
  })

// Admin
export const useGuestBookings = (params?: GuestBookingQueryParams) =>
  useQuery({
    queryKey: [...QUERY_KEYS.GUEST_BOOKINGS, params],
    queryFn:  () => guestBookingService.getAll(params).then((r) => r.data),
  })

// ── Mutations ────────────────────────────

// Public
export const useCreateGuestBooking = () =>
  useMutation({
    mutationFn: (payload: CreateGuestBookingPayload) =>
      guestBookingService.create(payload),
  })

export const useCompleteGuestBookingByToken = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (token: string) => guestBookingService.completeByToken(token),
    onSuccess:  () => qc.invalidateQueries({ queryKey: QUERY_KEYS.GUEST_BOOKINGS }),
  })
}

export const useCancelGuestBookingByToken = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (token: string) => guestBookingService.cancelByToken(token),
    onSuccess:  () => qc.invalidateQueries({ queryKey: QUERY_KEYS.GUEST_BOOKINGS }),
  })
}

// Admin
export const useApproveGuestBooking = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => guestBookingService.approve(id),
    onSuccess:  () => qc.invalidateQueries({ queryKey: QUERY_KEYS.GUEST_BOOKINGS }),
  })
}

export const useRejectGuestBooking = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: RejectBookingPayload }) =>
      guestBookingService.reject(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: QUERY_KEYS.GUEST_BOOKINGS }),
  })
}

export const useStartGuestBooking = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => guestBookingService.start(id),
    onSuccess:  () => qc.invalidateQueries({ queryKey: QUERY_KEYS.GUEST_BOOKINGS }),
  })
}

// ─────────────────────────────────────────
// BIAYA PERJALANAN - hooks
// Key di bawah QUERY_KEYS.BOOKINGS → ikut segar oleh topik DATA_CHANGED
// "booking" (catat/batal/reimburse menyiarkan topik itu). Mode di bawah
// QUERY_KEYS.SETTINGS → ikut segar saat master setting diubah.
// ─────────────────────────────────────────

import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useMutation } from '@/lib/mutation'
import { QUERY_KEYS } from '@/constants'
import type { CreateTripExpensePayload, PayTripReimbursementPayload } from '@/types'
import { tripExpenseService } from '../api/tripExpense.api'

const tripKey = (bookingId: number) => [...QUERY_KEYS.BOOKINGS, bookingId, 'trip-expenses'] as const
const reimburseKey = [...QUERY_KEYS.BOOKINGS, 'trip-reimbursements'] as const

/** SIMPLE (default) / FULL - fitur lengkap disembunyikan sampai diaktifkan. */
export const useTripExpenseMode = () => {
  const { data } = useQuery({
    queryKey: [...QUERY_KEYS.SETTINGS, 'trip-expense-config'],
    queryFn: () => tripExpenseService.getConfig().then((r) => r.data),
    staleTime: 5 * 60_000,
  })
  return data?.mode ?? 'SIMPLE'
}

export const useTripExpenses = (bookingId: number, enabled = true) =>
  useQuery({
    queryKey: tripKey(bookingId),
    queryFn: () => tripExpenseService.listForBooking(bookingId).then((r) => r.data),
    enabled: enabled && !!bookingId,
  })

export const useTollGateSuggestions = (q: string, enabled: boolean) =>
  useQuery({
    queryKey: [...QUERY_KEYS.BOOKINGS, 'toll-gates', q],
    queryFn: () => tripExpenseService.gates(q).then((r) => r.data),
    enabled,
    staleTime: 60_000,
  })

export const useCreateTripExpense = (bookingId: number) => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateTripExpensePayload) => tripExpenseService.create(bookingId, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: tripKey(bookingId) }),
  })
}

export const useVoidTripExpense = (bookingId: number) => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, reason }: { id: number; reason: string }) => tripExpenseService.void(id, reason),
    onSuccess: () => qc.invalidateQueries({ queryKey: tripKey(bookingId) }),
  })
}

export const useSetTollBudget = (bookingId: number) => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (amount: number | null) => tripExpenseService.setTollBudget(bookingId, amount),
    onSuccess: () => qc.invalidateQueries({ queryKey: tripKey(bookingId) }),
  })
}

export const usePendingTripReimbursements = () =>
  useQuery({
    queryKey: [...reimburseKey, 'pending'],
    queryFn: () => tripExpenseService.pendingReimbursements().then((r) => r.data),
  })

export const useTripReimbursements = () =>
  useQuery({
    queryKey: [...reimburseKey, 'history'],
    queryFn: () => tripExpenseService.reimbursements().then((r) => r.data),
  })

export const usePayTripReimbursement = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: PayTripReimbursementPayload) => tripExpenseService.payReimbursement(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: QUERY_KEYS.BOOKINGS }),
  })
}

// ─────────────────────────────────────────
// BIAYA PERJALANAN - call layer
// ─────────────────────────────────────────

import { apiClient } from '@/lib'
import { API_ENDPOINTS } from '@/constants'
import type {
  ApiResponse,
  CreateTripExpensePayload,
  PayTripReimbursementPayload,
  PendingTripReimbursement,
  TripExpense,
  TripExpenseList,
  TripExpenseMode,
  TripReimbursement,
} from '@/types'

export const tripExpenseService = {
  getConfig: () =>
    apiClient
      .get<ApiResponse<{ mode: TripExpenseMode }>>(API_ENDPOINTS.TRIP_EXPENSES.CONFIG)
      .then((r) => r.data),

  listForBooking: (bookingId: number) =>
    apiClient
      .get<ApiResponse<TripExpenseList>>(API_ENDPOINTS.TRIP_EXPENSES.BY_BOOKING(bookingId))
      .then((r) => r.data),

  create: (bookingId: number, payload: CreateTripExpensePayload) => {
    const form = new FormData()
    form.append('amount', String(payload.amount))
    form.append('proofPhoto', payload.proofPhoto)
    const optional: [string, string | undefined][] = [
      ['category', payload.category],
      ['tollPoint', payload.tollPoint],
      ['entryGate', payload.entryGate],
      ['exitGate', payload.exitGate],
      ['paymentMethod', payload.paymentMethod],
      ['note', payload.note],
    ]
    for (const [k, v] of optional) if (v) form.append(k, v)
    return apiClient
      .post<ApiResponse<TripExpense>>(API_ENDPOINTS.TRIP_EXPENSES.BY_BOOKING(bookingId), form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .then((r) => r.data)
  },

  void: (id: number, reason: string) =>
    apiClient
      .patch<ApiResponse<null>>(API_ENDPOINTS.TRIP_EXPENSES.VOID(id), { reason })
      .then((r) => r.data),

  gates: (q: string) =>
    apiClient
      .get<ApiResponse<string[]>>(API_ENDPOINTS.TRIP_EXPENSES.GATES, { params: { q } })
      .then((r) => r.data),

  setTollBudget: (bookingId: number, amount: number | null) =>
    apiClient
      .patch<ApiResponse<{ bookingId: number; tollBudget: number | null }>>(
        API_ENDPOINTS.TRIP_EXPENSES.TOLL_BUDGET(bookingId),
        { amount },
      )
      .then((r) => r.data),

  pendingReimbursements: () =>
    apiClient
      .get<ApiResponse<PendingTripReimbursement[]>>(API_ENDPOINTS.TRIP_REIMBURSEMENTS.PENDING)
      .then((r) => r.data),

  reimbursements: () =>
    apiClient
      .get<ApiResponse<TripReimbursement[]>>(API_ENDPOINTS.TRIP_REIMBURSEMENTS.BASE)
      .then((r) => r.data),

  payReimbursement: (payload: PayTripReimbursementPayload) =>
    apiClient
      .post<ApiResponse<{ id: number; count: number; amount: number }>>(
        API_ENDPOINTS.TRIP_REIMBURSEMENTS.BASE,
        payload,
      )
      .then((r) => r.data),
}

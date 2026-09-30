// ─────────────────────────────────────────
// SALDO BBM, SPBU MITRA, VOUCHER BBM - HOOKS
// Mutasi meng-invalidate key-nya sendiri; menu lain ikut lewat DATA_CHANGED
// (topik fuel + vehicle, lihat constants/sync.ts).
// ─────────────────────────────────────────

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { QUERY_KEYS } from '@/constants'
import { fuelBalanceApi, fuelStationApi, fuelVoucherApi } from '../api/fuelVoucher.api'
import type {
  FuelAdjustmentPayload,
  FuelProfilePayload,
  FuelStationPayload,
  FuelVoucherParams,
  FuelVoucherPayload,
} from '@/types'

const useInvalidateFuel = () => {
  const qc = useQueryClient()
  return () => {
    qc.invalidateQueries({ queryKey: QUERY_KEYS.FUEL_BALANCES })
    qc.invalidateQueries({ queryKey: QUERY_KEYS.FUEL_VOUCHERS })
    qc.invalidateQueries({ queryKey: QUERY_KEYS.FUEL })
    qc.invalidateQueries({ queryKey: QUERY_KEYS.VEHICLES })
  }
}

// ── Saldo ────────────────────────────────

export const useFuelBalances = (enabled = true) =>
  useQuery({
    queryKey: QUERY_KEYS.FUEL_BALANCES,
    queryFn: () => fuelBalanceApi.getAll().then((r) => r.data),
    enabled,
  })

export const useFuelBalance = (vehicleId?: number) =>
  useQuery({
    queryKey: [...QUERY_KEYS.FUEL_BALANCES, vehicleId],
    queryFn: () => fuelBalanceApi.getByVehicle(vehicleId!).then((r) => r.data),
    enabled: !!vehicleId,
  })

export const useFuelLedger = (vehicleId?: number, page = 1, limit = 20) =>
  useQuery({
    queryKey: [...QUERY_KEYS.FUEL_BALANCES, vehicleId, 'ledger', page, limit],
    queryFn: () => fuelBalanceApi.getLedger(vehicleId!, { page, limit }),
    enabled: !!vehicleId,
  })

export const useUpdateFuelProfile = () => {
  const invalidate = useInvalidateFuel()
  return useMutation({
    mutationFn: ({ vehicleId, payload }: { vehicleId: number; payload: FuelProfilePayload }) =>
      fuelBalanceApi.updateProfile(vehicleId, payload),
    onSuccess: invalidate,
  })
}

export const useAdjustFuelBalance = () => {
  const invalidate = useInvalidateFuel()
  return useMutation({
    mutationFn: ({ vehicleId, payload }: { vehicleId: number; payload: FuelAdjustmentPayload }) =>
      fuelBalanceApi.adjust(vehicleId, payload),
    onSuccess: invalidate,
  })
}

// ── SPBU mitra ───────────────────────────

export const useFuelStations = (activeOnly = false) =>
  useQuery({
    queryKey: [...QUERY_KEYS.FUEL_STATIONS, { activeOnly }],
    queryFn: () => fuelStationApi.getAll(activeOnly).then((r) => r.data),
    staleTime: 5 * 60 * 1000,
  })

export const useSaveFuelStation = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id?: number; payload: FuelStationPayload }) =>
      id ? fuelStationApi.update(id, payload) : fuelStationApi.create(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: QUERY_KEYS.FUEL_STATIONS }),
  })
}

export const useDeleteFuelStation = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => fuelStationApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: QUERY_KEYS.FUEL_STATIONS }),
  })
}

// ── Voucher ──────────────────────────────

export const useFuelVouchers = (params?: FuelVoucherParams) =>
  useQuery({
    queryKey: [...QUERY_KEYS.FUEL_VOUCHERS, params],
    queryFn: () => fuelVoucherApi.getAll(params),
  })

export const useFuelVoucher = (id?: number) =>
  useQuery({
    queryKey: [...QUERY_KEYS.FUEL_VOUCHERS, 'detail', id],
    queryFn: () => fuelVoucherApi.getById(id!).then((r) => r.data),
    enabled: !!id,
  })

export const usePreviewFuelVoucher = () =>
  useMutation({
    mutationFn: (payload: FuelVoucherPayload) => fuelVoucherApi.preview(payload).then((r) => r.data),
  })

export const useIssueFuelVoucher = () => {
  const invalidate = useInvalidateFuel()
  return useMutation({
    mutationFn: (payload: FuelVoucherPayload) => fuelVoucherApi.issue(payload).then((r) => r.data),
    onSuccess: invalidate,
  })
}

export const useUseFuelVoucher = () => {
  const invalidate = useInvalidateFuel()
  return useMutation({
    mutationFn: ({ id, ...payload }: { id: number; odometer?: number; note?: string; receiptPhoto?: File | null }) =>
      fuelVoucherApi.use(id, payload),
    onSuccess: invalidate,
  })
}

export const useCancelFuelVoucher = () => {
  const invalidate = useInvalidateFuel()
  return useMutation({
    mutationFn: ({ id, reason }: { id: number; reason: string }) => fuelVoucherApi.cancel(id, reason),
    onSuccess: invalidate,
  })
}

export const useReconcileFuelVouchers = () => {
  const invalidate = useInvalidateFuel()
  return useMutation({
    mutationFn: ({ ids, invoiceNumber }: { ids: number[]; invoiceNumber: string }) =>
      fuelVoucherApi.reconcile(ids, invoiceNumber),
    onSuccess: invalidate,
  })
}

// ─────────────────────────────────────────
// FORMAT KHUSUS BBM
// Nominal voucher TIDAK dibulatkan (keputusan pemilik 2026-10-01), jadi
// pecahan rupiah tetap tampil - beda dengan formatCurrency (0 desimal).
// ─────────────────────────────────────────

import type { FuelFillReason, FuelVoucherStatus } from '@/types'

const rupiahExact = new Intl.NumberFormat('id-ID', {
  style: 'currency',
  currency: 'IDR',
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
})

/** "Rp 484.951,5" - tanpa pembulatan ke rupiah penuh */
export const formatRupiahExact = (n: number): string => rupiahExact.format(n)

const qty = new Intl.NumberFormat('id-ID', { maximumFractionDigits: 2 })

/** "33,33" */
export const formatQty = (n: number | null | undefined): string => (n == null ? '-' : qty.format(n))

export const FUEL_REASON_LABEL: Record<FuelFillReason, string> = {
  SPD: 'SPD',
  LONG_TRIP: 'Perjalanan jauh',
  EMERGENCY: 'Darurat',
  OFFICE: 'Charging kantor',
  OTHER: 'Lainnya',
}

export const VOUCHER_STATUS_CONFIG: Record<FuelVoucherStatus, { label: string; color: string }> = {
  ISSUED: { label: 'Aktif', color: '#2563EB' },
  USED: { label: 'Terpakai', color: '#16A34A' },
  EXPIRED: { label: 'Kedaluwarsa', color: '#D97706' },
  CANCELLED: { label: 'Dibatalkan', color: '#6B7280' },
}

export const LEDGER_TYPE_LABEL: Record<string, string> = {
  OPENING: 'Saldo awal',
  VOUCHER: 'Voucher terbit',
  DIRECT_FILL: 'Isi langsung',
  VOUCHER_RETURN: 'Voucher kembali',
  VOUCHER_REINSTATE: 'Voucher ditandai terpakai',
  VOID: 'Pembatalan',
  ADJUSTMENT: 'Penyesuaian',
}

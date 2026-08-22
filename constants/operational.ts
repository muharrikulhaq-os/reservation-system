// ─────────────────────────────────────────
// OPERATIONAL CONSTANTS
// Energy type & maintenance status
// ─────────────────────────────────────────

import type { EnergyType } from '@/types'

// ── Energy / Fuel ─────────────────────────

export const ENERGY_TYPE = {
  BBM: 'BBM',
  LISTRIK: 'LISTRIK',
} as const

export const ENERGY_TYPE_CONFIG: Record<
  EnergyType,
  { label: string; color: string; unit: string }
> = {
  BBM:     { label: 'BBM',     color: '#D97706', unit: 'Liter' },
  LISTRIK: { label: 'Listrik', color: '#0891B2', unit: 'kWh' },
}

// ── Vehicle energy type (beda dari ENERGY_TYPE di atas - HYBRID cuma
//    berlaku untuk kendaraan, bukan untuk transaksi pengisian) ──

export const VEHICLE_ENERGY_TYPE_OPTIONS: { value: string; label: string }[] = [
  { value: 'BBM',     label: 'BBM' },
  { value: 'LISTRIK', label: 'Listrik' },
  { value: 'HYBRID',  label: 'Hybrid' },
]

// ── Maintenance ───────────────────────────

// type = string bebas (backend contoh: routine, repair)
export const MAINTENANCE_TYPE_OPTIONS = [
  { value: 'routine',     label: 'Servis Rutin' },
  { value: 'repair',      label: 'Perbaikan' },
  { value: 'replacement', label: 'Penggantian' },
  { value: 'body',        label: 'Body & Cat' },
] as const

export const maintenanceTypeLabel = (t: string) =>
  MAINTENANCE_TYPE_OPTIONS.find((o) => o.value === t)?.label ?? t

// status = string (backend: pending, completed)
export const MAINTENANCE_STATUS = {
  PENDING:   'pending',
  COMPLETED: 'completed',
} as const

const STATUS_CFG: Record<string, { label: string; bg: string; text: string; dot: string }> = {
  pending:   { label: 'Berlangsung', bg: '#DBEAFE', text: '#1E40AF', dot: '#0284C7' },
  ongoing:   { label: 'Berlangsung', bg: '#DBEAFE', text: '#1E40AF', dot: '#0284C7' },
  completed: { label: 'Selesai',     bg: '#DCFCE7', text: '#166534', dot: '#16A34A' },
}

// Backend tidak konsisten (seed: ONGOING/COMPLETED, service: pending/completed) → case-insensitive
export const maintenanceStatusCfg = (status: string) =>
  STATUS_CFG[(status ?? '').toLowerCase()] ?? {
    label: status,
    bg: '#F3F4F6',
    text: '#374151',
    dot: '#9CA3AF',
  }

export const isMaintenanceCompleted = (status: string) =>
  (status ?? '').toLowerCase() === 'completed'

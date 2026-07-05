// ─────────────────────────────────────────
// OPERATIONAL CONSTANTS
// Fuel grade, maintenance type & status config
// ─────────────────────────────────────────

import type {
  FuelGrade,
  FuelType,
  MaintenanceType,
  MaintenanceStatus,
} from '@/types'

// ── Fuel ──────────────────────────────────
// FUEL_TYPE ada di constants/booking.ts (jangan duplikat di sini)

export const FUEL_GRADE_CONFIG: Record<
  FuelGrade,
  { label: string; type: FuelType; unit: string; color: string }
> = {
  PERTALITE:      { label: 'Pertalite',      type: 'BBM',     unit: 'Liter', color: '#16A34A' },
  PERTAMAX:       { label: 'Pertamax',       type: 'BBM',     unit: 'Liter', color: '#0284C7' },
  PERTAMAX_TURBO: { label: 'Pertamax Turbo', type: 'BBM',     unit: 'Liter', color: '#DC2626' },
  SOLAR:          { label: 'Solar',          type: 'BBM',     unit: 'Liter', color: '#D97706' },
  DEXLITE:        { label: 'Dexlite',        type: 'BBM',     unit: 'Liter', color: '#7C3AED' },
  PERTAMINA_DEX:  { label: 'Pertamina Dex',  type: 'BBM',     unit: 'Liter', color: '#1E40AF' },
  LISTRIK:        { label: 'Listrik (EV)',   type: 'LISTRIK', unit: 'kWh',   color: '#0891B2' },
}

// Opsi dropdown per tipe bahan bakar
export const BBM_GRADES: FuelGrade[] = [
  'PERTALITE',
  'PERTAMAX',
  'PERTAMAX_TURBO',
  'SOLAR',
  'DEXLITE',
  'PERTAMINA_DEX',
]
export const EV_GRADES: FuelGrade[] = ['LISTRIK']

// ── Maintenance ───────────────────────────

export const MAINTENANCE_STATUS = {
  ONGOING: 'ONGOING',
  COMPLETED: 'COMPLETED',
} as const

export const MAINTENANCE_TYPE = {
  RUTIN: 'RUTIN',
  PERBAIKAN: 'PERBAIKAN',
  PENGGANTIAN: 'PENGGANTIAN',
  BODY: 'BODY',
} as const

export const MAINTENANCE_TYPE_CONFIG: Record<
  MaintenanceType,
  { label: string; color: string }
> = {
  RUTIN:       { label: 'Servis Rutin', color: '#16A34A' },
  PERBAIKAN:   { label: 'Perbaikan',    color: '#D97706' },
  PENGGANTIAN: { label: 'Penggantian',  color: '#0284C7' },
  BODY:        { label: 'Body & Cat',   color: '#7C3AED' },
}

export const MAINTENANCE_STATUS_CONFIG: Record<
  MaintenanceStatus,
  { label: string; bg: string; text: string; dotColor: string }
> = {
  ONGOING:   { label: 'Berlangsung', bg: '#DBEAFE', text: '#1E40AF', dotColor: '#0284C7' },
  COMPLETED: { label: 'Selesai',     bg: '#DCFCE7', text: '#166534', dotColor: '#16A34A' },
}

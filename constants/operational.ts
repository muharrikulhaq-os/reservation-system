// ─────────────────────────────────────────
// OPERATIONAL CONSTANTS
// Energy type & maintenance status
// ─────────────────────────────────────────

import type {
  EnergyType,
  FuelLevel,
  MaintenanceCategory,
  MaintenanceCostBearer,
  MaintenanceDocumentKind,
  MaintenancePdfKind,
  MaintenancePickupMethod,
  MaintenanceStatus,
  VehicleIssueStatus,
  VehicleOwnership,
  VendorType,
} from '@/types'

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

// ── Maintenance (vendor/bengkel luar) ─────
// Alur: DRAFT → SUBMITTED → SCHEDULED → IN_PROGRESS → COMPLETED; CANCELLED
// sebelum kendaraan diserahkan. Lihat booking-system-api
// docs/RANCANGAN_MAINTENANCE_VENDOR.md.

export const MAINTENANCE_STATUS = {
  DRAFT:       'DRAFT',
  SUBMITTED:   'SUBMITTED',
  SCHEDULED:   'SCHEDULED',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED:   'COMPLETED',
  CANCELLED:   'CANCELLED',
} as const satisfies Record<string, MaintenanceStatus>

export const MAINTENANCE_STATUS_CONFIG: Record<
  MaintenanceStatus,
  { label: string; bg: string; text: string; dot: string }
> = {
  DRAFT:       { label: 'Draf',        bg: '#F3F4F6', text: '#374151', dot: '#9CA3AF' },
  SUBMITTED:   { label: 'Diajukan',    bg: '#FEF9C3', text: '#854D0E', dot: '#D97706' },
  SCHEDULED:   { label: 'Dijadwalkan', bg: '#E0E7FF', text: '#3730A3', dot: '#6366F1' },
  IN_PROGRESS: { label: 'Di Vendor',   bg: '#DBEAFE', text: '#1E40AF', dot: '#0284C7' },
  COMPLETED:   { label: 'Selesai',     bg: '#DCFCE7', text: '#166534', dot: '#16A34A' },
  CANCELLED:   { label: 'Dibatalkan',  bg: '#FEE2E2', text: '#991B1B', dot: '#DC2626' },
}

export const maintenanceStatusCfg = (status: string) =>
  MAINTENANCE_STATUS_CONFIG[status as MaintenanceStatus] ?? {
    label: status,
    bg: '#F3F4F6',
    text: '#374151',
    dot: '#9CA3AF',
  }

/** Urutan langkah untuk stepper detail (CANCELLED ditampilkan terpisah). */
export const MAINTENANCE_STEPS: MaintenanceStatus[] = [
  'DRAFT',
  'SUBMITTED',
  'SCHEDULED',
  'IN_PROGRESS',
  'COMPLETED',
]

/** Isian pengajuan masih bisa diubah / dibatalkan. */
export const isMaintenanceEditable = (s: MaintenanceStatus) =>
  s === 'DRAFT' || s === 'SUBMITTED' || s === 'SCHEDULED'

export const isMaintenanceFinal = (s: MaintenanceStatus) =>
  s === 'COMPLETED' || s === 'CANCELLED'

export const MAINTENANCE_CATEGORY_OPTIONS: { value: MaintenanceCategory; label: string }[] = [
  { value: 'ROUTINE', label: 'Servis berkala' },
  { value: 'REPAIR',  label: 'Perbaikan' },
  { value: 'PARTS',   label: 'Ganti part' },
  { value: 'BODY',    label: 'Body / cat' },
  { value: 'OTHER',   label: 'Lainnya' },
]

export const PICKUP_METHOD_OPTIONS: { value: MaintenancePickupMethod; label: string }[] = [
  { value: 'DROP_OFF', label: 'Diantar ke vendor' },
  { value: 'PICKUP',   label: 'Dijemput vendor' },
]

export const COST_BEARER_OPTIONS: { value: MaintenanceCostBearer; label: string }[] = [
  { value: 'COMPANY',   label: 'Perusahaan' },
  { value: 'VENDOR',    label: 'Vendor' },
  { value: 'UNDECIDED', label: 'Belum ditentukan' },
]

export const FUEL_LEVEL_OPTIONS: { value: FuelLevel; label: string }[] = [
  { value: 'E',   label: 'E (kosong)' },
  { value: '1/4', label: '1/4' },
  { value: '1/2', label: '1/2' },
  { value: '3/4', label: '3/4' },
  { value: 'F',   label: 'F (penuh)' },
]

/** Checklist kelengkapan berita acara (key = kontrak backend). */
export const HANDOVER_CHECKLIST: { key: string; label: string }[] = [
  { key: 'stnk',            label: 'STNK' },
  { key: 'mainKey',         label: 'Kunci utama' },
  { key: 'spareKey',        label: 'Kunci cadangan' },
  { key: 'spareTire',       label: 'Ban serep' },
  { key: 'jack',            label: 'Dongkrak & kunci roda' },
  { key: 'warningTriangle', label: 'Segitiga pengaman' },
  { key: 'firstAid',        label: 'Kotak P3K' },
]

export const MAINTENANCE_DOC_KIND_OPTIONS: { value: MaintenanceDocumentKind; label: string }[] = [
  { value: 'INVOICE',         label: 'Invoice / nota vendor' },
  { value: 'SIGNED_REQUEST',  label: 'Scan surat pengajuan (bertanda tangan)' },
  { value: 'SIGNED_HANDOVER', label: 'Scan BA serah terima (bertanda tangan)' },
  { value: 'SIGNED_RETURN',   label: 'Scan BA pengembalian (bertanda tangan)' },
  { value: 'PHOTO',           label: 'Foto' },
  { value: 'OTHER',           label: 'Lainnya' },
]

export const maintenanceDocKindLabel = (k: string) =>
  MAINTENANCE_DOC_KIND_OPTIONS.find((o) => o.value === k)?.label ?? k

export const MAINTENANCE_PDF_LABEL: Record<MaintenancePdfKind, string> = {
  request:  'Surat Pengajuan',
  handover: 'BA Serah Terima',
  return:   'BA Pengembalian',
}

// ── Vendor ────────────────────────────────

export const VENDOR_TYPE_OPTIONS: { value: VendorType; label: string }[] = [
  { value: 'WORKSHOP', label: 'Bengkel rekanan' },
  { value: 'OWNER',    label: 'Pemilik kendaraan sewa' },
  { value: 'BOTH',     label: 'Pemilik & bengkel' },
]

export const VEHICLE_OWNERSHIP_OPTIONS: { value: VehicleOwnership; label: string }[] = [
  { value: 'COMPANY', label: 'Milik perusahaan' },
  { value: 'VENDOR',  label: 'Sewa dari vendor' },
]

// ── Laporan kendala kendaraan ─────────────

export const VEHICLE_ISSUE_STATUS_CONFIG: Record<
  VehicleIssueStatus,
  { label: string; bg: string; text: string; dot: string }
> = {
  OPEN:      { label: 'Menunggu',        bg: '#FEF9C3', text: '#854D0E', dot: '#D97706' },
  CONVERTED: { label: 'Ditindaklanjuti', bg: '#DCFCE7', text: '#166534', dot: '#16A34A' },
  DISMISSED: { label: 'Ditutup',         bg: '#F3F4F6', text: '#374151', dot: '#9CA3AF' },
}

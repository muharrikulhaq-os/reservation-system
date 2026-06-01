// ─────────────────────────────────────────
// BOOKING & RESOURCE CONSTANTS
// ─────────────────────────────────────────

import type {
  BookingStatus,
  ResourceStatus,
  ResourceType,
  RoleName,
  FuelType,
  ApprovalAction,
} from '@/types'

// --- Role ---

export const ROLE = {
  ADMIN:  'ADMIN',
  USER:   'USER',
  DRIVER: 'DRIVER',
} as const satisfies Record<string, RoleName>

// --- Resource Type ---

export const RESOURCE_TYPE = {
  VEHICLE: 'VEHICLE',
  ROOM:    'ROOM',
} as const satisfies Record<string, ResourceType>

// --- Resource Status ---

export const RESOURCE_STATUS = {
  AVAILABLE:   'AVAILABLE',
  MAINTENANCE: 'MAINTENANCE',
  INACTIVE:    'INACTIVE',
} as const satisfies Record<string, ResourceStatus>

// --- Booking Status ---

export const BOOKING_STATUS = {
  PENDING:   'PENDING',
  APPROVED:  'APPROVED',
  REJECTED:  'REJECTED',
  ONGOING:   'ONGOING',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
  OVERDUE:   'OVERDUE',
} as const satisfies Record<string, BookingStatus>

// --- Approval Action ---

export const APPROVAL_ACTION = {
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
} as const satisfies Record<string, ApprovalAction>

// --- Fuel Type ---

export const FUEL_TYPE = {
  BBM:     'BBM',
  LISTRIK: 'LISTRIK',
} as const satisfies Record<string, FuelType>

// --- Booking Status UI Config ---
// Satu tempat untuk warna & label status — pakai di StatusBadge component

export const BOOKING_STATUS_CONFIG = {
  PENDING: {
    label:      'Menunggu',
    bg:         '#FEF9C3',
    text:       '#854D0E',
    dotColor:   '#D97706',
  },
  APPROVED: {
    label:      'Disetujui',
    bg:         '#DCFCE7',
    text:       '#166534',
    dotColor:   '#16A34A',
  },
  REJECTED: {
    label:      'Ditolak',
    bg:         '#FEE2E2',
    text:       '#991B1B',
    dotColor:   '#DC2626',
  },
  ONGOING: {
    label:      'Berlangsung',
    bg:         '#DBEAFE',
    text:       '#1E40AF',
    dotColor:   '#0284C7',
  },
  COMPLETED: {
    label:      'Selesai',
    bg:         '#F0FDF4',
    text:       '#166534',
    dotColor:   '#16A34A',
  },
  CANCELLED: {
    label:      'Dibatalkan',
    bg:         '#F3F4F6',
    text:       '#374151',
    dotColor:   '#9CA3AF',
  },
  OVERDUE: {
    label:      'Terlambat',
    bg:         '#FEF3C7',
    text:       '#92400E',
    dotColor:   '#D97706',
  },
} as const satisfies Record<BookingStatus, {
  label: string
  bg: string
  text: string
  dotColor: string
}>

// --- Resource Status UI Config ---

export const RESOURCE_STATUS_CONFIG = {
  AVAILABLE: {
    label:    'Tersedia',
    bg:       '#DCFCE7',
    text:     '#166534',
  },
  MAINTENANCE: {
    label:    'Perawatan',
    bg:       '#FEF3C7',
    text:     '#92400E',
  },
  INACTIVE: {
    label:    'Tidak Aktif',
    bg:       '#F3F4F6',
    text:     '#374151',
  },
} as const satisfies Record<ResourceStatus, { label: string; bg: string; text: string }>
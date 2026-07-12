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
  BookingActivityAction,
} from '@/types'

// --- Role ---

export const ROLE = {
  ADMIN:       'ADMIN',
  EMPLOYEE:    'EMPLOYEE',
  DRIVER:      'DRIVER',
  ROOM_KEEPER: 'ROOM_KEEPER',
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
  EXPIRED:   'EXPIRED',
  IGNORED:   'IGNORED',
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
  EXPIRED: {
    label:      'Kedaluwarsa',
    bg:         '#F1F5F9',
    text:       '#475569',
    dotColor:   '#64748B',
  },
  IGNORED: {
    label:      'Terabaikan',
    bg:         '#FAFAF9',
    text:       '#57534E',
    dotColor:   '#A8A29E',
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

// --- Booking Activity UI Config ---
// label + nama icon lucide (di-resolve di komponen) + warna dot

export const ACTIVITY_ACTION_CONFIG = {
  CREATE:              { label: 'Booking Dibuat',                icon: 'Plus',           color: '#0284C7' },
  APPROVE:             { label: 'Disetujui',                     icon: 'Check',          color: '#16A34A' },
  REJECT:              { label: 'Ditolak',                       icon: 'X',              color: '#DC2626' },
  CANCEL:              { label: 'Dibatalkan',                    icon: 'Ban',            color: '#9CA3AF' },
  ASSIGN:              { label: 'Driver & Kendaraan Ditugaskan', icon: 'UserCheck',      color: '#2D2CE8' },
  START:               { label: 'Dimulai',                       icon: 'Play',           color: '#0284C7' },
  COMPLETE:            { label: 'Selesai',                       icon: 'CheckCircle',    color: '#16A34A' },
  RATE_DRIVER:         { label: 'Rating Diberikan',              icon: 'Star',           color: '#D97706' },
  SUBSTITUTE_RESOURCE: { label: 'Resource Dialihkan',            icon: 'ArrowRightLeft', color: '#7C3AED' },
  MERGE:               { label: 'Booking Digabungkan',           icon: 'Merge',          color: '#0284C7' },
  SUBMIT_RETURN_REPORT:{ label: 'Laporan Pengembalian Dikirim',  icon: 'FileCheck',      color: '#0284C7' },
} as const satisfies Record<BookingActivityAction, { label: string; icon: string; color: string }>
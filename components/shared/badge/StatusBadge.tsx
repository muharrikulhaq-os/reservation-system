import { Zap } from 'lucide-react'
import { cn } from '@/lib/utils'
import { BOOKING_STATUS_CONFIG, RESOURCE_STATUS_CONFIG } from '@/constants'
import type { BookingStatus, BookingType, ResourceStatus } from '@/types'

// ─────────────────────────────────────────
// BOOKING STATUS BADGE
// ─────────────────────────────────────────

interface BookingStatusBadgeProps {
  status:     BookingStatus
  showDot?:   boolean
  className?: string
}

export const BookingStatusBadge = ({
  status,
  showDot = true,
  className,
}: BookingStatusBadgeProps) => {
  const cfg = BOOKING_STATUS_CONFIG[status]
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5',
        'text-xs font-semibold whitespace-nowrap',
        className,
      )}
      style={{ backgroundColor: cfg.bg, color: cfg.text }}
    >
      {showDot && (
        <span
          className="h-1.5 w-1.5 shrink-0 rounded-full"
          style={{ backgroundColor: cfg.dotColor }}
        />
      )}
      {cfg.label}
    </span>
  )
}

// ─────────────────────────────────────────
// BOOKING TYPE BADGE (SPD / Non-SPD)
// Dipasangkan dengan BookingStatusBadge di mana pun status booking
// ditampilkan (VEHICLE saja - SPD tidak berlaku untuk ruangan, jangan
// dirender untuk booking ruangan di sisi pemanggil). "Digunakan SPD"
// (merah) khusus status ONGOING/APPROVED - itu saat kendaraan & supirnya
// benar-benar terklaim penuh, lihat aturan day-exclusivity SPD di backend.
// ─────────────────────────────────────────

interface BookingTypeBadgeProps {
  bookingType: BookingType
  status: BookingStatus
  className?: string
}

export const BookingTypeBadge = ({ bookingType, status, className }: BookingTypeBadgeProps) => {
  if (bookingType !== 'SPD') {
    return (
      <span
        className={cn(
          'inline-flex items-center rounded-full bg-[var(--bg-subtle)] px-2 py-0.5',
          'text-[10px] font-semibold whitespace-nowrap text-[var(--text-secondary)]',
          className,
        )}
        title="Perjalanan dekat / pemakaian umum"
      >
        Non-SPD
      </span>
    )
  }

  const active = status === 'ONGOING' || status === 'APPROVED'
  return active ? (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full bg-red-50 px-2 py-0.5',
        'text-[10px] font-semibold whitespace-nowrap text-[var(--danger)]',
        className,
      )}
      title="Kendaraan & supir tidak bisa dibooking lain selama SPD ini berlangsung"
    >
      <Zap className="h-2.5 w-2.5" /> Digunakan SPD
    </span>
  ) : (
    <span
      className={cn(
        'inline-flex items-center rounded-full bg-indigo-50 px-2 py-0.5',
        'text-[10px] font-semibold whitespace-nowrap text-indigo-600',
        className,
      )}
      title="Perjalanan jauh / dinas resmi"
    >
      SPD
    </span>
  )
}

// ─────────────────────────────────────────
// SPD ACTIVE BADGE
// Kendaraan sedang terklaim SPD hari ini (hari kalender penuh) - dipasang
// di mana pun kendaraan ditampilkan (list, detail, card, picker), terpisah
// dari BookingTypeBadge yang menandai jenis SATU booking.
// ─────────────────────────────────────────

export const SpdActiveBadge = ({
  className,
  title = 'Kendaraan sedang bertugas SPD hari ini - tidak bisa dibooking',
}: {
  className?: string
  title?: string
}) => (
  <span
    className={cn(
      'inline-flex items-center gap-1 rounded-full bg-red-50 px-2 py-0.5',
      'text-[10px] font-semibold whitespace-nowrap text-[var(--danger)]',
      className,
    )}
    title={title}
  >
    <Zap className="h-2.5 w-2.5" /> Digunakan SPD
  </span>
)

// ─────────────────────────────────────────
// RESOURCE STATUS BADGE
// ─────────────────────────────────────────

interface ResourceStatusBadgeProps {
  status:     ResourceStatus
  className?: string
}

export const ResourceStatusBadge = ({ status, className }: ResourceStatusBadgeProps) => {
  const cfg = RESOURCE_STATUS_CONFIG[status]
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5',
        'text-[10px] font-bold uppercase tracking-wide whitespace-nowrap',
        className,
      )}
      style={{ backgroundColor: cfg.bg, color: cfg.text }}
    >
      {cfg.label}
    </span>
  )
}

// ─────────────────────────────────────────
// GENERIC BADGE
// Untuk keperluan lain (role, custom label)
// ─────────────────────────────────────────

interface BadgeProps {
  children:   React.ReactNode
  variant?:   'default' | 'success' | 'warning' | 'danger' | 'info' | 'muted'
  className?: string
}

const BADGE_VARIANTS = {
  default: { bg: 'var(--primary-light)',  color: 'var(--primary)' },
  success: { bg: '#DCFCE7',               color: '#166534' },
  warning: { bg: '#FEF9C3',               color: '#854D0E' },
  danger:  { bg: '#FEE2E2',               color: '#991B1B' },
  info:    { bg: '#DBEAFE',               color: '#1E40AF' },
  muted:   { bg: 'var(--bg-subtle)',       color: 'var(--text-secondary)' },
}

export const Badge = ({ children, variant = 'default', className }: BadgeProps) => {
  const { bg, color } = BADGE_VARIANTS[variant]
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold',
        className,
      )}
      style={{ backgroundColor: bg, color }}
    >
      {children}
    </span>
  )
}
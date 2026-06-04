import { cn } from '@/lib/utils'
import { BOOKING_STATUS_CONFIG, RESOURCE_STATUS_CONFIG } from '@/constants'
import type { BookingStatus, ResourceStatus } from '@/types'

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
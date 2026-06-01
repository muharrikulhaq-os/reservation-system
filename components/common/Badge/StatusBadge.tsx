import { cn } from '@/lib'
import { BOOKING_STATUS_CONFIG, RESOURCE_STATUS_CONFIG } from '@/constants'
import type { BookingStatus, ResourceStatus } from '@/types'

// ─────────────────────────────────────────
// BOOKING STATUS BADGE
// ─────────────────────────────────────────

interface BookingStatusBadgeProps {
  status: BookingStatus
  className?: string
  showDot?: boolean
}

export const BookingStatusBadge = ({
  status,
  className,
  showDot = true,
}: BookingStatusBadgeProps) => {
  const config = BOOKING_STATUS_CONFIG[status]

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-0.5',
        'rounded-full text-xs font-medium',
        className,
      )}
      style={{ backgroundColor: config.bg, color: config.text }}
    >
      {showDot && (
        <span
          className="h-1.5 w-1.5 rounded-full shrink-0"
          style={{ backgroundColor: config.dotColor }}
        />
      )}
      {config.label}
    </span>
  )
}

// ─────────────────────────────────────────
// RESOURCE STATUS BADGE
// ─────────────────────────────────────────

interface ResourceStatusBadgeProps {
  status: ResourceStatus
  className?: string
}

export const ResourceStatusBadge = ({ status, className }: ResourceStatusBadgeProps) => {
  const config = RESOURCE_STATUS_CONFIG[status]

  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5',
        'rounded-full text-xs font-medium',
        className,
      )}
      style={{ backgroundColor: config.bg, color: config.text }}
    >
      {config.label}
    </span>
  )
}
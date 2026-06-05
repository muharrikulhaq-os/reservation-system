'use client'

import { ResourceStatusBadge } from '@/components/shared/badge/StatusBadge'
import { resolveFileUrl } from '@/lib/utils'
import { cn } from '@/lib/utils'
import type { ResourceStatus } from '@/types'

// ─────────────────────────────────────────
// RESOURCE CARD
// Kartu satu resource di grid katalog.
// Dipakai bersama oleh vehicles & rooms.
// ─────────────────────────────────────────

interface ResourceCardProps {
  name: string
  subtitle: string // "MPV · 7 Penumpang" atau "Lantai 3 · 20 Orang"
  status: ResourceStatus
  photoUrl?: string | null
  icon: React.ReactNode // Car atau Building2 icon
  selected?: boolean
  disabled?: boolean
  onClick?: () => void
  className?: string
}

export const ResourceCard = ({
  name,
  subtitle,
  status,
  photoUrl,
  icon,
  selected = false,
  disabled = false,
  onClick,
  className,
}: ResourceCardProps) => {
  const resolved = resolveFileUrl(photoUrl)

  return (
    <div
      onClick={disabled ? undefined : onClick}
      className={cn(
        'group cursor-pointer rounded-xl border border-[var(--border-card)] bg-[var(--bg-card)] p-4',
        'transition-all hover:shadow-[0_4px_16px_rgba(0,0,0,0.10)]',
        selected &&
          'border-[1.5px] border-[var(--primary)] shadow-[0_0_0_1px_var(--primary-light)]',
        disabled && 'pointer-events-none cursor-not-allowed opacity-50',
        className,
      )}
    >
      {/* Foto area */}
      <div className="relative h-36 w-full overflow-hidden rounded-lg bg-[var(--bg-subtle)]">
        {resolved ? (
          <img
            src={resolved}
            alt={name}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-[var(--text-disabled)] [&>svg]:h-12 [&>svg]:w-12">
            {icon}
          </div>
        )}

        {/* Status badge overlay */}
        <div className="absolute bottom-2 left-2">
          <ResourceStatusBadge status={status} />
        </div>
      </div>

      {/* Info */}
      <div className="mt-3">
        <p className="truncate text-sm font-semibold text-[var(--text-primary)]">
          {name}
        </p>
        <p className="mt-0.5 truncate text-xs text-[var(--text-secondary)]">
          {subtitle}
        </p>
      </div>
    </div>
  )
}

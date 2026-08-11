'use client'

import Link from 'next/link'
import { CalendarDays, Car, Gauge, Users } from 'lucide-react'
import { AdminOnly } from '@/components/common'
import { Badge, ResourceStatusBadge } from '@/components/shared'
import { AppButton } from '@/components/ui-custom'
import { formatOdometer, resolveFileUrl } from '@/lib'
import type { Vehicle } from '@/types'

// ─────────────────────────────────────────
// VEHICLE CARD
// Mode kartu katalog kendaraan — memuat
// seluruh info yang ada di mode baris,
// dengan foto sebagai fokus utama.
// ─────────────────────────────────────────

export const VehicleCard = ({ vehicle }: { vehicle: Vehicle }) => {
  const photo = resolveFileUrl(vehicle.photoUrl)

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-[var(--border-card)] bg-[var(--bg-card)] p-3 shadow-[0_1px_4px_rgba(0,0,0,0.06)] transition-all duration-150 hover:shadow-[0_4px_16px_rgba(0,0,0,0.10)]">

      {/* Foto */}
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-[var(--bg-subtle)]">
        {photo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={photo}
            alt={vehicle.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-[var(--text-disabled)]">
            <Car className="h-10 w-10" />
          </div>
        )}

        <div className="absolute left-2.5 top-2.5">
          <ResourceStatusBadge status={vehicle.status} />
        </div>
      </div>

      {/* Info */}
      <div className="flex flex-1 flex-col px-2 pb-1 pt-4">
        <div className="flex items-start justify-between gap-2">
          <h3
            className="truncate text-base font-bold text-[var(--text-primary)]"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            title={vehicle.name}
          >
            {vehicle.name}
          </h3>
          <Badge variant="muted" className="shrink-0">
            {vehicle.category.name}
          </Badge>
        </div>

        <p className="mt-1 truncate text-sm text-[var(--text-secondary)]">
          {vehicle.plateNumber} · {vehicle.brand} {vehicle.model}
        </p>

        {/* Meta */}
        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-[var(--text-secondary)]">
          <span className="inline-flex items-center gap-1.5">
            <Users className="h-3.5 w-3.5 text-[var(--text-disabled)]" />
            {vehicle.capacity} Penumpang
          </span>
          <span className="inline-flex items-center gap-1.5">
            <CalendarDays className="h-3.5 w-3.5 text-[var(--text-disabled)]" />
            {vehicle.year}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Gauge className="h-3.5 w-3.5 text-[var(--text-disabled)]" />
            {formatOdometer(vehicle.currentOdometer)}
          </span>
        </div>

        {/* Aksi */}
        <div className="mt-auto flex items-center gap-2 border-t border-[var(--border-divider)] pt-3 [&>*]:flex-1">
          <Link href={`/vehicles/${vehicle.id}`}>
            <AppButton variant="secondary" size="sm" fullWidth>
              Detail
            </AppButton>
          </Link>
          <AdminOnly>
            <Link href={`/vehicles/${vehicle.id}/edit`}>
              <AppButton variant="ghost" size="sm" fullWidth>
                Edit
              </AppButton>
            </Link>
          </AdminOnly>
        </div>
      </div>
    </div>
  )
}

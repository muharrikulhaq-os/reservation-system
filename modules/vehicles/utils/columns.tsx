'use client'

import Link from 'next/link'
import { Car, Users } from 'lucide-react'
import { AdminOnly } from '@/components/common'
import { ResourceStatusBadge, Badge } from '@/components/shared'
import { createColumnHelper, type ColumnDef } from '@/components/shared/table/DataTable'
import { SafeImage } from '@/components/shared/media/SafeImage'
import { resolveFileUrl } from '@/lib'
import type { Vehicle } from '@/types'

// ─────────────────────────────────────────
// VEHICLE COLUMNS
// Jembatan antara <DataTable/> dan data Vehicle.
// ─────────────────────────────────────────

const ch = createColumnHelper<Vehicle>()

export const vehicleColumns: ColumnDef<Vehicle, unknown>[] = [
  ch.accessor('name', {
    header: 'Kendaraan',
    cell: ({ row }) => {
      const v = row.original
      const photo = resolveFileUrl(v.photoUrl)
      return (
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-12 shrink-0 items-center justify-center overflow-hidden rounded bg-[var(--bg-subtle)] text-[var(--text-disabled)]">
            <SafeImage
              src={photo}
              alt={v.name}
              className="h-full w-full object-cover"
              fallback={<Car className="h-4 w-4" />}
            />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-[var(--text-primary)]">
              {v.name}
            </span>
            <span className="text-[11px] text-[var(--text-secondary)]">
              {v.plateNumber}
            </span>
          </div>
        </div>
      )
    },
  }),

  ch.accessor('category', {
    header: 'Kategori',
    size: 120,
    cell: ({ getValue }) => <Badge variant="muted">{getValue().name}</Badge>,
  }),

  ch.accessor('capacity', {
    header: 'Kapasitas',
    size: 120,
    cell: ({ getValue }) => (
      <span className="inline-flex items-center gap-1.5 text-sm text-[var(--text-secondary)]">
        <Users className="h-3.5 w-3.5 text-[var(--text-disabled)]" />
        {getValue()} Penumpang
      </span>
    ),
  }),

  ch.accessor('year', {
    header: 'Tahun',
    size: 80,
    cell: ({ getValue }) => (
      <span className="text-sm text-[var(--text-secondary)]">{getValue()}</span>
    ),
  }),

  ch.accessor('status', {
    header: 'Status',
    size: 120,
    cell: ({ getValue }) => <ResourceStatusBadge status={getValue()} />,
  }),

  ch.display({
    id: 'actions',
    size: 120,
    header: '',
    cell: ({ row }) => (
      <div className="flex items-center justify-end gap-3">
        <Link
          href={`/vehicles/${row.original.id}`}
          className="text-xs font-medium text-[var(--primary)] hover:underline"
        >
          Detail
        </Link>
        <AdminOnly>
          <Link
            href={`/vehicles/${row.original.id}/edit`}
            className="text-xs font-medium text-[var(--text-secondary)] hover:underline"
          >
            Edit
          </Link>
        </AdminOnly>
      </div>
    ),
  }),
] as ColumnDef<Vehicle, unknown>[]

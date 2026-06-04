'use client'

import Link from 'next/link'
import { ResourceStatusBadge } from '@/components/shared/badge/StatusBadge'
import { createColumnHelper, type ColumnDef } from '@/components/shared/table/DataTable'
import { formatOdometer } from '@/lib'
import type { Vehicle } from '@/types'

// ─────────────────────────────────────────
// VEHICLE COLUMNS
// Jembatan antara <DataTable/> dan data Vehicle.
// ─────────────────────────────────────────

const ch = createColumnHelper<Vehicle>()

export const vehicleColumns: ColumnDef<Vehicle, unknown>[] = [
  ch.accessor('name', {
    header: 'Kendaraan',
    cell: ({ row }) => (
      <div className="flex flex-col">
        <span className="text-sm font-medium text-[var(--text-primary)]">
          {row.original.name}
        </span>
        <span className="text-[11px] text-[var(--text-disabled)]">
          {row.original.brand} {row.original.model} · {row.original.year}
        </span>
      </div>
    ),
  }),

  ch.accessor('plateNumber', {
    header: 'Plat',
    size: 120,
    cell: ({ getValue }) => (
      <span className="rounded-md bg-[var(--bg-subtle)] px-2 py-0.5 text-xs font-semibold text-[var(--text-primary)]">
        {getValue()}
      </span>
    ),
  }),

  ch.accessor('category', {
    header: 'Kategori',
    size: 120,
    cell: ({ getValue }) => (
      <span className="text-sm text-[var(--text-secondary)]">{getValue().name}</span>
    ),
  }),

  ch.accessor('capacity', {
    header: 'Kapasitas',
    size: 100,
    cell: ({ getValue }) => (
      <span className="text-sm text-[var(--text-secondary)]">{getValue()} org</span>
    ),
  }),

  ch.accessor('currentOdometer', {
    header: 'Odometer',
    size: 120,
    cell: ({ getValue }) => (
      <span className="text-sm text-[var(--text-secondary)]">
        {formatOdometer(getValue())}
      </span>
    ),
  }),

  ch.accessor('status', {
    header: 'Status',
    size: 120,
    cell: ({ getValue }) => <ResourceStatusBadge status={getValue()} />,
  }),

  ch.display({
    id: 'actions',
    size: 60,
    header: '',
    cell: ({ row }) => (
      <Link
        href={`/dashboard/vehicles/${row.original.id}`}
        className="text-xs font-medium text-[var(--primary)] hover:underline"
      >
        Detail
      </Link>
    ),
  }),
] as ColumnDef<Vehicle, unknown>[]

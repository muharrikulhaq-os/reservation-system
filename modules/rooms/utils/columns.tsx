'use client'

import Link from 'next/link'
import { Building2, MapPin, Users } from 'lucide-react'
import { AdminOnly } from '@/components/common'
import { ResourceStatusBadge } from '@/components/shared'
import { createColumnHelper, type ColumnDef } from '@/components/shared/table/DataTable'
import { resolveFileUrl } from '@/lib'
import type { Room } from '@/types'

// ─────────────────────────────────────────
// ROOM COLUMNS
// Jembatan antara <DataTable/> dan data Room.
// ─────────────────────────────────────────

const ch = createColumnHelper<Room>()

export const roomColumns: ColumnDef<Room, unknown>[] = [
  ch.accessor('name', {
    header: 'Ruangan',
    cell: ({ row }) => {
      const r = row.original
      const photo = resolveFileUrl(r.photoUrl)
      return (
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-12 shrink-0 items-center justify-center overflow-hidden rounded bg-[var(--bg-subtle)] text-[var(--text-disabled)]">
            {photo ? (
              <img src={photo} alt={r.name} className="h-full w-full object-cover" />
            ) : (
              <Building2 className="h-4 w-4" />
            )}
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-[var(--text-primary)]">
              {r.name}
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] text-[var(--text-secondary)]">
              <MapPin className="h-3 w-3 text-[var(--text-disabled)]" />
              {r.location}
            </span>
          </div>
        </div>
      )
    },
  }),

  ch.accessor('capacity', {
    header: 'Kapasitas',
    size: 120,
    cell: ({ getValue }) => (
      <span className="inline-flex items-center gap-1.5 text-sm text-[var(--text-secondary)]">
        <Users className="h-3.5 w-3.5 text-[var(--text-disabled)]" />
        {getValue()} Orang
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
    size: 120,
    header: '',
    cell: ({ row }) => (
      <div className="flex items-center justify-end gap-3">
        <Link
          href={`/rooms/${row.original.id}`}
          className="text-xs font-medium text-[var(--primary)] hover:underline"
        >
          Detail
        </Link>
        <AdminOnly>
          <Link
            href={`/rooms/${row.original.id}/edit`}
            className="text-xs font-medium text-[var(--text-secondary)] hover:underline"
          >
            Edit
          </Link>
        </AdminOnly>
      </div>
    ),
  }),
] as ColumnDef<Room, unknown>[]

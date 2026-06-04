'use client'

import Link from 'next/link'
import { UserAvatar } from '@/components/shared/avatar/Avatar'
import { BookingStatusBadge } from '@/components/shared/badge/StatusBadge'
import { createColumnHelper, type ColumnDef } from '@/components/shared/table/DataTable'
import { formatDate } from '@/lib'
import type { Booking } from '@/types'

// ─────────────────────────────────────────
// RECENT BOOKING COLUMNS
// Jembatan antara <DataTable/> dan data Booking.
// ─────────────────────────────────────────

const ch = createColumnHelper<Booking>()

export const recentBookingColumns: ColumnDef<Booking, unknown>[] = [
  ch.accessor('user', {
    header: 'User',
    size: 160,
    cell: ({ getValue }) => {
      const user = getValue()
      return (
        <div className="flex items-center gap-2.5">
          <UserAvatar name={user.name} size="sm" />
          <span className="text-sm font-medium text-[var(--text-primary)]">
            {user.name}
          </span>
        </div>
      )
    },
  }),

  ch.accessor('resource', {
    header: 'Resource',
    cell: ({ getValue }) => (
      <span className="text-sm text-[var(--text-primary)]">{getValue().name}</span>
    ),
  }),

  ch.accessor('startDate', {
    header: 'Tanggal',
    size: 130,
    cell: ({ getValue }) => (
      <span className="text-sm text-[var(--text-secondary)]">
        {formatDate(getValue())}
      </span>
    ),
  }),

  ch.accessor('status', {
    header: 'Status',
    size: 130,
    cell: ({ getValue }) => <BookingStatusBadge status={getValue()} />,
  }),

  ch.display({
    id: 'actions',
    size: 60,
    header: '',
    cell: ({ row }) => (
      <Link
        href={`/dashboard/booking/${row.original.id}`}
        className="text-xs font-medium text-[var(--primary)] hover:underline"
      >
        Detail
      </Link>
    ),
  }),
] as ColumnDef<Booking, unknown>[]

'use client'

import Link from 'next/link'
import { UserAvatar } from '@/components/shared/avatar/Avatar'
import { UserProfileButton } from '@/components/shared/user-profile/UserProfileButton'
import { BookingStatusBadge, BookingTypeBadge } from '@/components/shared/badge/StatusBadge'
import { createColumnHelper, type ColumnDef } from '@/components/shared/table/DataTable'
import { formatDate, formatTimeRange } from '@/lib'
import { RESOURCE_TYPE } from '@/constants'
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
        <UserProfileButton userId={user.id} className="flex items-center gap-2.5">
          <UserAvatar name={user.name} size="sm" />
          <span className="text-sm font-medium text-[var(--text-primary)] hover:underline">
            {user.name}
          </span>
        </UserProfileButton>
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
    // Tanggal mulai + jam mulai–selesai di bawahnya.
    cell: ({ getValue, row }) => (
      <div className="whitespace-nowrap">
        <p className="text-sm text-[var(--text-primary)]">{formatDate(getValue())}</p>
        <p className="text-xs text-[var(--text-secondary)]">
          {formatTimeRange(getValue(), row.original.endDate)}
        </p>
      </div>
    ),
  }),

  ch.accessor('status', {
    header: 'Status',
    size: 150,
    cell: ({ getValue, row }) => {
      const booking = row.original
      return (
        <div className="flex flex-col items-start gap-1">
          <BookingStatusBadge status={getValue()} />
          {booking.resource.type === RESOURCE_TYPE.VEHICLE && (
            <BookingTypeBadge bookingType={booking.bookingType} status={booking.status} />
          )}
        </div>
      )
    },
  }),

  ch.display({
    id: 'actions',
    size: 60,
    header: '',
    cell: ({ row }) => (
      // Tak terlihat: klik baris yang membuka detail (openRowDetail).
      <Link href={`/booking/${row.original.id}`} data-row-open className="sr-only">
        Lihat detail booking #{row.original.id}
      </Link>
    ),
  }),
] as ColumnDef<Booking, unknown>[]

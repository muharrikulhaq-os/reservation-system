'use client'

import Link from 'next/link'
import { useBookings } from '@/modules/booking'
import { DataTable } from '@/components/shared/table/DataTable'
import { recentBookingColumns } from '../utils/columns'
import { useAuthStore } from '@/store/auth.store'

// ─────────────────────────────────────────
// RECENT BOOKINGS
// ─────────────────────────────────────────

export const AvailableBookings = () => {
  const isAdmin = useAuthStore((s) => s.isAdmin())
  const isDriver = useAuthStore((s) => s.isDriver())
  const isRoomKeeper = useAuthStore((s) => s.isRoomKeeper())

  const resourceType = isDriver ? 'VEHICLE' : isRoomKeeper ? 'ROOM' : undefined

  const { data, isLoading } = useBookings({
    limit: 5,
    page: 1,
    status: isAdmin ? 'PENDING' : undefined,
    resourceType,
  })

  return (
    <div className="rounded-xl border border-[var(--border-card)] bg-[var(--bg-card)] p-5 shadow-[var(--shadow-card)]">
      <div className="mb-4 flex items-center justify-between">
        <h2
          className="text-base font-bold text-[var(--text-primary)] font-display"
          style={{ fontFamily: "'Poppins', sans-serif" }}
        >
          {isAdmin ? 'Booking Tersedia' : 'Booking Terbaru'}
        </h2>
        <Link
          href="/booking"
          className="text-sm font-semibold text-[var(--primary)] hover:underline"
        >
          Lihat Semua
        </Link>
      </div>

      <DataTable
        data={data?.data ?? []}
        columns={recentBookingColumns}
        isLoading={isLoading}
        emptyMessage="Belum ada booking"
      />
    </div>
  )
}

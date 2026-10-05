'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useBookings } from '@/modules/booking'
import { DataTable } from '@/components/shared/table/DataTable'
import { BOOKING_STATUS } from '@/constants'
import { cn } from '@/lib/utils'
import type { BookingStatus } from '@/types'
import { recentBookingColumns } from '../utils/columns'
import { useAuthStore } from '@/store/auth.store'

// ─────────────────────────────────────────
// RECENT BOOKINGS
// Admin: "Booking Tersedia" dengan tab status yang perlu ditindaklanjuti.
// Role lain: booking terbaru miliknya / tugasnya.
// ─────────────────────────────────────────

const ADMIN_TABS: { status: BookingStatus; label: string }[] = [
  { status: BOOKING_STATUS.PENDING, label: 'Menunggu' },
  { status: BOOKING_STATUS.ONGOING, label: 'Sedang Berjalan' },
  { status: BOOKING_STATUS.OVERDUE, label: 'Terlambat Dikembalikan' },
  // Laporan pengembalian sudah masuk - tinggal diselesaikan admin.
  { status: BOOKING_STATUS.RETURNED, label: 'Sudah Kembali' },
]

/** Jumlah booking per status (cukup total dari pagination, limit 1). */
const useStatusCount = (status: BookingStatus, enabled: boolean) => {
  const { data } = useBookings({ limit: 1, page: 1, status }, { enabled })
  return enabled ? data?.pagination?.total : undefined
}

export const AvailableBookings = () => {
  const isAdmin = useAuthStore((s) => s.isAdmin())
  const isDriver = useAuthStore((s) => s.isDriver())
  const isRoomKeeper = useAuthStore((s) => s.isRoomKeeper())
  const [status, setStatus] = useState<BookingStatus>(BOOKING_STATUS.PENDING)

  const resourceType = isDriver ? 'VEHICLE' : isRoomKeeper ? 'ROOM' : undefined

  const { data, isLoading } = useBookings({
    limit: 5,
    page: 1,
    status: isAdmin ? status : undefined,
    resourceType,
  })

  const counts = {
    [BOOKING_STATUS.PENDING]: useStatusCount(BOOKING_STATUS.PENDING, isAdmin),
    [BOOKING_STATUS.ONGOING]: useStatusCount(BOOKING_STATUS.ONGOING, isAdmin),
    [BOOKING_STATUS.OVERDUE]: useStatusCount(BOOKING_STATUS.OVERDUE, isAdmin),
    [BOOKING_STATUS.RETURNED]: useStatusCount(BOOKING_STATUS.RETURNED, isAdmin),
  } as Partial<Record<BookingStatus, number>>

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
          href={isAdmin ? `/booking?status=${status}` : '/booking'}
          className="text-sm font-semibold text-[var(--primary)] hover:underline"
        >
          Lihat Semua
        </Link>
      </div>

      {isAdmin && (
        <div role="tablist" aria-label="Filter status booking" className="mb-4 flex flex-wrap gap-2">
          {ADMIN_TABS.map((t) => {
            const active = t.status === status
            const count = counts[t.status]
            return (
              <button
                key={t.status}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setStatus(t.status)}
                className={cn(
                  'inline-flex h-8 items-center gap-1.5 rounded-full border px-3 text-xs font-semibold transition-colors',
                  active
                    ? 'border-[var(--primary)] bg-[var(--primary-light)] text-[var(--primary)]'
                    : 'border-[var(--border-input)] bg-[var(--bg-card)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]',
                )}
              >
                {t.label}
                {count !== undefined && (
                  <span
                    className={cn(
                      'min-w-5 rounded-full px-1.5 py-px text-center text-[11px]',
                      active
                        ? 'bg-[var(--primary)] text-white'
                        : t.status === BOOKING_STATUS.OVERDUE && count > 0
                          ? 'bg-[var(--warning)] text-white'
                          : t.status === BOOKING_STATUS.RETURNED && count > 0
                            ? 'bg-[#0D9488] text-white'
                            : 'bg-[var(--bg-subtle)] text-[var(--text-secondary)]',
                    )}
                  >
                    {count}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      )}

      <DataTable
        data={data?.data ?? []}
        columns={recentBookingColumns}
        isLoading={isLoading}
        emptyMessage={
          isAdmin
            ? `Tidak ada booking ${ADMIN_TABS.find((t) => t.status === status)?.label.toLowerCase()}`
            : 'Belum ada booking'
        }
      />
    </div>
  )
}

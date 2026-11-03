'use client'

import Link from 'next/link'
import { Car } from 'lucide-react'
import { Card, CardHeader } from '@/components/common'
import { BookingStatusBadge } from '@/components/shared'
import { formatDateTime } from '@/lib'
import { usePassengerTrips } from '../hooks/useBookings'

// ─────────────────────────────────────────
// PERJALANAN YANG ANDA IKUTI (Dashboard)
// Booking orang lain yang mengikutkan user ini sebagai penumpang. Tidak
// dihitung sebagai booking user (tetap atas nama pemesan). Kosong → tidak tampil.
// ─────────────────────────────────────────

export const PassengerTripsCard = () => {
  const { data } = usePassengerTrips()
  if (!data || data.length === 0) return null

  return (
    <Card>
      <CardHeader title="Perjalanan yang Anda Ikuti" description="Booking karyawan lain yang mengikutkan Anda" />
      <ul className="divide-y divide-[var(--border-divider)]">
        {data.map((t) => (
          <li key={t.id}>
            <Link
              href={`/booking/${t.id}`}
              className="flex items-center gap-3 rounded-lg px-1 py-2.5 transition-colors first:pt-0 hover:bg-[var(--bg-subtle)]"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--primary-light)] text-[var(--primary)]">
                <Car className="h-4 w-4" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-[var(--text-primary)]">
                  {t.resourceName}
                  {t.plateNumber ? ` · ${t.plateNumber}` : ''}
                </p>
                <p className="truncate text-xs text-[var(--text-secondary)]">
                  {formatDateTime(t.startDate)} · dipesan {t.ownerName}
                  {t.driverName ? ` · supir ${t.driverName}` : ''}
                </p>
              </div>
              <BookingStatusBadge status={t.status} />
            </Link>
          </li>
        ))}
      </ul>
    </Card>
  )
}

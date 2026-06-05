'use client'

import { Suspense } from 'react'
import { PageHeader } from '@/components/shared'
import { BookingForm } from './BookingForm'

// ─────────────────────────────────────────
// BOOKING CREATE — wrapper halaman buat booking
// ─────────────────────────────────────────

export const BookingCreate = () => {
  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <PageHeader
        title="Buat Booking Baru"
        description="Ajukan peminjaman kendaraan atau ruangan"
        backHref="/booking"
      />
      {/* BookingForm pakai useSearchParams → wajib di dalam Suspense */}
      <Suspense fallback={null}>
        <BookingForm />
      </Suspense>
    </div>
  )
}

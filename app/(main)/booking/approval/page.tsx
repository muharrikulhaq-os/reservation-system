import type { Metadata } from 'next'
import { AdminOnly } from '@/components/common'
import { ApprovalQueue } from '@/modules/booking'

export const metadata: Metadata = {
  title: 'Antrean Persetujuan — Reservation System',
}

export default function Page() {
  return (
    <AdminOnly
      fallback={
        <p className="py-16 text-center text-sm text-[var(--text-secondary)]">
          Halaman ini hanya untuk admin.
        </p>
      }
    >
      <ApprovalQueue />
    </AdminOnly>
  )
}

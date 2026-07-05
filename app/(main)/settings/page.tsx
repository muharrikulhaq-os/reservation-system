import type { Metadata } from 'next'
import { AdminOnly } from '@/components/common'
import { Settings } from '@/modules/settings'

export const metadata: Metadata = {
  title: 'Pengaturan — Reservation System',
}

export default function Page() {
  return (
    <AdminOnly>
      <Settings />
    </AdminOnly>
  )
}

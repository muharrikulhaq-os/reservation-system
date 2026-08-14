import type { Metadata } from 'next'
import { Maintenance } from '@/modules/maintenance'

export const metadata: Metadata = {
  title: 'Pemeliharaan - Sistem Reservasi',
}

export default function Page() {
  return <Maintenance />
}

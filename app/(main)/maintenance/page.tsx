import type { Metadata } from 'next'
import { Maintenance } from '@/modules/maintenance'

export const metadata: Metadata = {
  title: 'Pemeliharaan — Reservation System',
}

export default function Page() {
  return <Maintenance />
}

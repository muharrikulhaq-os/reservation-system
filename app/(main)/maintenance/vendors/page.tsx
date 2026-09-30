import type { Metadata } from 'next'
import { Vendors } from '@/modules/maintenance'

export const metadata: Metadata = {
  title: 'Vendor & Bengkel - Sistem Reservasi',
}

export default function Page() {
  return <Vendors />
}

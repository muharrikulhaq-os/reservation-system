import type { Metadata } from 'next'
import { VehicleIssues } from '@/modules/maintenance'

export const metadata: Metadata = {
  title: 'Laporan Kendala Kendaraan - Sistem Reservasi',
}

export default function Page() {
  return <VehicleIssues />
}

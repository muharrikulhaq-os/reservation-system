import type { Metadata } from 'next'
import { VehiclesPage } from '@/modules/vehicles'

export const metadata: Metadata = {
  title: 'Kendaraan — Sistem Reservasi',
}

export default function Page() {
  return <VehiclesPage />
}

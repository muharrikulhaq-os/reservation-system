import type { Metadata } from 'next'
import { VehiclesPage } from '@/modules/vehicles'

export const metadata: Metadata = {
  title: 'Kendaraan — Reservation System',
}

export default function Page() {
  return <VehiclesPage />
}

import type { Metadata } from 'next'
import { VehicleCreate } from '@/modules/vehicles'

export const metadata: Metadata = {
  title: 'Tambah Kendaraan — Reservation System',
}

export default function Page() {
  return <VehicleCreate />
}

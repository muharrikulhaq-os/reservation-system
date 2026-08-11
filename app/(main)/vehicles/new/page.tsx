import type { Metadata } from 'next'
import { VehicleCreate } from '@/modules/vehicles'

export const metadata: Metadata = {
  title: 'Tambah Kendaraan — Sistem Reservasi',
}

export default function Page() {
  return <VehicleCreate />
}

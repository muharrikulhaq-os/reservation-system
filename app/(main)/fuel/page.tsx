import type { Metadata } from 'next'
import { Fuel } from '@/modules/fuel'

export const metadata: Metadata = {
  title: 'Bahan Bakar - Sistem Reservasi',
}

export default function Page() {
  return <Fuel />
}

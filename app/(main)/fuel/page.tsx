import type { Metadata } from 'next'
import { Fuel } from '@/modules/fuel'

export const metadata: Metadata = {
  title: 'Bahan Bakar — Reservation System',
}

export default function Page() {
  return <Fuel />
}

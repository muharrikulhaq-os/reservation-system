import type { Metadata } from 'next'
import { DriversPage } from '@/modules/drivers'

export const metadata: Metadata = {
  title: 'Driver — Reservation System',
}

export default function Page() {
  return <DriversPage />
}

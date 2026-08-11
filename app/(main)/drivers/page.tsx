import type { Metadata } from 'next'
import { DriversPage } from '@/modules/drivers'

export const metadata: Metadata = {
  title: 'Driver — Sistem Reservasi',
}

export default function Page() {
  return <DriversPage />
}

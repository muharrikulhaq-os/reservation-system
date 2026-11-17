import type { Metadata } from 'next'
import { BookingHistory } from '@/modules/booking'

export const metadata: Metadata = {
  title: 'Riwayat Booking - Sistem Reservasi',
}

export default function Page() {
  return <BookingHistory />
}

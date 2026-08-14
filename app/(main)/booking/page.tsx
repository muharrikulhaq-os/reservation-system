import type { Metadata } from 'next'
import { BookingPage } from '@/modules/booking'

export const metadata: Metadata = {
  title: 'Booking - Sistem Reservasi',
}

export default function Page() {
  return <BookingPage />
}

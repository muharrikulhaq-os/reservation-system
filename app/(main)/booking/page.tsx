import type { Metadata } from 'next'
import { BookingPage } from '@/modules/booking'

export const metadata: Metadata = {
  title: 'Booking — Reservation System',
}

export default function Page() {
  return <BookingPage />
}

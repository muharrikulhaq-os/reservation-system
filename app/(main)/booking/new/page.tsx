import type { Metadata } from 'next'
import { BookingCreate } from '@/modules/booking'

export const metadata: Metadata = {
  title: 'Buat Booking — Reservation System',
}

export default function Page() {
  return <BookingCreate />
}

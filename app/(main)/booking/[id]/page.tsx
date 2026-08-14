import type { Metadata } from 'next'
import { BookingDetail } from '@/modules/booking'

export const metadata: Metadata = {
  title: 'Detail Booking - Sistem Reservasi',
}

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  return <BookingDetail bookingId={Number(id)} />
}

import type { Metadata } from 'next'
import { RoomDetail } from '@/modules/rooms'

export const metadata: Metadata = {
  title: 'Detail Ruangan — Reservation System',
}

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  return <RoomDetail roomId={Number(id)} />
}

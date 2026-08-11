import type { Metadata } from 'next'
import { RoomEdit } from '@/modules/rooms'

export const metadata: Metadata = {
  title: 'Edit Ruangan — Sistem Reservasi',
}

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  return <RoomEdit roomId={Number(id)} />
}

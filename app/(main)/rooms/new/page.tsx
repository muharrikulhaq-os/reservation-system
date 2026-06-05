import type { Metadata } from 'next'
import { RoomCreate } from '@/modules/rooms'

export const metadata: Metadata = {
  title: 'Tambah Ruangan — Reservation System',
}

export default function Page() {
  return <RoomCreate />
}

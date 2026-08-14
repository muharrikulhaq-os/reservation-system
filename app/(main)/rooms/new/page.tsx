import type { Metadata } from 'next'
import { RoomCreate } from '@/modules/rooms'

export const metadata: Metadata = {
  title: 'Tambah Ruangan - Sistem Reservasi',
}

export default function Page() {
  return <RoomCreate />
}

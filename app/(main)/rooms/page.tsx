import type { Metadata } from 'next'
import { RoomsPage } from '@/modules/rooms'

export const metadata: Metadata = {
  title: 'Ruangan - Sistem Reservasi',
}

export default function Page() {
  return <RoomsPage />
}

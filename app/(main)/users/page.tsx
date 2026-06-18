import type { Metadata } from 'next'
import { Users } from '@/modules/users'

export const metadata: Metadata = {
  title: 'Pengguna — Reservation System',
}

export default function Page() {
  return <Users />
}

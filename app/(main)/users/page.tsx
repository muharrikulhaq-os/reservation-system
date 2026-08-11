import type { Metadata } from 'next'
import { Users } from '@/modules/users'

export const metadata: Metadata = {
  title: 'Pengguna — Sistem Reservasi',
}

export default function Page() {
  return <Users />
}

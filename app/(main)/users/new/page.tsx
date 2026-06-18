import type { Metadata } from 'next'
import { UserCreate } from '@/modules/users'

export const metadata: Metadata = {
  title: 'Tambah Pengguna — Reservation System',
}

export default function Page() {
  return <UserCreate />
}

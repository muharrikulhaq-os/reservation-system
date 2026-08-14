import type { Metadata } from 'next'
import { UserCreate } from '@/modules/users'

export const metadata: Metadata = {
  title: 'Tambah Pengguna - Sistem Reservasi',
}

export default function Page() {
  return <UserCreate />
}

import type { Metadata } from 'next'
import { ProfilePage } from '@/modules/profile'

export const metadata: Metadata = {
  title: 'Profil Saya - Sistem Reservasi',
}

export default function Page() {
  return <ProfilePage />
}

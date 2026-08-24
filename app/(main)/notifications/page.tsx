import type { Metadata } from 'next'
import { NotificationsPage } from '@/modules/notifications'

export const metadata: Metadata = {
  title: 'Notifikasi - Sistem Reservasi',
}

export default function Page() {
  return <NotificationsPage />
}

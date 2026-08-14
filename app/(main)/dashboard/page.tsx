import type { Metadata } from 'next'
import { DashboardPage } from '@/modules/dashboard'

export const metadata: Metadata = {
  title: 'Dashboard - Sistem Reservasi',
}

export default function Page() {
  return <DashboardPage />
}
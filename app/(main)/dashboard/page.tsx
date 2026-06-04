import type { Metadata } from 'next'
import { DashboardPage } from '@/modules/dashboard'

export const metadata: Metadata = {
  title: 'Dashboard — Reservation System',
}

export default function Page() {
  return <DashboardPage />
}
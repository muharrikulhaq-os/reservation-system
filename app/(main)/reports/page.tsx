import type { Metadata } from 'next'
import { Reports } from '@/modules/reports'

export const metadata: Metadata = {
  title: 'Laporan & Analitik — Sistem Reservasi',
}

export default function Page() {
  return <Reports />
}

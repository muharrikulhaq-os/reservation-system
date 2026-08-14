import type { Metadata } from 'next'
import { MaintenanceDetail } from '@/modules/maintenance'

export const metadata: Metadata = {
  title: 'Detail Maintenance - Sistem Reservasi',
}

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  return <MaintenanceDetail id={Number(id)} />
}

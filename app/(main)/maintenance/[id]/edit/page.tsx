import type { Metadata } from 'next'
import { MaintenanceEdit } from '@/modules/maintenance'

export const metadata: Metadata = {
  title: 'Ubah Maintenance - Sistem Reservasi',
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return <MaintenanceEdit id={Number(id)} />
}

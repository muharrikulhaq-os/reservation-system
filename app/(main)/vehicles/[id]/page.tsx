import type { Metadata } from 'next'
import { VehicleDetail } from '@/modules/vehicles'

export const metadata: Metadata = {
  title: 'Detail Kendaraan — Reservation System',
}

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  return <VehicleDetail vehicleId={Number(id)} />
}

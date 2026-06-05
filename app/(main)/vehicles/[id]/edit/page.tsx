import type { Metadata } from 'next'
import { VehicleEdit } from '@/modules/vehicles'

export const metadata: Metadata = {
  title: 'Edit Kendaraan — Reservation System',
}

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  return <VehicleEdit vehicleId={Number(id)} />
}

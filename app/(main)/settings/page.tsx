import type { Metadata } from 'next'
import { AdminOnly } from '@/components/common'
import { FuelStationSettings, FuelTypeSettings } from '@/modules/settings'

export const metadata: Metadata = {
  title: 'Pengaturan - Sistem Reservasi',
}

export default function Page() {
  return (
    <AdminOnly>
      <div className="flex flex-col gap-6">
        <FuelTypeSettings />
        <FuelStationSettings />
      </div>
    </AdminOnly>
  )
}

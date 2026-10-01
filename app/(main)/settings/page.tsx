import type { Metadata } from 'next'
import { AdminOnly } from '@/components/common'
import { FuelTypeSettings } from '@/modules/settings'
import { DocumentSettingsCard } from '@/modules/maintenance'

export const metadata: Metadata = {
  title: 'Pengaturan - Sistem Reservasi',
}

export default function Page() {
  return (
    <AdminOnly>
      <div className="flex flex-col gap-6">
        <FuelTypeSettings />
        <DocumentSettingsCard />
      </div>
    </AdminOnly>
  )
}

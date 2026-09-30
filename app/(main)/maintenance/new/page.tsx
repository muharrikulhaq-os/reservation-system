import type { Metadata } from 'next'
import { PageHeader } from '@/components/shared'
import { MaintenanceForm } from '@/modules/maintenance'

export const metadata: Metadata = {
  title: 'Buat Maintenance - Sistem Reservasi',
}

export default function Page() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Buat Pengajuan Maintenance"
        description="Ajukan servis atau perbaikan ke vendor/bengkel"
        backHref="/maintenance"
      />
      <MaintenanceForm />
    </div>
  )
}

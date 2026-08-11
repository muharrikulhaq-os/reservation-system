import type { Metadata } from 'next'
import { PageHeader } from '@/components/shared'
import { MaintenanceForm } from '@/modules/maintenance'

export const metadata: Metadata = {
  title: 'Buat Maintenance — Sistem Reservasi',
}

export default function Page() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Buat Maintenance"
        description="Catat pekerjaan servis atau perbaikan"
        backHref="/maintenance"
      />
      <MaintenanceForm />
    </div>
  )
}

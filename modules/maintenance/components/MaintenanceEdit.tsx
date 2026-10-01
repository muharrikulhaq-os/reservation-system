'use client'

import { PageHeader } from '@/components/shared'
import { isMaintenanceEditable } from '@/constants'
import { useMaintenanceRecord } from '../hooks/useMaintenance'
import { MaintenanceForm } from './MaintenanceForm'
import { WarningAlert } from './shared'

export const MaintenanceEdit = ({ id }: { id: number }) => {
  const { data, isLoading } = useMaintenanceRecord(id)
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Ubah Pengajuan Maintenance"
        description={data?.requestNo ?? 'Draf'}
        backHref={`/maintenance/${id}`}
      />
      {isLoading ? (
        <p className="py-16 text-center text-sm text-[var(--text-secondary)]">Memuat…</p>
      ) : !data ? (
        <p className="py-16 text-center text-sm text-[var(--text-secondary)]">Data maintenance tidak ditemukan.</p>
      ) : !isMaintenanceEditable(data.status) ? (
        <WarningAlert>Pengajuan yang sudah dikerjakan/selesai/dibatalkan tidak bisa diubah.</WarningAlert>
      ) : (
        <MaintenanceForm initialData={data} />
      )}
    </div>
  )
}

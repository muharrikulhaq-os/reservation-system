'use client'

import Link from 'next/link'
import { AlertOctagon, CalendarClock, Coins, Plus, Wrench } from 'lucide-react'
import { PageHeader, StatCard } from '@/components/shared'
import { DataTable } from '@/components/shared/table/DataTable'
import { AppButton, InputSelect, InputText } from '@/components/ui-custom'
import { useTableFilter } from '@/hooks'
import { formatCurrency, isSameWibMonth } from '@/lib'
import { MAINTENANCE_STATUS_CONFIG } from '@/constants'
import type { MaintenanceStatus, SelectOption } from '@/types'
import { useMaintenanceRecords, useVehicleIssues } from './hooks/useMaintenance'
import { maintenanceColumns } from './utils/columns'
import { MaintenanceNav } from './components/MaintenanceNav'

const statusOptions: SelectOption[] = [
  { value: 'ACTIVE', label: 'Semua yang berjalan' },
  ...(Object.keys(MAINTENANCE_STATUS_CONFIG) as MaintenanceStatus[]).map((s) => ({
    value: s,
    label: MAINTENANCE_STATUS_CONFIG[s].label,
  })),
]

export const Maintenance = () => {
  const { search, setSearch, filters, setFilter, sortBy, sortOrder, setSort, params, setPage, setLimit } =
    useTableFilter({ status: undefined as string | undefined })

  const { data, isLoading } = useMaintenanceRecords(params)
  const items = data?.data ?? []

  // Ringkasan (query ringan terpisah - tidak ikut filter tabel).
  const { data: atVendor } = useMaintenanceRecords({ status: 'IN_PROGRESS', limit: 1 })
  const { data: pending } = useMaintenanceRecords({ status: 'DRAFT,SUBMITTED,SCHEDULED', limit: 1 })
  const { data: done } = useMaintenanceRecords({ status: 'COMPLETED', limit: 100, sortBy: 'createdAt', sortOrder: 'desc' })
  const { data: issues } = useVehicleIssues({ status: 'OPEN', limit: 1 })
  const costThisMonth = (done?.data ?? [])
    .filter((m) => m.completedAt && isSameWibMonth(m.completedAt, new Date()))
    .reduce((s, m) => s + (m.actualCost ?? 0), 0)

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Pemeliharaan"
        description="Pengajuan maintenance ke vendor/bengkel, serah terima, dan dokumen"
        actions={
          <Link href="/maintenance/new">
            <AppButton leftIcon={<Plus className="h-4 w-4" />}>Buat Pengajuan</AppButton>
          </Link>
        }
      />
      <MaintenanceNav />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Kendaraan di Vendor"
          value={atVendor?.pagination?.total ?? 0}
          iconBg="#DBEAFE"
          icon={<Wrench className="h-5 w-5" style={{ color: '#1E40AF' }} />}
        />
        <StatCard
          label="Pengajuan Berjalan"
          value={pending?.pagination?.total ?? 0}
          iconBg="#FEF9C3"
          icon={<CalendarClock className="h-5 w-5" style={{ color: '#854D0E' }} />}
        />
        <StatCard
          label="Laporan Kendala Baru"
          value={issues?.pagination?.total ?? 0}
          iconBg="#FEE2E2"
          icon={<AlertOctagon className="h-5 w-5" style={{ color: '#991B1B' }} />}
        />
        <StatCard
          label="Biaya Selesai Bulan Ini"
          value={formatCurrency(costThisMonth)}
          iconBg="var(--primary-light)"
          icon={<Coins className="h-5 w-5" style={{ color: 'var(--primary)' }} />}
        />
      </div>

      <div className="flex flex-wrap items-end gap-3">
        <div className="w-full max-w-[260px]">
          <InputText
            placeholder="Cari nomor surat, plat, vendor…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="w-full max-w-[220px]">
          <InputSelect
            placeholder="Semua status"
            options={statusOptions}
            value={filters.status ?? ''}
            onChange={(e) => setFilter('status', e.target.value || undefined)}
          />
        </div>
      </div>

      <DataTable
        data={items}
        columns={maintenanceColumns}
        isLoading={isLoading}
        pagination={data?.pagination}
        onPageChange={setPage}
        onLimitChange={setLimit}
        manualSorting
        sorting={sortBy ? [{ id: sortBy, desc: sortOrder === 'desc' }] : []}
        onSortingChange={(s) => setSort(s[0]?.id, s[0]?.desc ? 'desc' : 'asc')}
        emptyMessage="Belum ada pengajuan maintenance"
      />
    </div>
  )
}

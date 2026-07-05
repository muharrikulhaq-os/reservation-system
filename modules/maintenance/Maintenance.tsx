'use client'

import Link from 'next/link'
import { Search, Wrench, CheckCircle2, Coins, Plus } from 'lucide-react'
import { PageHeader, StatCard } from '@/components/shared'
import { DataTable } from '@/components/shared/table/DataTable'
import { AppButton, InputSelect, InputDate } from '@/components/ui-custom'
import { useTableFilter } from '@/hooks'
import { formatCurrency } from '@/lib'
import {
  RESOURCE_TYPE,
  MAINTENANCE_STATUS,
  MAINTENANCE_TYPE_CONFIG,
  MAINTENANCE_STATUS_CONFIG,
} from '@/constants'
import type {
  MaintenanceStatus,
  MaintenanceType,
  ResourceType,
  SelectOption,
} from '@/types'
import { useMaintenanceRecords } from './hooks/useMaintenance'
import { maintenanceColumns } from './utils/columns'

const isThisMonth = (iso: string | null) => {
  if (!iso) return false
  const d = new Date(iso)
  const now = new Date()
  return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth()
}

export const Maintenance = () => {
  const { search, setSearch, filters, setFilter, params, setPage } =
    useTableFilter({
      resourceType: undefined as ResourceType | undefined,
      type: undefined as MaintenanceType | undefined,
      status: undefined as MaintenanceStatus | undefined,
      startDate: undefined as string | undefined,
      endDate: undefined as string | undefined,
    })

  const { data, isLoading } = useMaintenanceRecords(params)
  const items = data?.data ?? []

  const ongoingCount = items.filter(
    (m) => m.status === MAINTENANCE_STATUS.ONGOING,
  ).length
  const completedThisMonth = items.filter(
    (m) => m.status === MAINTENANCE_STATUS.COMPLETED && isThisMonth(m.completedAt),
  )
  const totalCostMonth = completedThisMonth.reduce((s, m) => s + (m.cost ?? 0), 0)

  const resourceTypeOptions: SelectOption[] = [
    { value: RESOURCE_TYPE.VEHICLE, label: 'Kendaraan' },
    { value: RESOURCE_TYPE.ROOM, label: 'Ruangan' },
  ]
  const typeOptions: SelectOption[] = (
    Object.keys(MAINTENANCE_TYPE_CONFIG) as MaintenanceType[]
  ).map((t) => ({ value: t, label: MAINTENANCE_TYPE_CONFIG[t].label }))
  const statusOptions: SelectOption[] = (
    Object.keys(MAINTENANCE_STATUS_CONFIG) as MaintenanceStatus[]
  ).map((s) => ({ value: s, label: MAINTENANCE_STATUS_CONFIG[s].label }))

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Pemeliharaan"
        description="Servis & perbaikan kendaraan dan ruangan"
        actions={
          <Link href="/maintenance/new">
            <AppButton leftIcon={<Plus className="h-4 w-4" />}>
              Buat Maintenance
            </AppButton>
          </Link>
        }
      />

      {/* Stat cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          label="Sedang Berlangsung"
          value={ongoingCount}
          iconBg="#DBEAFE"
          icon={<Wrench className="h-5 w-5" style={{ color: '#1E40AF' }} />}
        />
        <StatCard
          label="Selesai Bulan Ini"
          value={completedThisMonth.length}
          iconBg="#DCFCE7"
          icon={<CheckCircle2 className="h-5 w-5" style={{ color: '#166534' }} />}
        />
        <StatCard
          label="Total Biaya Bulan Ini"
          value={formatCurrency(totalCostMonth)}
          iconBg="var(--primary-light)"
          icon={<Coins className="h-5 w-5" style={{ color: 'var(--primary)' }} />}
        />
      </div>

      {/* Filter */}
      <div className="flex flex-wrap items-end gap-3">
        <div className="relative w-full max-w-xs">
          <Search className="pointer-events-none absolute inset-y-0 left-3 my-auto h-4 w-4 text-[var(--text-disabled)]" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari resource / deskripsi…"
            className="h-10 w-full rounded-lg border border-[var(--border-input)] bg-[var(--bg-card)] pl-9 pr-3 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-disabled)] focus:border-[var(--primary)] focus:outline-none"
          />
        </div>

        <div className="w-full max-w-[150px]">
          <InputSelect
            placeholder="Semua Resource"
            options={resourceTypeOptions}
            value={filters.resourceType ?? ''}
            onChange={(e) =>
              setFilter(
                'resourceType',
                (e.target.value || undefined) as ResourceType | undefined,
              )
            }
          />
        </div>
        <div className="w-full max-w-[160px]">
          <InputSelect
            placeholder="Semua Tipe"
            options={typeOptions}
            value={filters.type ?? ''}
            onChange={(e) =>
              setFilter('type', (e.target.value || undefined) as MaintenanceType | undefined)
            }
          />
        </div>
        <div className="w-full max-w-[150px]">
          <InputSelect
            placeholder="Semua Status"
            options={statusOptions}
            value={filters.status ?? ''}
            onChange={(e) =>
              setFilter(
                'status',
                (e.target.value || undefined) as MaintenanceStatus | undefined,
              )
            }
          />
        </div>
        <div className="w-[150px]">
          <InputDate
            value={filters.startDate ?? ''}
            onChange={(e) => setFilter('startDate', e.target.value || undefined)}
          />
        </div>
        <div className="w-[150px]">
          <InputDate
            value={filters.endDate ?? ''}
            onChange={(e) => setFilter('endDate', e.target.value || undefined)}
          />
        </div>
      </div>

      <DataTable
        data={items}
        columns={maintenanceColumns}
        isLoading={isLoading}
        pagination={data?.pagination}
        onPageChange={setPage}
        emptyMessage="Belum ada data maintenance"
      />
    </div>
  )
}

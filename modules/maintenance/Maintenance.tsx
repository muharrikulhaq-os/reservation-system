'use client'

import Link from 'next/link'
import { Wrench, CheckCircle2, Coins, Plus } from 'lucide-react'
import { PageHeader, StatCard } from '@/components/shared'
import { DataTable } from '@/components/shared/table/DataTable'
import { AppButton, InputSelect } from '@/components/ui-custom'
import { useTableFilter } from '@/hooks'
import { formatCurrency } from '@/lib'
import { isMaintenanceCompleted } from '@/constants'
import type { MaintenanceRecord, SelectOption } from '@/types'
import { useMaintenanceRecords } from './hooks/useMaintenance'
import { maintenanceColumns } from './utils/columns'

const isThisMonth = (iso: string | null) => {
  if (!iso) return false
  const d = new Date(iso)
  const now = new Date()
  return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth()
}

const isCompleted = (m: MaintenanceRecord) => isMaintenanceCompleted(m.status)
const costOf = (m: MaintenanceRecord) => (m.totalCost ? Number(m.totalCost) || 0 : 0)

export const Maintenance = () => {
  const { filters, setFilter, params, setPage, setLimit } = useTableFilter({
    status: undefined as 'ongoing' | 'completed' | undefined,
  })

  const { data, isLoading } = useMaintenanceRecords(params)
  const rawItems = data?.data ?? []

  const items =
    filters.status === undefined
      ? rawItems
      : rawItems.filter((m) =>
          filters.status === 'completed' ? isCompleted(m) : !isCompleted(m),
        )

  const ongoingCount = rawItems.filter((m) => !isCompleted(m)).length
  const completedThisMonth = rawItems.filter(
    (m) => isCompleted(m) && isThisMonth(m.completedAt ?? m.endDate),
  )
  const totalCostMonth = completedThisMonth.reduce((s, m) => s + costOf(m), 0)

  const statusOptions: SelectOption[] = [
    { value: 'ongoing', label: 'Berlangsung' },
    { value: 'completed', label: 'Selesai' },
  ]

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Pemeliharaan"
        description="Servis & perbaikan kendaraan"
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
        <div className="w-full max-w-[180px]">
          <InputSelect
            placeholder="Semua Status"
            options={statusOptions}
            value={filters.status ?? ''}
            onChange={(e) =>
              setFilter(
                'status',
                (e.target.value || undefined) as 'ongoing' | 'completed' | undefined,
              )
            }
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
        emptyMessage="Belum ada data maintenance"
      />
    </div>
  )
}

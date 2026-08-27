'use client'

import { Search } from 'lucide-react'
import { Card, CardHeader } from '@/components/common'
import {
  DataTable,
  createColumnHelper,
  type ColumnDef,
  Badge,
  Pagination,
} from '@/components/shared'
import { InputText } from '@/components/ui-custom'
import { formatCurrency, formatNumber } from '@/lib'
import type { ReportDateParams, ResourceUsageReport } from '@/types'
import { useResourceUsage } from '../../hooks/useReports'
import { useClientListFilter } from '../../hooks/useClientListFilter'

// ─────────────────────────────────────────
// TAB: RESOURCE
// Sumber: /reports/resource-usage (dulu v_vehicle_summary tanpa filter
// tanggal sama sekali - sekarang query langsung yang ikut range terpilih)
// ─────────────────────────────────────────

const num = (v: unknown) => Number(v) || 0

const ch = createColumnHelper<ResourceUsageReport>()

const usageColumns: ColumnDef<ResourceUsageReport, unknown>[] = [
  ch.accessor('vehicle_name', {
    header: 'Kendaraan',
    cell: ({ row }) => (
      <div className="flex flex-col">
        <span className="text-sm font-medium text-[var(--text-primary)]">
          {row.original.vehicle_name}
        </span>
        <span className="text-[11px] text-[var(--text-disabled)]">
          {row.original.plateNumber}
        </span>
      </div>
    ),
  }),
  ch.accessor('category', {
    header: 'Kategori',
    size: 130,
    cell: ({ getValue }) => <Badge variant="default">{getValue()}</Badge>,
  }),
  ch.accessor('total_bookings', {
    header: 'Total Booking',
    size: 120,
    cell: ({ getValue }) => (
      <span className="text-sm text-[var(--text-secondary)]">{getValue()}</span>
    ),
  }),
  ch.accessor('completed_bookings', {
    header: 'Selesai',
    size: 100,
    cell: ({ getValue }) => (
      <span className="text-sm text-[var(--text-secondary)]">{getValue()}</span>
    ),
  }),
  ch.accessor('currentOdometer', {
    header: 'Odometer',
    size: 120,
    cell: ({ getValue }) => (
      <span className="text-sm text-[var(--text-secondary)]">
        {formatNumber(getValue())} km
      </span>
    ),
  }),
  ch.accessor('total_fuel_cost', {
    header: 'Total BBM',
    size: 140,
    cell: ({ getValue }) => (
      <span className="text-sm font-medium text-[var(--text-primary)]">
        {formatCurrency(num(getValue()))}
      </span>
    ),
  }),
] as ColumnDef<ResourceUsageReport, unknown>[]

export const ResourceSection = ({ range }: { range: ReportDateParams }) => {
  const { data: usage, isLoading } = useResourceUsage(range)
  const {
    search,
    setSearch,
    items: pagedUsage,
    pagination,
    setPage,
  } = useClientListFilter(usage ?? [], { searchFields: ['vehicle_name', 'plateNumber'] })

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader
          title="Utilisasi Kendaraan"
          description="Total booking & biaya BBM per kendaraan - periode terpilih"
        />
        <div className="mb-4 max-w-xs">
          <InputText
            placeholder="Cari kendaraan…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            leftIcon={<Search className="h-4 w-4" />}
          />
        </div>
        <DataTable
          data={pagedUsage}
          columns={usageColumns}
          isLoading={isLoading}
          emptyMessage="Belum ada data utilisasi"
        />
        {pagination.total > 0 && <Pagination pagination={pagination} onPageChange={setPage} />}
      </Card>
    </div>
  )
}

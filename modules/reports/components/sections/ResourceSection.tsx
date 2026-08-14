'use client'

import { Card, CardHeader } from '@/components/common'
import {
  DataTable,
  createColumnHelper,
  type ColumnDef,
  Badge,
} from '@/components/shared'
import { formatCurrency, formatNumber } from '@/lib'
import type { ReportDateParams, ResourceUsageReport } from '@/types'
import { useResourceUsage } from '../../hooks/useReports'

// ─────────────────────────────────────────
// TAB: RESOURCE
// Sumber: /reports/resource-usage (v_vehicle_summary - kendaraan saja)
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

export const ResourceSection = (_: { range: ReportDateParams }) => {
  const { data: usage, isLoading } = useResourceUsage()

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader
          title="Utilisasi Kendaraan"
          description="Total booking & biaya BBM per kendaraan"
        />
        <DataTable
          data={usage ?? []}
          columns={usageColumns}
          isLoading={isLoading}
          emptyMessage="Belum ada data utilisasi"
        />
      </Card>
    </div>
  )
}

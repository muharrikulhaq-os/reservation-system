'use client'

import { Card, CardHeader } from '@/components/common'
import { DataTable, createColumnHelper, type ColumnDef, Badge } from '@/components/shared'
import { formatCurrency } from '@/lib'
import type { ReportDateParams, DriverPerformance } from '@/types'
import { BarChartHorizontal } from '../charts'
import { ratingStars } from '../../utils/format'
import {
  useDriverPerformance,
  useDriverRatingsReport,
  useDriverActivityReport,
} from '../../hooks/useReports'

// ─────────────────────────────────────────
// TAB: DRIVER
// ─────────────────────────────────────────

const ch = createColumnHelper<DriverPerformance>()

const performanceColumns: ColumnDef<DriverPerformance, unknown>[] = [
  ch.accessor('driverName', {
    header: 'Driver',
    cell: ({ getValue }) => (
      <span className="text-sm font-medium text-[var(--text-primary)]">{getValue()}</span>
    ),
  }),
  ch.accessor('totalTrips', {
    header: 'Trip',
    size: 80,
    cell: ({ getValue }) => (
      <span className="text-sm text-[var(--text-secondary)]">{getValue()}</span>
    ),
  }),
  ch.accessor('totalKm', {
    header: 'Jarak',
    size: 100,
    cell: ({ getValue }) => (
      <span className="text-sm text-[var(--text-secondary)]">{getValue()} km</span>
    ),
  }),
  ch.accessor('avgCostPerKm', {
    header: 'Biaya/km',
    size: 120,
    cell: ({ getValue }) => (
      <span className="text-sm text-[var(--text-secondary)]">{formatCurrency(getValue())}</span>
    ),
  }),
  ch.accessor('avgRating', {
    header: 'Rating',
    size: 140,
    cell: ({ getValue }) => (
      <span className="flex items-center gap-1.5 text-sm">
        <span className="text-[var(--warning)]">{ratingStars(getValue())}</span>
        <span className="text-xs text-[var(--text-secondary)]">{getValue().toFixed(1)}</span>
      </span>
    ),
  }),
  ch.accessor('onTimeRate', {
    header: 'Tepat Waktu',
    size: 120,
    cell: ({ getValue }) => {
      const rate = getValue()
      const variant = rate >= 95 ? 'success' : rate >= 85 ? 'warning' : 'danger'
      return <Badge variant={variant}>{rate}%</Badge>
    },
  }),
  ch.accessor('lateCount', {
    header: 'Terlambat',
    size: 100,
    cell: ({ getValue }) => (
      <span className="text-sm text-[var(--text-secondary)]">{getValue()}x</span>
    ),
  }),
] as ColumnDef<DriverPerformance, unknown>[]

export const DriverSection = ({ range }: { range: ReportDateParams }) => {
  const { data: performance, isLoading } = useDriverPerformance(range)
  const { data: ratings } = useDriverRatingsReport()
  const { data: activity } = useDriverActivityReport()

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader title="Performa Driver" description="Periode terpilih" />
        <DataTable
          data={performance ?? []}
          columns={performanceColumns}
          isLoading={isLoading}
          emptyMessage="Belum ada data performa driver"
        />
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader title="Rating Driver" description="Peringkat rata-rata rating" />
          <BarChartHorizontal
            data={ratings ?? []}
            nameKey="driverName"
            valueKey="averageRating"
            barColor="var(--warning)"
            formatValue={(v) => v.toFixed(1)}
          />
        </Card>

        <Card>
          <CardHeader title="Aktivitas Driver" description="Total trip per driver" />
          <BarChartHorizontal
            data={activity ?? []}
            nameKey="driverName"
            valueKey="totalTrips"
          />
        </Card>
      </div>
    </div>
  )
}

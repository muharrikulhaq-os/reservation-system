'use client'

import { Card, CardHeader } from '@/components/common'
import { DataTable, createColumnHelper, type ColumnDef, Badge } from '@/components/shared'
import { formatCurrency } from '@/lib'
import type { ReportDateParams, DriverPerformance } from '@/types'
import { BarChartHorizontal } from '../charts'
import { ratingStars } from '../../utils/format'
import {
  useDriverPerformance,
  useDriverTrips,
  useDriverRatingsReport,
  useDriverActivityReport,
} from '../../hooks/useReports'

// ─────────────────────────────────────────
// TAB: DRIVER
// ─────────────────────────────────────────

// Gabungan DriverPerformance + DriverTrips (SPD/keterlambatan/lembur) untuk
// satu baris tabel. avgRating/totalReviews dari DriverTrips dipakai (ikut
// rentang tanggal yang dipilih), BUKAN dari DriverPerformance (sepanjang
// masa). Keterlambatan (relatif ke jadwal booking) dan Lembur (lewat jam
// kerja tetap 18:00 WIB) adalah dua metrik yang beda, jangan disamakan.
interface DriverReportRow extends DriverPerformance {
  spdTrips: number
  nonSpdTrips: number
  overtimeTrips: number
  totalOvertimeHours: number
  lemburTrips: number
  totalLemburHours: number
}

const ch = createColumnHelper<DriverReportRow>()

const performanceColumns: ColumnDef<DriverReportRow, unknown>[] = [
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
  ch.accessor('totalFuelCost', {
    header: 'Total BBM',
    size: 140,
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
      return <Badge variant={variant}>{rate.toFixed(0)}%</Badge>
    },
  }),
  ch.accessor('lateCount', {
    header: 'Overdue',
    size: 100,
    cell: ({ getValue }) => (
      <span className="text-sm text-[var(--text-secondary)]">{getValue()}x</span>
    ),
  }),
  ch.accessor('spdTrips', {
    header: 'SPD',
    size: 90,
    cell: ({ getValue }) => (
      <span className="text-sm text-[var(--text-secondary)]">{getValue()}x</span>
    ),
  }),
  ch.accessor('totalOvertimeHours', {
    header: 'Keterlambatan',
    size: 150,
    cell: ({ row, getValue }) => {
      const hours = getValue()
      const trips = row.original.overtimeTrips
      if (trips === 0) {
        return <span className="text-sm text-[var(--text-disabled)]">-</span>
      }
      return (
        <span className="text-sm text-[var(--text-secondary)]">
          {hours.toFixed(1)} jam{' '}
          <span className="text-xs text-[var(--text-disabled)]">({trips}x)</span>
        </span>
      )
    },
  }),
  ch.accessor('totalLemburHours', {
    header: 'Lembur',
    size: 140,
    cell: ({ row, getValue }) => {
      const hours = getValue()
      const trips = row.original.lemburTrips
      if (trips === 0) {
        return <span className="text-sm text-[var(--text-disabled)]">-</span>
      }
      return (
        <span className="text-sm text-[var(--text-secondary)]">
          {hours.toFixed(1)} jam{' '}
          <span className="text-xs text-[var(--text-disabled)]">({trips}x)</span>
        </span>
      )
    },
  }),
] as ColumnDef<DriverReportRow, unknown>[]

export const DriverSection = ({ range }: { range: ReportDateParams }) => {
  const { data: performance, isLoading: isLoadingPerformance } = useDriverPerformance(range)
  const { data: trips, isLoading: isLoadingTrips } = useDriverTrips(range)
  const { data: ratings } = useDriverRatingsReport()
  const { data: activity } = useDriverActivityReport()

  // Gabung SPD/keterlambatan/lembur/rating (DriverTrips, ikut rentang
  // tanggal) ke baris performa driver - rating dari DriverPerformance
  // diganti yang ter-scope.
  const tripsByDriver = new Map((trips ?? []).map((t) => [t.driverId, t]))
  const rows: DriverReportRow[] = (performance ?? []).map((p) => {
    const t = tripsByDriver.get(p.driverId)
    return {
      ...p,
      avgRating: t?.avgRating ?? 0,
      totalReviews: t?.totalReviews ?? 0,
      spdTrips: t?.spdTrips ?? 0,
      nonSpdTrips: t?.nonSpdTrips ?? 0,
      overtimeTrips: t?.overtimeTrips ?? 0,
      totalOvertimeHours: t?.totalOvertimeHours ?? 0,
      lemburTrips: t?.lemburTrips ?? 0,
      totalLemburHours: t?.totalLemburHours ?? 0,
    }
  })

  // average_rating dikirim sebagai string → koersi ke number untuk chart
  const ratingsData = (ratings ?? []).map((r) => ({
    driver_name: r.driver_name,
    avg: Number(r.average_rating) || 0,
  }))
  const activityData = (activity ?? []).map((a) => ({
    driver_name: a.driver_name,
    total_bookings: a.total_bookings,
  }))

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader
          title="Performa Driver"
          description="Periode terpilih - trip SPD/Non-SPD, keterlambatan pengembalian, lembur (lewat jam kerja), dan rating"
        />
        <DataTable
          data={rows}
          columns={performanceColumns}
          isLoading={isLoadingPerformance || isLoadingTrips}
          emptyMessage="Belum ada data performa driver"
        />
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader title="Rating Driver" description="Peringkat rata-rata rating" />
          <BarChartHorizontal
            data={ratingsData}
            nameKey="driver_name"
            valueKey="avg"
            barColor="var(--warning)"
            formatValue={(v) => v.toFixed(1)}
            domain={[0, 5]}
          />
        </Card>

        <Card>
          <CardHeader title="Aktivitas Driver" description="Total trip per driver" />
          <BarChartHorizontal
            data={activityData}
            nameKey="driver_name"
            valueKey="total_bookings"
          />
        </Card>
      </div>
    </div>
  )
}

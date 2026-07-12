'use client'

import { CalendarCheck, Wallet, Activity, AlertTriangle } from 'lucide-react'
import { Card, CardHeader } from '@/components/common'
import { formatCurrency } from '@/lib'
import { BOOKING_STATUS_CONFIG } from '@/constants'
import type { ReportDateParams } from '@/types'
import { ReportStatCard } from '../ReportStatCard'
import { TrendLineChart, DonutChart } from '../charts'
import { useReportOverview, useBookingTrend, useBookingSummary } from '../../hooks/useReports'
import { formatPeriodShort } from '../../utils/format'

// ─────────────────────────────────────────
// TAB: RINGKASAN
// ─────────────────────────────────────────

export const OverviewSection = ({ range }: { range: ReportDateParams }) => {
  const { data: overview } = useReportOverview()
  const { data: trend } = useBookingTrend({ groupBy: 'monthly', periods: 12 })
  const { data: summary } = useBookingSummary(range)

  const donutData = summary
    ? [
        { name: BOOKING_STATUS_CONFIG.PENDING.label, value: summary.pending, color: BOOKING_STATUS_CONFIG.PENDING.dotColor },
        { name: BOOKING_STATUS_CONFIG.APPROVED.label, value: summary.approved, color: BOOKING_STATUS_CONFIG.APPROVED.dotColor },
        { name: BOOKING_STATUS_CONFIG.COMPLETED.label, value: summary.completed, color: BOOKING_STATUS_CONFIG.COMPLETED.dotColor },
        { name: BOOKING_STATUS_CONFIG.CANCELLED.label, value: summary.cancelled, color: BOOKING_STATUS_CONFIG.CANCELLED.dotColor },
        { name: BOOKING_STATUS_CONFIG.REJECTED.label, value: summary.rejected, color: BOOKING_STATUS_CONFIG.REJECTED.dotColor },
      ].filter((d) => d.value > 0)
    : []

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <ReportStatCard
          label="Total Booking"
          value={overview?.totalBookings ?? '—'}
          icon={<CalendarCheck className="h-5 w-5 text-[var(--primary)]" />}
          iconBg="var(--primary-light)"
          change={overview?.changePercent.bookings}
          changeLabel="vs periode lalu"
        />
        <ReportStatCard
          label="Total Biaya"
          value={overview ? formatCurrency(overview.totalCost) : '—'}
          icon={<Wallet className="h-5 w-5 text-[var(--info)]" />}
          iconBg="#DBEAFE"
          change={overview?.changePercent.cost}
          changeLabel="vs periode lalu"
          goodDirection="down"
        />
        <ReportStatCard
          label="Avg Utilisasi"
          value={overview ? `${overview.avgUtilization.toFixed(1)}%` : '—'}
          icon={<Activity className="h-5 w-5 text-[var(--success)]" />}
          iconBg="#DCFCE7"
          change={overview?.changePercent.utilization}
          changeLabel="vs periode lalu"
        />
        <ReportStatCard
          label="Overdue"
          value={overview?.overdueCount ?? '—'}
          icon={<AlertTriangle className="h-5 w-5 text-[var(--warning)]" />}
          iconBg="#FEF3C7"
          change={overview?.changePercent.overdue}
          changeLabel="vs periode lalu"
          goodDirection="down"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader title="Trend Booking" description="12 bulan terakhir — kendaraan vs ruangan" />
          <TrendLineChart
            data={trend ?? []}
            xKey="period"
            formatX={formatPeriodShort}
            lines={[
              { key: 'count', label: 'Total', color: 'var(--primary)' },
              { key: 'vehicle', label: 'Kendaraan', color: 'var(--info)' },
              { key: 'room', label: 'Ruangan', color: 'var(--success)' },
            ]}
          />
        </Card>

        <Card>
          <CardHeader title="Distribusi Status" description="Periode terpilih" />
          <DonutChart data={donutData} centerValue={summary?.total ?? 0} centerText="Booking" />
        </Card>
      </div>
    </div>
  )
}

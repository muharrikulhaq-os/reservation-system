'use client'

import { CalendarCheck, Clock, CheckCircle2, Search } from 'lucide-react'
import { Card, CardHeader } from '@/components/common'
import { DataTable, createColumnHelper, type ColumnDef, Badge, Pagination } from '@/components/shared'
import { InputText } from '@/components/ui-custom'
import { RESOURCE_TYPE } from '@/constants'
import type { ReportDateParams, BookingByResource } from '@/types'
import { ReportStatCard } from '../ReportStatCard'
import { TrendLineChart, BarChartHorizontal } from '../charts'
import { formatPeriodShort, pickTrendGranularity } from '../../utils/format'
import { useClientListFilter } from '../../hooks/useClientListFilter'
import {
  useBookingSummary,
  useApprovalPerformance,
  useBookingByDepartment,
  useBookingByResource,
  useBookingTrend,
} from '../../hooks/useReports'

// ─────────────────────────────────────────
// TAB: BOOKING
// ─────────────────────────────────────────

const ch = createColumnHelper<BookingByResource>()

const resourceColumns: ColumnDef<BookingByResource, unknown>[] = [
  ch.accessor('resourceName', {
    header: 'Resource',
    cell: ({ getValue }) => (
      <span className="text-sm font-medium text-[var(--text-primary)]">{getValue()}</span>
    ),
  }),
  ch.accessor('resourceType', {
    header: 'Tipe',
    size: 120,
    cell: ({ getValue }) =>
      getValue() === RESOURCE_TYPE.VEHICLE ? (
        <Badge variant="info">Kendaraan</Badge>
      ) : (
        <Badge variant="default">Ruangan</Badge>
      ),
  }),
  ch.accessor('totalBookings', {
    header: 'Total Booking',
    size: 130,
    cell: ({ getValue }) => (
      <span className="text-sm text-[var(--text-secondary)]">{getValue()}</span>
    ),
  }),
  ch.accessor('totalHours', {
    header: 'Total Jam',
    size: 120,
    cell: ({ getValue }) => (
      <span className="text-sm text-[var(--text-secondary)]">{getValue()} jam</span>
    ),
  }),
] as ColumnDef<BookingByResource, unknown>[]

export const BookingSection = ({ range }: { range: ReportDateParams }) => {
  const { data: summary } = useBookingSummary(range)
  const { data: approval } = useApprovalPerformance(range)
  const { data: byDept } = useBookingByDepartment(range)
  const { data: byResource, isLoading: loadingResource } = useBookingByResource(range)
  const groupBy = pickTrendGranularity(range.startDate ?? '', range.endDate ?? '')
  const { data: trend } = useBookingTrend({ groupBy, startDate: range.startDate, endDate: range.endDate })

  // approval-performance = objek tunggal
  const avgHoursToDecision = approval?.avgApprovalTimeHours ?? null
  const totalDecisions = approval?.totalProcessed ?? 0

  const {
    search: resourceSearch,
    setSearch: setResourceSearch,
    items: pagedResources,
    pagination: resourcePagination,
    setPage: setResourcePage,
  } = useClientListFilter(byResource ?? [], { searchFields: ['resourceName'] })

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <ReportStatCard
          label="Total Booking"
          value={summary?.total ?? '-'}
          icon={<CalendarCheck className="h-5 w-5 text-[var(--primary)]" />}
          iconBg="var(--primary-light)"
        />
        <ReportStatCard
          label="Avg Waktu Approval"
          value={avgHoursToDecision != null ? `${avgHoursToDecision.toFixed(1)} jam` : '-'}
          icon={<Clock className="h-5 w-5 text-[var(--info)]" />}
          iconBg="#DBEAFE"
        />
        <ReportStatCard
          label="Total Keputusan"
          value={totalDecisions || '-'}
          icon={<CheckCircle2 className="h-5 w-5 text-[var(--success)]" />}
          iconBg="#DCFCE7"
        />
      </div>

      <Card>
        <CardHeader title="Booking per Departemen" />
        <BarChartHorizontal data={byDept ?? []} nameKey="departmentName" valueKey="total" />
      </Card>

      <Card>
        <CardHeader title="Booking per Resource" />
        <div className="mb-4 max-w-xs">
          <InputText
            placeholder="Cari resource…"
            value={resourceSearch}
            onChange={(e) => setResourceSearch(e.target.value)}
            leftIcon={<Search className="h-4 w-4" />}
          />
        </div>
        <DataTable
          data={pagedResources}
          columns={resourceColumns}
          isLoading={loadingResource}
          emptyMessage="Belum ada data resource"
        />
        {resourcePagination.total > 0 && (
          <Pagination pagination={resourcePagination} onPageChange={setResourcePage} />
        )}
      </Card>

      <Card>
        <CardHeader title="Trend Booking" description="Periode terpilih" />
        <TrendLineChart
          data={trend ?? []}
          xKey="period"
          formatX={formatPeriodShort}
          lines={[{ key: 'count', label: 'Total Booking', color: 'var(--primary)' }]}
        />
      </Card>
    </div>
  )
}

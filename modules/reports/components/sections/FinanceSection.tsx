'use client'

import { Fuel, Wrench, Wallet } from 'lucide-react'
import { Card, CardHeader } from '@/components/common'
import { DataTable, createColumnHelper, type ColumnDef } from '@/components/shared'
import { formatCurrency } from '@/lib'
import type { ReportDateParams, CostByVehicle } from '@/types'
import { ReportStatCard } from '../ReportStatCard'
import { TrendLineChart, BarChartHorizontal } from '../charts'
import { DataTableExport } from '../DataTableExport'
import { formatPeriodShort } from '../../utils/format'
import {
  useCostSummary,
  useCostTrend,
  useCostByVehicle,
  useCostByDepartment,
} from '../../hooks/useReports'

// ─────────────────────────────────────────
// TAB: KEUANGAN
// ─────────────────────────────────────────

const ch = createColumnHelper<CostByVehicle>()

const vehicleColumns: ColumnDef<CostByVehicle, unknown>[] = [
  ch.accessor('name', {
    header: 'Kendaraan',
    cell: ({ row }) => (
      <div className="flex flex-col">
        <span className="text-sm font-medium text-[var(--text-primary)]">
          {row.original.name}
        </span>
        <span className="text-[11px] text-[var(--text-disabled)]">
          {row.original.plateNumber}
        </span>
      </div>
    ),
  }),
  ch.accessor('fuelCost', {
    header: 'BBM',
    size: 140,
    cell: ({ getValue }) => (
      <span className="text-sm text-[var(--text-secondary)]">{formatCurrency(getValue())}</span>
    ),
  }),
  ch.accessor('maintenanceCost', {
    header: 'Maintenance',
    size: 140,
    cell: ({ getValue }) => (
      <span className="text-sm text-[var(--text-secondary)]">{formatCurrency(getValue())}</span>
    ),
  }),
  ch.accessor('totalCost', {
    header: 'Total',
    size: 140,
    cell: ({ getValue }) => (
      <span className="text-sm font-semibold text-[var(--text-primary)]">
        {formatCurrency(getValue())}
      </span>
    ),
  }),
] as ColumnDef<CostByVehicle, unknown>[]

export const FinanceSection = ({ range }: { range: ReportDateParams }) => {
  const { data: cost } = useCostSummary(range)
  const { data: trend } = useCostTrend({ groupBy: 'monthly', periods: 6 })
  const { data: byVehicle, isLoading: loadingVehicle } = useCostByVehicle(range)
  const { data: byDept } = useCostByDepartment(range)

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <ReportStatCard
          label="Total BBM"
          value={cost ? formatCurrency(cost.totalFuelCost) : '—'}
          icon={<Fuel className="h-5 w-5 text-[var(--warning)]" />}
          iconBg="#FEF3C7"
          change={cost?.changePercent.fuel}
          changeLabel="vs periode lalu"
          goodDirection="down"
        />
        <ReportStatCard
          label="Total Maintenance"
          value={cost ? formatCurrency(cost.totalMaintenanceCost) : '—'}
          icon={<Wrench className="h-5 w-5 text-[var(--info)]" />}
          iconBg="#DBEAFE"
          change={cost?.changePercent.maintenance}
          changeLabel="vs periode lalu"
          goodDirection="down"
        />
        <ReportStatCard
          label="Total Biaya"
          value={cost ? formatCurrency(cost.totalCost) : '—'}
          icon={<Wallet className="h-5 w-5 text-[var(--primary)]" />}
          iconBg="var(--primary-light)"
          change={cost?.changePercent.total}
          changeLabel="vs periode lalu"
          goodDirection="down"
        />
      </div>

      <Card>
        <CardHeader title="Trend Biaya" description="6 bulan terakhir" />
        <TrendLineChart
          data={trend ?? []}
          xKey="period"
          formatX={formatPeriodShort}
          formatY={formatCurrency}
          lines={[
            { key: 'fuelCost', label: 'BBM', color: 'var(--warning)' },
            { key: 'maintenanceCost', label: 'Maintenance', color: 'var(--info)' },
            { key: 'totalCost', label: 'Total', color: 'var(--primary)' },
          ]}
        />
      </Card>

      <Card>
        <CardHeader
          title="Biaya per Kendaraan"
          action={
            <DataTableExport
              data={byVehicle ?? []}
              columns={[
                { key: 'name', label: 'Kendaraan' },
                { key: 'plateNumber', label: 'Plat' },
                { key: 'fuelCost', label: 'BBM' },
                { key: 'maintenanceCost', label: 'Maintenance' },
                { key: 'totalCost', label: 'Total' },
              ]}
              filename="biaya-per-kendaraan"
            />
          }
        />
        <DataTable
          data={byVehicle ?? []}
          columns={vehicleColumns}
          isLoading={loadingVehicle}
          emptyMessage="Belum ada data biaya kendaraan"
        />
      </Card>

      <Card>
        <CardHeader title="Biaya per Departemen" />
        <BarChartHorizontal
          data={byDept ?? []}
          nameKey="departmentName"
          valueKey="totalCost"
          formatValue={formatCurrency}
        />
      </Card>
    </div>
  )
}

'use client'

import { Fuel, Wrench, Wallet, TrendingUp, TrendingDown } from 'lucide-react'
import { Card, CardHeader } from '@/components/common'
import { DataTable, createColumnHelper, type ColumnDef } from '@/components/shared'
import { formatCurrency, formatOdometer, formatNumber } from '@/lib'
import { FUEL_GRADE_CONFIG } from '@/constants'
import type { ReportDateParams, CostByVehicle, FuelGrade } from '@/types'
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
        <span className="text-sm font-medium text-[var(--text-primary)]">{row.original.name}</span>
        <span className="text-[11px] text-[var(--text-disabled)]">{row.original.plateNumber}</span>
      </div>
    ),
  }),
  ch.accessor('fuelCost', {
    header: 'BBM',
    size: 130,
    cell: ({ getValue }) => (
      <span className="text-sm text-[var(--text-secondary)]">{formatCurrency(getValue())}</span>
    ),
  }),
  ch.accessor('maintenanceCost', {
    header: 'Maintenance',
    size: 130,
    cell: ({ getValue }) => (
      <span className="text-sm text-[var(--text-secondary)]">{formatCurrency(getValue())}</span>
    ),
  }),
  ch.accessor('totalCost', {
    header: 'Total',
    size: 130,
    cell: ({ getValue }) => (
      <span className="text-sm font-semibold text-[var(--text-primary)]">
        {formatCurrency(getValue())}
      </span>
    ),
  }),
  ch.accessor('totalKm', {
    header: 'Jarak',
    size: 110,
    cell: ({ getValue }) => (
      <span className="text-sm text-[var(--text-secondary)]">{formatOdometer(getValue())}</span>
    ),
  }),
  ch.accessor('avgCostPerKm', {
    header: 'Biaya/km',
    size: 120,
    cell: ({ getValue }) => (
      <span className="text-sm text-[var(--text-secondary)]">{formatCurrency(getValue())}</span>
    ),
  }),
] as ColumnDef<CostByVehicle, unknown>[]

// ─────────────────────────────────────────
// FUEL GRADE BREAKDOWN
// TODO [BACKEND]: endpoint report belum menyediakan agregasi per fuelGrade.
// Ganti dummy ini dengan fetch nyata (mis. useFuelGradeBreakdown(range))
// setelah backend menambahkan endpoint /reports/fuel-by-grade.
// ─────────────────────────────────────────

interface FuelGradeRow {
  grade: FuelGrade
  amount: number // liter atau kWh
  totalCost: number
  avgPrice: number
}

const FUEL_GRADE_BREAKDOWN_DUMMY: FuelGradeRow[] = [
  { grade: 'PERTALITE', amount: 1250, totalCost: 12_500_000, avgPrice: 10_000 },
  { grade: 'PERTAMAX', amount: 480, totalCost: 6_240_000, avgPrice: 13_000 },
  { grade: 'SOLAR', amount: 620, totalCost: 4_340_000, avgPrice: 7_000 },
  { grade: 'LISTRIK', amount: 340, totalCost: 850_000, avgPrice: 2_500 },
]

// TODO [BACKEND]: konsumsi rata-rata belum tersedia dari API.
const CONSUMPTION_DUMMY = { bbmKmPerLiter: 11.2, listrikKmPerKwh: 6.5 }

export const FinanceSection = ({ range }: { range: ReportDateParams }) => {
  const { data: cost } = useCostSummary(range)
  const { data: trend } = useCostTrend({ groupBy: 'monthly', periods: 6 })
  const { data: byVehicle, isLoading: loadingVehicle } = useCostByVehicle(range)
  const { data: byDept } = useCostByDepartment(range)

  // Kendaraan paling boros vs paling hemat (dari biaya/km)
  const withKm = (byVehicle ?? []).filter((v) => v.totalKm > 0)
  const mostBoros =
    withKm.length > 0
      ? withKm.reduce((a, b) => (b.avgCostPerKm > a.avgCostPerKm ? b : a))
      : null
  const mostHemat =
    withKm.length > 0
      ? withKm.reduce((a, b) => (b.avgCostPerKm < a.avgCostPerKm ? b : a))
      : null

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
                { key: 'totalKm', label: 'Jarak (km)' },
                { key: 'avgCostPerKm', label: 'Biaya/km' },
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

      {/* Pengeluaran per jenis BBM — TODO [BACKEND] (data dummy) */}
      <Card>
        <CardHeader
          title="Pengeluaran per Jenis BBM"
          description="Agregasi biaya per grade bahan bakar"
        />
        <div className="overflow-hidden rounded-xl border border-[var(--border-card)]">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border-card)] text-left">
                {['Jenis', 'Jumlah', 'Total Biaya', 'Rata-rata Harga'].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--text-secondary)]"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {FUEL_GRADE_BREAKDOWN_DUMMY.map((row) => {
                const cfg = FUEL_GRADE_CONFIG[row.grade]
                return (
                  <tr
                    key={row.grade}
                    className="border-b border-[var(--border-divider)] last:border-0"
                  >
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-2 font-medium text-[var(--text-primary)]">
                        <span
                          className="h-2.5 w-2.5 rounded-full"
                          style={{ backgroundColor: cfg.color }}
                        />
                        {cfg.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[var(--text-secondary)]">
                      {formatNumber(row.amount)} {cfg.unit}
                    </td>
                    <td className="px-4 py-3 font-medium text-[var(--text-primary)]">
                      {formatCurrency(row.totalCost)}
                    </td>
                    <td className="px-4 py-3 text-[var(--text-secondary)]">
                      {formatCurrency(row.avgPrice)} / {cfg.unit}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Konsumsi & efisiensi */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader
            title="Perbandingan Konsumsi"
            description="Efisiensi energi per jenis"
          />
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-xl border border-[var(--border-divider)] bg-[var(--bg-subtle)] p-4">
              <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--text-secondary)]">
                BBM
              </p>
              <p
                className="mt-1 text-2xl font-bold text-[var(--text-primary)]"
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
              >
                {CONSUMPTION_DUMMY.bbmKmPerLiter} km/L
              </p>
            </div>
            <div className="rounded-xl border border-[var(--border-divider)] bg-[var(--bg-subtle)] p-4">
              <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--text-secondary)]">
                Listrik
              </p>
              <p
                className="mt-1 text-2xl font-bold text-[var(--text-primary)]"
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
              >
                {CONSUMPTION_DUMMY.listrikKmPerKwh} km/kWh
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <CardHeader
            title="Efisiensi Kendaraan"
            description="Berdasarkan biaya per km"
          />
          <div className="space-y-3">
            <div className="flex items-center gap-3 rounded-xl border border-red-100 bg-red-50 px-4 py-3">
              <TrendingUp className="h-5 w-5 shrink-0 text-[var(--danger)]" />
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--text-secondary)]">
                  Paling Boros
                </p>
                <p className="truncate text-sm font-semibold text-[var(--text-primary)]">
                  {mostBoros ? mostBoros.name : '—'}
                </p>
              </div>
              {mostBoros && (
                <span className="shrink-0 text-sm font-semibold text-[var(--danger)]">
                  {formatCurrency(mostBoros.avgCostPerKm)}/km
                </span>
              )}
            </div>
            <div className="flex items-center gap-3 rounded-xl border border-green-100 bg-green-50 px-4 py-3">
              <TrendingDown className="h-5 w-5 shrink-0 text-[var(--success)]" />
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--text-secondary)]">
                  Paling Hemat
                </p>
                <p className="truncate text-sm font-semibold text-[var(--text-primary)]">
                  {mostHemat ? mostHemat.name : '—'}
                </p>
              </div>
              {mostHemat && (
                <span className="shrink-0 text-sm font-semibold text-[var(--success)]">
                  {formatCurrency(mostHemat.avgCostPerKm)}/km
                </span>
              )}
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}

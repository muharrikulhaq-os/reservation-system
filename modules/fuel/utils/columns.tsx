'use client'

import { useState } from 'react'
import { Eye, Fuel, Trash2, Zap } from 'lucide-react'
import {
  createColumnHelper,
  type ColumnDef,
} from '@/components/shared/table/DataTable'
import { AppButton } from '@/components/ui-custom'
import { AdminOnly } from '@/components/common'
import { formatDate, formatCurrency, formatNumber } from '@/lib'
import { ENERGY_TYPE, ENERGY_TYPE_CONFIG } from '@/constants'
import { useVehicles } from '@/modules/vehicles/hooks/useVehicles'
import { useDeleteFuel } from '../hooks/useFuel'
import { FuelDetailModal } from '../components/FuelDetailModal'
import type { FuelExpense } from '@/types'

const ch = createColumnHelper<FuelExpense>()

// Response fuel hanya punya vehicleId → lookup nama dari cache vehicles
const VehicleCell = ({ vehicleId }: { vehicleId: number }) => {
  const { data: vehicles } = useVehicles({ limit: 100 })
  const v = (vehicles ?? []).find((x) => x.id === vehicleId)
  return (
    <div className="min-w-0">
      <p className="truncate text-sm font-medium text-[var(--text-primary)]">
        {v?.name ?? `#${vehicleId}`}
      </p>
      {v?.plateNumber && (
        <p className="truncate text-xs text-[var(--text-secondary)]">{v.plateNumber}</p>
      )}
    </div>
  )
}

const EnergyBadge = ({ energyType }: { energyType: FuelExpense['fuelType'] }) => {
  const cfg = ENERGY_TYPE_CONFIG[energyType]
  // Fallback jika API mengirim nilai di luar BBM/LISTRIK (atau null)
  if (!cfg) {
    return (
      <span className="inline-flex items-center rounded-full bg-[var(--bg-subtle)] px-2 py-0.5 text-[10px] font-semibold text-[var(--text-secondary)]">
        {energyType ?? '-'}
      </span>
    )
  }
  const isBbm = energyType === ENERGY_TYPE.BBM
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold"
      style={{ backgroundColor: `${cfg.color}1A`, color: cfg.color }}
    >
      {isBbm ? <Fuel className="h-2.5 w-2.5" /> : <Zap className="h-2.5 w-2.5" />}
      {cfg.label}
    </span>
  )
}

const RowActions = ({ row }: { row: FuelExpense }) => {
  const del = useDeleteFuel()
  const [detailOpen, setDetailOpen] = useState(false)
  const handleDelete = () => {
    if (window.confirm('Hapus catatan pengisian ini?')) del.mutate(row.id)
  }
  return (
    <div className="flex items-center justify-end">
      <AppButton
        variant="ghost"
        size="icon-sm"
        onClick={() => setDetailOpen(true)}
        aria-label="Lihat detail"
      >
        <Eye className="h-4 w-4" />
      </AppButton>
      <AdminOnly>
        <AppButton
          variant="ghost"
          size="icon-sm"
          loading={del.isPending}
          onClick={handleDelete}
          aria-label="Hapus"
          className="text-[var(--danger)] hover:text-[var(--danger)]"
        >
          <Trash2 className="h-4 w-4" />
        </AppButton>
      </AdminOnly>
      <FuelDetailModal fuel={row} open={detailOpen} onOpenChange={setDetailOpen} />
    </div>
  )
}

export const fuelColumns: ColumnDef<FuelExpense, unknown>[] = [
  ch.accessor('createdAt', {
    header: 'Tanggal',
    size: 120,
    cell: ({ getValue }) => (
      <span className="text-sm text-[var(--text-secondary)]">
        {formatDate(getValue())}
      </span>
    ),
  }),

  ch.accessor('vehicleId', {
    header: 'Kendaraan',
    cell: ({ getValue }) => <VehicleCell vehicleId={getValue()} />,
  }),

  ch.accessor('driverName', {
    header: 'Driver',
    size: 160,
    cell: ({ getValue }) => (
      <span className="text-sm text-[var(--text-primary)]">{getValue()}</span>
    ),
  }),

  ch.accessor('fuelType', {
    header: 'Jenis',
    size: 110,
    cell: ({ getValue }) => <EnergyBadge energyType={getValue()} />,
  }),

  ch.display({
    id: 'jumlah',
    header: 'Jumlah',
    size: 100,
    cell: ({ row }) => {
      const f = row.original
      // Tidak bergantung pada fuelType — pilih berdasarkan field yang terisi
      const text =
        f.liter != null
          ? `${formatNumber(f.liter)} L`
          : f.kwh != null
            ? `${formatNumber(f.kwh)} kWh`
            : '-'
      return <span className="text-sm text-[var(--text-primary)]">{text}</span>
    },
  }),

  ch.display({
    id: 'harga',
    header: 'Harga/Unit',
    size: 120,
    cell: ({ row }) => {
      const f = row.original
      const price = f.pricePerLiter ?? f.pricePerKwh
      return (
        <span className="text-sm text-[var(--text-secondary)]">
          {formatCurrency(price ?? 0)}
        </span>
      )
    },
  }),

  ch.accessor('totalCost', {
    header: 'Total',
    size: 120,
    cell: ({ getValue }) => (
      <span className="text-sm font-medium text-[var(--text-primary)]">
        {formatCurrency(getValue())}
      </span>
    ),
  }),

  ch.display({
    id: 'odometer',
    header: 'Odometer',
    size: 140,
    cell: ({ row }) => {
      const f = row.original
      if (f.odometerBefore == null && f.odometerAfter == null) {
        return <span className="text-xs text-[var(--text-disabled)]">—</span>
      }
      return (
        <span className="text-xs text-[var(--text-secondary)]">
          {formatNumber(f.odometerBefore ?? 0)} → {formatNumber(f.odometerAfter ?? 0)}
        </span>
      )
    },
  }),

  ch.display({
    id: 'actions',
    size: 70,
    header: '',
    cell: ({ row }) => <RowActions row={row.original} />,
  }),
] as ColumnDef<FuelExpense, unknown>[]

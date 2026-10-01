'use client'

import { useState } from 'react'
import { Ban, Eye, Fuel, Ticket, Zap } from 'lucide-react'
import {
  createColumnHelper,
  type ColumnDef,
} from '@/components/shared/table/DataTable'
import { AppButton } from '@/components/ui-custom'
import { AdminOnly } from '@/components/common'
import { formatDate, formatCurrency, formatNumber } from '@/lib'
import { ENERGY_TYPE, ENERGY_TYPE_CONFIG } from '@/constants'
import { useVehicles } from '@/modules/vehicles/hooks/useVehicles'
import { FuelDetailModal } from '../components/FuelDetailModal'
import { VoidFuelModal } from '../components/VoidFuelModal'
import { FUEL_REASON_LABEL } from './format'
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
  const [detailOpen, setDetailOpen] = useState(false)
  const [voidOpen, setVoidOpen] = useState(false)
  // Catatan dari voucher dibatalkan lewat menu Voucher; yang sudah batal tidak bisa lagi.
  const canVoid = row.status !== 'VOID' && row.source !== 'VOUCHER'
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
      {canVoid && (
        <AdminOnly>
          <AppButton
            variant="ghost"
            size="icon-sm"
            onClick={() => setVoidOpen(true)}
            aria-label="Batalkan"
            title="Batalkan catatan"
            className="text-[var(--danger)] hover:text-[var(--danger)]"
          >
            <Ban className="h-4 w-4" />
          </AppButton>
          <VoidFuelModal fuel={row} open={voidOpen} onOpenChange={setVoidOpen} />
        </AdminOnly>
      )}
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
    id: 'vehicleName',
    header: 'Kendaraan',
    cell: ({ getValue }) => <VehicleCell vehicleId={getValue()} />,
  }),

  ch.display({
    id: 'source',
    header: 'Sumber',
    size: 150,
    enableSorting: false,
    cell: ({ row }) => {
      const f = row.original
      const isVoid = f.status === 'VOID'
      return (
        <div className="min-w-0">
          {f.source === 'VOUCHER' ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-blue-700">
              <Ticket className="h-2.5 w-2.5" /> {f.voucherCode ?? 'Voucher'}
            </span>
          ) : (
            <span className="inline-flex rounded-full bg-[var(--bg-subtle)] px-2 py-0.5 text-[10px] font-semibold text-[var(--text-secondary)]">
              Isi langsung{f.reason ? ` · ${FUEL_REASON_LABEL[f.reason] ?? f.reason}` : ''}
            </span>
          )}
          {f.stationName && (
            <p className="mt-0.5 truncate text-xs text-[var(--text-secondary)]">{f.stationName}</p>
          )}
          {isVoid && (
            <span className="mt-0.5 inline-flex rounded-full bg-red-50 px-2 py-0.5 text-[10px] font-semibold text-red-600">
              Dibatalkan
            </span>
          )}
        </div>
      )
    },
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
    enableSorting: false,
    cell: ({ row }) => {
      const f = row.original
      const text =
        f.fuelType === ENERGY_TYPE.BBM
          ? `${formatNumber(f.liter ?? 0)} L`
          : f.fuelType === ENERGY_TYPE.LISTRIK
            ? `${formatNumber(f.kwh ?? 0)} kWh`
            : '-'
      return <span className="text-sm text-[var(--text-primary)]">{text}</span>
    },
  }),

  ch.display({
    id: 'harga',
    header: 'Harga/Unit',
    size: 120,
    enableSorting: false,
    cell: ({ row }) => {
      const f = row.original
      const price = f.fuelType === ENERGY_TYPE.LISTRIK ? (f.pricePerKwh ?? 0) : (f.pricePerLiter ?? 0)
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
    cell: ({ getValue, row }) => (
      <span
        className={`text-sm font-medium text-[var(--text-primary)] ${row.original.status === 'VOID' ? 'line-through opacity-50' : ''}`}
      >
        {formatCurrency(getValue())}
      </span>
    ),
  }),

  ch.display({
    id: 'odometer',
    header: 'Odometer',
    size: 140,
    enableSorting: false,
    cell: ({ row }) => {
      const f = row.original
      if (f.odometerBefore == null && f.odometerAfter == null) {
        return <span className="text-xs text-[var(--text-disabled)]">-</span>
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
    enableSorting: false,
    cell: ({ row }) => <RowActions row={row.original} />,
  }),
] as ColumnDef<FuelExpense, unknown>[]

'use client'

import { Trash2 } from 'lucide-react'
import {
  createColumnHelper,
  type ColumnDef,
} from '@/components/shared/table/DataTable'
import { AppButton } from '@/components/ui-custom'
import {
  formatDate,
  formatCurrency,
  formatLiter,
  formatKwh,
  formatNumber,
  resolveFileUrl,
} from '@/lib'
import { FUEL_GRADE_CONFIG, FUEL_TYPE } from '@/constants'
import { useDeleteFuel } from '../hooks/useFuel'
import type { FuelExpense } from '@/types'

const ch = createColumnHelper<FuelExpense>()

// ── Row actions (delete) ─────────────────

const RowActions = ({ row }: { row: FuelExpense }) => {
  const { mutate, isPending } = useDeleteFuel()

  const handleDelete = () => {
    if (window.confirm('Hapus catatan pengisian ini?')) mutate(row.id)
  }

  return (
    <div className="flex items-center justify-end">
      <AppButton
        variant="ghost"
        size="icon-sm"
        loading={isPending}
        onClick={handleDelete}
        aria-label="Hapus"
        className="text-[var(--danger)] hover:text-[var(--danger)]"
      >
        <Trash2 className="h-4 w-4" />
      </AppButton>
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

  ch.accessor('vehicle', {
    header: 'Kendaraan',
    cell: ({ getValue }) => {
      const v = getValue()
      return (
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-[var(--text-primary)]">
            {v?.name ?? '-'}
          </p>
          <p className="truncate text-xs text-[var(--text-secondary)]">
            {v?.plateNumber ?? '-'}
          </p>
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

  ch.accessor('fuelGrade', {
    header: 'Jenis',
    size: 150,
    cell: ({ getValue }) => {
      const grade = getValue()
      const cfg = FUEL_GRADE_CONFIG[grade]
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--bg-subtle)] px-2.5 py-0.5 text-xs font-semibold text-[var(--text-primary)]">
          <span
            className="h-2 w-2 rounded-full"
            style={{ backgroundColor: cfg?.color }}
          />
          {cfg?.label ?? grade}
        </span>
      )
    },
  }),

  ch.display({
    id: 'amount',
    header: 'Jumlah',
    size: 110,
    cell: ({ row }) => {
      const f = row.original
      const text =
        f.fuelType === FUEL_TYPE.BBM
          ? formatLiter(f.liter ?? 0)
          : formatKwh(f.kwh ?? 0)
      return <span className="text-sm text-[var(--text-primary)]">{text}</span>
    },
  }),

  ch.accessor('totalCost', {
    header: 'Total',
    size: 130,
    cell: ({ getValue }) => (
      <span className="text-sm font-medium text-[var(--text-primary)]">
        {formatCurrency(getValue())}
      </span>
    ),
  }),

  ch.accessor('distanceKm', {
    header: 'Jarak',
    size: 100,
    cell: ({ getValue }) => (
      <span className="text-sm text-[var(--text-secondary)]">
        {formatNumber(getValue() ?? 0)} km
      </span>
    ),
  }),

  ch.accessor('proofPhotoUrl', {
    header: 'Bukti',
    size: 80,
    cell: ({ getValue }) => {
      const url = resolveFileUrl(getValue())
      if (!url)
        return <span className="text-xs text-[var(--text-disabled)]">—</span>
      return (
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="block h-9 w-9 overflow-hidden rounded-lg border border-[var(--border-card)]"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={url} alt="Bukti" className="h-full w-full object-cover" />
        </a>
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

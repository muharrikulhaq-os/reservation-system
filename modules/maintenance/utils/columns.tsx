'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Car, CheckCircle2, Eye } from 'lucide-react'
import {
  createColumnHelper,
  type ColumnDef,
} from '@/components/shared/table/DataTable'
import { AppButton } from '@/components/ui-custom'
import { formatDate, formatCurrency } from '@/lib'
import {
  isMaintenanceCompleted,
  maintenanceStatusCfg,
  maintenanceTypeLabel,
} from '@/constants'
import { CompleteMaintenanceModal } from '../components/CompleteMaintenanceModal'
import type { MaintenanceRecord } from '@/types'

const ch = createColumnHelper<MaintenanceRecord>()

const StatusBadge = ({ status }: { status: string }) => {
  const cfg = maintenanceStatusCfg(status)
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold"
      style={{ backgroundColor: cfg.bg, color: cfg.text }}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: cfg.dot }} />
      {cfg.label}
    </span>
  )
}

const RowActions = ({ row }: { row: MaintenanceRecord }) => {
  const [open, setOpen] = useState(false)
  const isOngoing = !isMaintenanceCompleted(row.status)

  return (
    <div className="flex items-center justify-end gap-1">
      <Link href={`/maintenance/${row.id}`} aria-label="Lihat detail">
        <AppButton variant="ghost" size="icon-sm">
          <Eye className="h-4 w-4" />
        </AppButton>
      </Link>

      {isOngoing && (
        <>
          <AppButton
            variant="ghost"
            size="icon-sm"
            onClick={() => setOpen(true)}
            aria-label="Selesaikan maintenance"
            className="text-[var(--success)] hover:text-[var(--success)]"
          >
            <CheckCircle2 className="h-4 w-4" />
          </AppButton>
          <CompleteMaintenanceModal
            maintenance={row}
            open={open}
            onOpenChange={setOpen}
          />
        </>
      )}
    </div>
  )
}

export const maintenanceColumns: ColumnDef<MaintenanceRecord, unknown>[] = [
  ch.accessor('vehicleName', {
    header: 'Kendaraan',
    cell: ({ row }) => (
      <div className="flex items-center gap-2.5">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--bg-subtle)] text-[var(--text-secondary)]">
          <Car className="h-4 w-4" />
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-[var(--text-primary)]">
            {row.original.vehicleName}
          </p>
          <p className="text-xs text-[var(--text-secondary)]">
            {row.original.plateNumber}
          </p>
        </div>
      </div>
    ),
  }),

  ch.accessor('type', {
    header: 'Tipe',
    size: 130,
    cell: ({ getValue }) => (
      <span className="rounded-full bg-[var(--bg-subtle)] px-2.5 py-0.5 text-xs font-semibold text-[var(--text-primary)]">
        {maintenanceTypeLabel(getValue())}
      </span>
    ),
  }),

  ch.accessor('description', {
    header: 'Deskripsi',
    cell: ({ getValue }) => (
      <span className="line-clamp-1 max-w-[220px] text-sm text-[var(--text-secondary)]">
        {getValue()}
      </span>
    ),
  }),

  ch.accessor('status', {
    header: 'Status',
    size: 130,
    cell: ({ getValue }) => <StatusBadge status={getValue()} />,
  }),

  ch.accessor('startDate', {
    header: 'Mulai',
    size: 120,
    cell: ({ getValue }) => (
      <span className="text-sm text-[var(--text-secondary)]">
        {formatDate(getValue())}
      </span>
    ),
  }),

  ch.accessor('totalCost', {
    header: 'Biaya',
    size: 130,
    cell: ({ getValue }) => {
      const v = getValue()
      const num = v != null && v !== '' ? Number(v) : null
      return (
        <span className="text-sm font-medium text-[var(--text-primary)]">
          {num != null && !Number.isNaN(num) ? formatCurrency(num) : '-'}
        </span>
      )
    },
  }),

  ch.accessor('createdBy', {
    header: 'Dicatat',
    size: 140,
    cell: ({ getValue }) => (
      <span className="text-sm text-[var(--text-secondary)]">{getValue() ?? '-'}</span>
    ),
  }),

  ch.display({
    id: 'actions',
    size: 100,
    header: '',
    cell: ({ row }) => <RowActions row={row.original} />,
  }),
] as ColumnDef<MaintenanceRecord, unknown>[]

'use client'

import Link from 'next/link'
import { Car, Eye } from 'lucide-react'
import { createColumnHelper, type ColumnDef } from '@/components/shared/table/DataTable'
import { AppButton } from '@/components/ui-custom'
import { SafeImage } from '@/components/shared/media/SafeImage'
import { formatDate, formatCurrency, resolveFileUrl } from '@/lib'
import type { MaintenanceRecord } from '@/types'
import { MaintenanceStatusBadge } from '../components/shared'

const ch = createColumnHelper<MaintenanceRecord>()

/** Tanggal paling relevan untuk status saat ini. */
const keyDate = (m: MaintenanceRecord) => {
  switch (m.status) {
    case 'COMPLETED':
      return { label: 'Kembali', value: m.return?.at ?? m.completedAt }
    case 'IN_PROGRESS':
      return { label: 'Diserahkan', value: m.handover?.at ?? null }
    case 'SCHEDULED':
      return { label: 'Jadwal', value: m.scheduledDate }
    case 'CANCELLED':
      return { label: 'Dibatalkan', value: m.cancelledAt }
    default:
      return { label: 'Rencana', value: m.plannedDate }
  }
}

export const maintenanceColumns: ColumnDef<MaintenanceRecord, unknown>[] = [
  ch.accessor('plateNumber', {
    header: 'Kendaraan',
    cell: ({ row }) => {
      const m = row.original
      return (
        <div className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-[var(--bg-subtle)] text-[var(--text-secondary)]">
            <SafeImage
              src={resolveFileUrl(m.vehicle.photoUrl)}
              alt={m.vehicle.name}
              className="h-full w-full object-cover"
              fallback={<Car className="h-4 w-4" />}
            />
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-[var(--text-primary)]">{m.vehicle.plateNumber}</p>
            <p className="truncate text-xs text-[var(--text-secondary)]">
              {m.vehicle.name}
              {m.vehicle.ownership === 'VENDOR' && ' · Sewa'}
            </p>
          </div>
        </div>
      )
    },
  }) as ColumnDef<MaintenanceRecord, unknown>,
  ch.accessor('requestNo', {
    header: 'No. Surat',
    cell: ({ row }) => (
      <div className="min-w-0">
        <p className="text-sm text-[var(--text-primary)]">{row.original.requestNo ?? '—'}</p>
        <p className="text-xs text-[var(--text-secondary)]">{row.original.categoryLabel}</p>
      </div>
    ),
  }) as ColumnDef<MaintenanceRecord, unknown>,
  ch.display({
    id: 'vendor',
    header: 'Vendor',
    cell: ({ row }) => (
      <span className="text-sm text-[var(--text-primary)]">{row.original.vendorName ?? '—'}</span>
    ),
  }) as ColumnDef<MaintenanceRecord, unknown>,
  ch.accessor('status', {
    header: 'Status',
    cell: ({ row }) => <MaintenanceStatusBadge status={row.original.status} />,
  }) as ColumnDef<MaintenanceRecord, unknown>,
  ch.display({
    id: 'date',
    header: 'Tanggal',
    cell: ({ row }) => {
      const d = keyDate(row.original)
      return (
        <div className="text-sm">
          <p className="text-[var(--text-primary)]">{d.value ? formatDate(d.value) : '—'}</p>
          <p className="text-xs text-[var(--text-secondary)]">{d.label}</p>
        </div>
      )
    },
  }) as ColumnDef<MaintenanceRecord, unknown>,
  ch.accessor('actualCost', {
    id: 'totalCost', // kunci urut backend
    header: 'Biaya',
    cell: ({ row }) => {
      const m = row.original
      const v = m.actualCost ?? m.estimatedCost
      return (
        <div className="text-sm">
          <p className="text-[var(--text-primary)]">{v != null ? formatCurrency(v) : '—'}</p>
          {m.actualCost == null && m.estimatedCost != null && (
            <p className="text-xs text-[var(--text-secondary)]">estimasi</p>
          )}
        </div>
      )
    },
  }) as ColumnDef<MaintenanceRecord, unknown>,
  ch.display({
    id: 'actions',
    header: '',
    cell: ({ row }) => (
      <div className="flex justify-end">
        <Link href={`/maintenance/${row.original.id}`} aria-label="Lihat detail">
          <AppButton variant="ghost" size="icon-sm">
            <Eye className="h-4 w-4" />
          </AppButton>
        </Link>
      </div>
    ),
  }) as ColumnDef<MaintenanceRecord, unknown>,
]

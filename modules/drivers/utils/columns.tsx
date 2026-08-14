'use client'

import { useState } from 'react'
import { Eye } from 'lucide-react'
import { UserAvatar } from '@/components/shared/avatar/Avatar'
import { Badge } from '@/components/shared/badge/StatusBadge'
import { AppButton } from '@/components/ui-custom'
import { createColumnHelper, type ColumnDef } from '@/components/shared/table/DataTable'
import type { Driver } from '@/types'
import { DriverDetailModal } from '../components/DriverDetailModal'

// ─────────────────────────────────────────
// DRIVER COLUMNS
// Jembatan antara <DataTable/> dan data Driver.
// ─────────────────────────────────────────

const ch = createColumnHelper<Driver>()

const DriverRowActions = ({ driver }: { driver: Driver }) => {
  const [open, setOpen] = useState(false)
  return (
    <div className="flex items-center justify-end">
      <AppButton
        variant="ghost"
        size="icon-sm"
        onClick={() => setOpen(true)}
        aria-label="Lihat detail"
      >
        <Eye className="h-4 w-4" />
      </AppButton>
      <DriverDetailModal driver={driver} open={open} onOpenChange={setOpen} />
    </div>
  )
}

export const driverColumns: ColumnDef<Driver, unknown>[] = [
  ch.accessor('name', {
    header: 'Driver',
    size: 240,
    cell: ({ row }) => (
      <div className="flex items-center gap-2.5">
        <UserAvatar name={row.original.name} photo={row.original.profilePhoto} size="sm" />
        <div className="flex flex-col">
          <span className="text-sm font-medium text-[var(--text-primary)]">
            {row.original.name}
          </span>
          <span className="text-[11px] text-[var(--text-disabled)]">
            {row.original.email}
          </span>
        </div>
      </div>
    ),
  }),

  ch.accessor('employeeId', {
    header: 'ID Karyawan',
    size: 130,
    cell: ({ getValue }) => (
      <span className="text-sm text-[var(--text-secondary)]">{getValue()}</span>
    ),
  }),

  ch.accessor('phoneNumber', {
    header: 'Telepon',
    size: 140,
    cell: ({ getValue }) => (
      <span className="text-sm text-[var(--text-secondary)]">{getValue()}</span>
    ),
  }),

  ch.accessor('assignedPlate', {
    header: 'Kendaraan',
    size: 130,
    cell: ({ getValue }) => {
      const plate = getValue()
      return plate ? (
        <span className="rounded-md bg-[var(--bg-subtle)] px-2 py-0.5 text-xs font-semibold text-[var(--text-primary)]">
          {plate}
        </span>
      ) : (
        <span className="text-xs text-[var(--text-disabled)]">-</span>
      )
    },
  }),

  ch.accessor('isActive', {
    header: 'Status',
    size: 110,
    cell: ({ getValue }) =>
      getValue() ? (
        <Badge variant="success">Aktif</Badge>
      ) : (
        <Badge variant="muted">Nonaktif</Badge>
      ),
  }),

  ch.display({
    id: 'actions',
    size: 70,
    header: '',
    cell: ({ row }) => <DriverRowActions driver={row.original} />,
  }),
] as ColumnDef<Driver, unknown>[]

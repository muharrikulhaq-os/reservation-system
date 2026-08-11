'use client'

import Link from 'next/link'
import { useVehiclesPaginated } from '@/modules/vehicles/hooks/useVehicles'
import { DataTable } from '@/components/shared/table/DataTable'
import { createColumnHelper, type ColumnDef } from '@/components/shared/table/DataTable'
import type { Vehicle } from '@/types'
import { ResourceStatusBadge } from '@/components/shared/badge/StatusBadge'

const ch = createColumnHelper<Vehicle>()

const availableVehicleColumns: ColumnDef<Vehicle, unknown>[] = [
  ch.accessor('name', {
    header: 'Kendaraan',
    cell: ({ getValue }) => <span className="text-sm font-medium">{getValue()}</span>,
  }),
  ch.accessor('plateNumber', {
    header: 'Plat Nomor',
  }),
  ch.accessor('status', {
    header: 'Status',
    cell: ({ getValue }) => <ResourceStatusBadge status={getValue()} />,
  }),
  ch.display({
    id: 'actions',
    size: 60,
    header: '',
    cell: ({ row }) => (
      <Link href={`/vehicles/${row.original.id}`} className="text-xs font-medium text-[var(--primary)] hover:underline">
        Detail
      </Link>
    ),
  }),
] as ColumnDef<Vehicle, unknown>[]

export const AvailableVehicleTable = () => {
  const { data, isLoading } = useVehiclesPaginated({ limit: 5, page: 1, status: 'AVAILABLE' })

  return (
    <div className="rounded-xl border border-[var(--border-card)] bg-[var(--bg-card)] p-5 shadow-[var(--shadow-card)]">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-base font-bold text-[var(--text-primary)]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
          Kendaraan Tersedia
        </h2>
        <Link href="/vehicles" className="text-sm font-semibold text-[var(--primary)] hover:underline">
          Lihat Semua
        </Link>
      </div>
      <DataTable
        data={data?.data ?? []}
        columns={availableVehicleColumns}
        isLoading={isLoading}
        emptyMessage="Tidak ada kendaraan tersedia"
      />
    </div>
  )
}

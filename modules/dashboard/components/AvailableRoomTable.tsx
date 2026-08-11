'use client'

import Link from 'next/link'
import { useRoomsPaginated } from '@/modules/rooms/hooks/useRooms'
import { DataTable } from '@/components/shared/table/DataTable'
import { createColumnHelper, type ColumnDef } from '@/components/shared/table/DataTable'
import type { Room } from '@/types'
import { ResourceStatusBadge } from '@/components/shared/badge/StatusBadge'

const ch = createColumnHelper<Room>()

const availableRoomColumns: ColumnDef<Room, unknown>[] = [
  ch.accessor('name', {
    header: 'Ruangan',
    cell: ({ getValue }) => <span className="text-sm font-medium">{getValue()}</span>,
  }),
  ch.accessor('location', {
    header: 'Lokasi',
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
      <Link href={`/rooms/${row.original.id}`} className="text-xs font-medium text-[var(--primary)] hover:underline">
        Detail
      </Link>
    ),
  }),
] as ColumnDef<Room, unknown>[]

export const AvailableRoomTable = () => {
  const { data, isLoading } = useRoomsPaginated({ limit: 5, page: 1, status: 'AVAILABLE' })

  return (
    <div className="rounded-xl border border-[var(--border-card)] bg-[var(--bg-card)] p-5 shadow-[var(--shadow-card)]">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-base font-bold text-[var(--text-primary)]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
          Ruangan Tersedia
        </h2>
        <Link href="/rooms" className="text-sm font-semibold text-[var(--primary)] hover:underline">
          Lihat Semua
        </Link>
      </div>
      <DataTable
        data={data?.data ?? []}
        columns={availableRoomColumns}
        isLoading={isLoading}
        emptyMessage="Tidak ada ruangan tersedia"
      />
    </div>
  )
}

'use client'

import { useState } from 'react'
import { Search } from 'lucide-react'
import { Card, CardHeader } from '@/components/common'
import { DataTable, createColumnHelper, type ColumnDef, Badge } from '@/components/shared'
import { InputSelect } from '@/components/ui-custom'
import { useDebounce } from '@/hooks'
import { formatDateTime } from '@/lib'
import type { AuditLog } from '@/types'
import { useAuditLogs } from '../../hooks/useReports'

// ─────────────────────────────────────────
// TAB: AUDIT LOG
// ─────────────────────────────────────────

const ENTITY_OPTIONS = [
  { label: 'Semua Entitas', value: '' },
  { label: 'Booking', value: 'Booking' },
  { label: 'Vehicle', value: 'Vehicle' },
  { label: 'Room', value: 'Room' },
  { label: 'User', value: 'User' },
  { label: 'Driver', value: 'Driver' },
  { label: 'Maintenance', value: 'Maintenance' },
  { label: 'FuelExpense', value: 'FuelExpense' },
]

const ch = createColumnHelper<AuditLog>()

const auditColumns: ColumnDef<AuditLog, unknown>[] = [
  ch.accessor('createdAt', {
    header: 'Waktu',
    size: 170,
    cell: ({ getValue }) => (
      <span className="text-sm text-[var(--text-secondary)]">{formatDateTime(getValue())}</span>
    ),
  }),
  ch.accessor('userName', {
    header: 'User',
    size: 160,
    cell: ({ getValue }) => (
      <span className="text-sm font-medium text-[var(--text-primary)]">
        {getValue() ?? 'Sistem'}
      </span>
    ),
  }),
  ch.accessor('action', {
    header: 'Aksi',
    size: 140,
    cell: ({ getValue }) => <Badge variant="info">{getValue()}</Badge>,
  }),
  ch.accessor('entityType', {
    header: 'Entitas',
    size: 130,
    cell: ({ getValue }) => (
      <span className="text-sm text-[var(--text-secondary)]">{getValue()}</span>
    ),
  }),
  ch.accessor('description', {
    header: 'Deskripsi',
    cell: ({ getValue }) => (
      <span className="text-sm text-[var(--text-secondary)]">{getValue() ?? '—'}</span>
    ),
  }),
] as ColumnDef<AuditLog, unknown>[]

export const AuditSection = () => {
  const [page, setPage] = useState(1)
  const [entityType, setEntityType] = useState('')
  const [userSearch, setUserSearch] = useState('')
  const userSearchDebounced = useDebounce(userSearch)

  const userId = Number(userSearchDebounced.trim())
  const { data, isLoading } = useAuditLogs({
    page,
    limit: 20,
    entityType: entityType || undefined,
    userId: Number.isFinite(userId) && userId > 0 ? userId : undefined,
  })

  return (
    <Card>
      <CardHeader title="Audit Log" description="Jejak aktivitas sistem" />

      <div className="mb-4 flex flex-wrap items-end gap-3">
        <div className="w-52">
          <InputSelect
            label="ENTITAS"
            options={ENTITY_OPTIONS}
            value={entityType}
            onChange={(e) => {
              setEntityType(e.target.value)
              setPage(1)
            }}
          />
        </div>
        <div className="w-52">
          <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.06em] text-[var(--text-secondary)]">
            USER ID
          </label>
          <div className="relative">
            <Search className="pointer-events-none absolute inset-y-0 left-3 my-auto h-4 w-4 text-[var(--text-disabled)]" />
            <input
              value={userSearch}
              onChange={(e) => {
                setUserSearch(e.target.value)
                setPage(1)
              }}
              inputMode="numeric"
              placeholder="Cari berdasarkan ID..."
              className="h-10 w-full rounded-lg border border-[var(--border-input)] bg-[var(--bg-card)] pl-9 pr-3 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-disabled)] focus:border-[var(--primary)] focus:outline-none"
            />
          </div>
        </div>
      </div>

      <DataTable
        data={data?.data ?? []}
        columns={auditColumns}
        isLoading={isLoading}
        pagination={data?.pagination}
        onPageChange={setPage}
        emptyMessage="Belum ada audit log"
      />
    </Card>
  )
}

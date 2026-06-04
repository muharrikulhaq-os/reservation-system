'use client'

import { Search } from 'lucide-react'
import { DataTable } from '@/components/shared/table/DataTable'
import { useTableFilter } from '@/hooks'
import { RESOURCE_STATUS, RESOURCE_STATUS_CONFIG } from '@/constants'
import type { ResourceStatus } from '@/types'
import { useRooms } from './hooks/useRooms'
import { roomColumns } from './utils/columns'

// ─────────────────────────────────────────
// ROOMS PAGE — katalog ruangan
// ─────────────────────────────────────────

export const RoomsPage = () => {
  const { search, setSearch, filters, setFilter, params } = useTableFilter({
    status: undefined as ResourceStatus | undefined,
  })

  const { data, isLoading } = useRooms(params)

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative w-full max-w-xs">
          <Search className="pointer-events-none absolute inset-y-0 left-3 my-auto h-4 w-4 text-[var(--text-disabled)]" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari ruangan / lokasi..."
            className="h-9 w-full rounded-lg border border-[var(--border-input)] bg-[var(--bg-card)] pl-9 pr-3 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-disabled)] focus:border-[var(--primary)] focus:outline-none"
          />
        </div>

        <select
          value={filters.status ?? ''}
          onChange={(e) =>
            setFilter('status', (e.target.value || undefined) as ResourceStatus | undefined)
          }
          className="h-9 rounded-lg border border-[var(--border-input)] bg-[var(--bg-card)] px-3 text-sm text-[var(--text-primary)] focus:border-[var(--primary)] focus:outline-none"
        >
          <option value="">Semua Status</option>
          {Object.values(RESOURCE_STATUS).map((s) => (
            <option key={s} value={s}>
              {RESOURCE_STATUS_CONFIG[s].label}
            </option>
          ))}
        </select>
      </div>

      <DataTable
        data={data ?? []}
        columns={roomColumns}
        isLoading={isLoading}
        emptyMessage="Belum ada ruangan"
      />
    </div>
  )
}

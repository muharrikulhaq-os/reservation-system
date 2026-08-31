'use client'

import { Search } from 'lucide-react'
import { DataTable } from '@/components/shared/table/DataTable'
import { useTableFilter } from '@/hooks'
import { useDriversPaginated } from './hooks/useDrivers'
import { driverColumns } from './utils/columns'

// ─────────────────────────────────────────
// DRIVERS PAGE - daftar driver
// Search dan pagination dua-duanya server-side
// (GET /drivers?search=) - pencarian menyaring
// seluruh data, bukan cuma halaman yang tampil.
// ─────────────────────────────────────────

export const DriversPage = () => {
  const { search, setSearch, setPage, setLimit, params } = useTableFilter({})

  const { data, isLoading } = useDriversPaginated(params)

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative w-full max-w-xs">
          <Search className="pointer-events-none absolute inset-y-0 left-3 my-auto h-4 w-4 text-[var(--text-disabled)]" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama, NIK, atau email..."
            className="h-9 w-full rounded-lg border border-[var(--border-input)] bg-[var(--bg-card)] pl-9 pr-3 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-disabled)] focus:border-[var(--primary)] focus:outline-none"
          />
        </div>
      </div>

      <DataTable
        data={data?.data ?? []}
        columns={driverColumns}
        isLoading={isLoading}
        pagination={data?.pagination}
        onPageChange={setPage}
        onLimitChange={setLimit}
        emptyMessage={
          params.search ? 'Driver tidak ditemukan' : 'Belum ada driver'
        }
      />
    </div>
  )
}

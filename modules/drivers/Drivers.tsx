'use client'

import { useMemo, useState } from 'react'
import { Search } from 'lucide-react'
import { DataTable } from '@/components/shared/table/DataTable'
import { useDebounce, usePagination } from '@/hooks'
import { useDriversPaginated } from './hooks/useDrivers'
import { driverColumns } from './utils/columns'

// ─────────────────────────────────────────
// DRIVERS PAGE — daftar driver
// Pagination dilakukan server-side.
// API /drivers belum mendukung search, jadi
// pencarian disaring di sisi klien — artinya
// hanya berlaku pada halaman yang sedang tampil.
// ─────────────────────────────────────────

export const DriversPage = () => {
  const [search, setSearch] = useState('')
  const searchDebounced = useDebounce(search)
  const { page, limit, setPage, setLimit } = usePagination()

  const { data, isLoading } = useDriversPaginated({ page, limit })

  const query = searchDebounced.trim().toLowerCase()

  const filtered = useMemo(() => {
    const list = data?.data ?? []
    if (!query) return list
    return list.filter(
      (d) =>
        d.name.toLowerCase().includes(query) ||
        d.employeeId.toLowerCase().includes(query) ||
        d.email.toLowerCase().includes(query),
    )
  }, [data, query])

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative w-full max-w-xs">
          <Search className="pointer-events-none absolute inset-y-0 left-3 my-auto h-4 w-4 text-[var(--text-disabled)]" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari driver..."
            className="h-9 w-full rounded-lg border border-[var(--border-input)] bg-[var(--bg-card)] pl-9 pr-3 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-disabled)] focus:border-[var(--primary)] focus:outline-none"
          />
        </div>

        {/* API belum punya endpoint search — beri tahu batasannya */}
        {query && (
          <p className="text-xs text-[var(--text-secondary)]">
            Pencarian hanya menyaring halaman ini.
          </p>
        )}
      </div>

      <DataTable
        data={filtered}
        columns={driverColumns}
        isLoading={isLoading}
        pagination={data?.pagination}
        onPageChange={setPage}
        onLimitChange={setLimit}
        emptyMessage="Belum ada driver"
      />
    </div>
  )
}

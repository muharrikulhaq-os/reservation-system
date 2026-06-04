'use client'

import { useMemo, useState } from 'react'
import { Search } from 'lucide-react'
import { DataTable } from '@/components/shared/table/DataTable'
import { useDebounce } from '@/hooks'
import { useDrivers } from './hooks/useDrivers'
import { driverColumns } from './utils/columns'

// ─────────────────────────────────────────
// DRIVERS PAGE — daftar driver
// API /drivers belum mendukung search, jadi
// pencarian dilakukan di sisi klien.
// ─────────────────────────────────────────

export const DriversPage = () => {
  const [search, setSearch] = useState('')
  const searchDebounced = useDebounce(search)

  const { data, isLoading } = useDrivers()

  const filtered = useMemo(() => {
    const list = data ?? []
    const q = searchDebounced.trim().toLowerCase()
    if (!q) return list
    return list.filter(
      (d) =>
        d.name.toLowerCase().includes(q) ||
        d.employeeId.toLowerCase().includes(q) ||
        d.email.toLowerCase().includes(q),
    )
  }, [data, searchDebounced])

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
      </div>

      <DataTable
        data={filtered}
        columns={driverColumns}
        isLoading={isLoading}
        emptyMessage="Belum ada driver"
      />
    </div>
  )
}

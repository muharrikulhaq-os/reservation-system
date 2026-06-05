'use client'

import Link from 'next/link'
import { Plus, Search } from 'lucide-react'
import { DataTable, PageHeader } from '@/components/shared'
import { AppButton } from '@/components/ui-custom'
import { AdminOnly } from '@/components/common'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useTableFilter } from '@/hooks'
import { RESOURCE_STATUS, RESOURCE_STATUS_CONFIG } from '@/constants'
import type { ResourceStatus } from '@/types'
import { useRooms } from './hooks/useRooms'
import { roomColumns } from './utils/columns'

// ─────────────────────────────────────────
// ROOMS PAGE — katalog ruangan
// ─────────────────────────────────────────

const STATUS_TABS: { value: string; label: string }[] = [
  { value: 'ALL', label: 'Semua' },
  { value: RESOURCE_STATUS.AVAILABLE, label: RESOURCE_STATUS_CONFIG.AVAILABLE.label },
  { value: RESOURCE_STATUS.MAINTENANCE, label: RESOURCE_STATUS_CONFIG.MAINTENANCE.label },
  { value: RESOURCE_STATUS.INACTIVE, label: RESOURCE_STATUS_CONFIG.INACTIVE.label },
]

export const RoomsPage = () => {
  const { search, setSearch, filters, setFilter, params } = useTableFilter({
    status: undefined as ResourceStatus | undefined,
  })

  const { data, isLoading } = useRooms(params)

  return (
    <div className="space-y-6">
      <PageHeader
        title="Ruangan"
        description="Katalog ruang rapat yang dapat dipinjam"
        actions={
          <AdminOnly>
            <Link href="/rooms/new">
              <AppButton variant="primary" leftIcon={<Plus className="h-4 w-4" />}>
                Tambah Ruangan
              </AppButton>
            </Link>
          </AdminOnly>
        }
      />

      {/* Filter row */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative w-full max-w-xs">
          <Search className="pointer-events-none absolute inset-y-0 left-3 my-auto h-4 w-4 text-[var(--text-disabled)]" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari ruangan / lokasi..."
            className="h-10 w-full rounded-lg border border-[var(--border-input)] bg-[var(--bg-card)] pl-9 pr-3 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-disabled)] focus-visible:border-[1.5px] focus-visible:border-[var(--primary)] focus-visible:outline-none"
          />
        </div>

        <Tabs
          value={filters.status ?? 'ALL'}
          onValueChange={(v) =>
            setFilter('status', v === 'ALL' ? undefined : (v as ResourceStatus))
          }
        >
          <TabsList className="rounded-lg bg-[var(--bg-subtle)] p-1">
            {STATUS_TABS.map((tab) => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className="rounded-md px-3 text-sm font-medium text-[var(--text-secondary)] data-[state=active]:bg-[var(--bg-card)] data-[state=active]:text-[var(--primary)] data-[state=active]:shadow-sm"
              >
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
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

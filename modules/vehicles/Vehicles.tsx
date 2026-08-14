'use client'

import Link from 'next/link'
import { Plus, Search } from 'lucide-react'
import { CardGrid, DataTable, PageHeader, ViewToggle } from '@/components/shared'
import type { ViewMode } from '@/components/shared'
import { AppButton, InputSelect } from '@/components/ui-custom'
import { AdminOnly } from '@/components/common'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { usePersistedState, useTableFilter } from '@/hooks'
import { RESOURCE_STATUS, RESOURCE_STATUS_CONFIG, STORAGE_KEYS } from '@/constants'
import type { ResourceStatus, SelectOption } from '@/types'
import { useVehiclesPaginated, useVehicleCategories } from './hooks/useVehicles'
import { VehicleCard } from './components/VehicleCard'
import { vehicleColumns } from './utils/columns'

// ─────────────────────────────────────────
// VEHICLES PAGE - katalog kendaraan
// ─────────────────────────────────────────

const STATUS_TABS: { value: string; label: string }[] = [
  { value: 'ALL', label: 'Semua' },
  { value: RESOURCE_STATUS.AVAILABLE, label: RESOURCE_STATUS_CONFIG.AVAILABLE.label },
  { value: RESOURCE_STATUS.MAINTENANCE, label: RESOURCE_STATUS_CONFIG.MAINTENANCE.label },
  { value: RESOURCE_STATUS.INACTIVE, label: RESOURCE_STATUS_CONFIG.INACTIVE.label },
]

export const VehiclesPage = () => {
  const { search, setSearch, filters, setFilter, setPage, setLimit, params } = useTableFilter({
    status: undefined as ResourceStatus | undefined,
    categoryId: undefined as number | undefined,
  })

  // Mode tampilan diingat antar kunjungan
  const [view, setView] = usePersistedState<ViewMode>(
    STORAGE_KEYS.VEHICLES_VIEW_MODE,
    'row',
  )

  const { data: categories } = useVehicleCategories()
  const { data, isLoading } = useVehiclesPaginated(params)

  const categoryOptions: SelectOption<number>[] = (categories ?? []).map((c) => ({
    value: c.id,
    label: c.name,
  }))

  return (
    <div className="space-y-6">
      <PageHeader
        title="Kendaraan"
        description="Katalog kendaraan operasional perusahaan"
        actions={
          <AdminOnly>
            <Link href="/vehicles/new">
              <AppButton variant="primary" leftIcon={<Plus className="h-4 w-4" />}>
                Tambah Kendaraan
              </AppButton>
            </Link>
          </AdminOnly>
        }
      />

      {/* Filter row */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-1 flex-wrap items-center gap-3">
          <div className="relative w-full max-w-xs">
            <Search className="pointer-events-none absolute inset-y-0 left-3 my-auto h-4 w-4 text-[var(--text-disabled)]" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari kendaraan / plat..."
              className="h-10 w-full rounded-lg border border-[var(--border-input)] bg-[var(--bg-card)] pl-9 pr-3 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-disabled)] focus-visible:border-[1.5px] focus-visible:border-[var(--primary)] focus-visible:outline-none"
            />
          </div>

          <div className="w-44">
            <InputSelect
              placeholder="Semua Kategori"
              options={categoryOptions}
              value={filters.categoryId ?? ''}
              onChange={(e) =>
                setFilter(
                  'categoryId',
                  e.target.value ? Number(e.target.value) : undefined,
                )
              }
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

        <ViewToggle value={view} onChange={setView} />
      </div>

      {view === 'row' ? (
        <DataTable
          data={data?.data ?? []}
          columns={vehicleColumns}
          isLoading={isLoading}
          pagination={data?.pagination}
          onPageChange={setPage}
          onLimitChange={setLimit}
          emptyMessage="Belum ada kendaraan"
        />
      ) : (
        <CardGrid
          data={data?.data ?? []}
          keyExtractor={(v) => v.id}
          renderItem={(v) => <VehicleCard vehicle={v} />}
          isLoading={isLoading}
          pagination={data?.pagination}
          onPageChange={setPage}
          onLimitChange={setLimit}
          emptyMessage="Belum ada kendaraan"
        />
      )}
    </div>
  )
}

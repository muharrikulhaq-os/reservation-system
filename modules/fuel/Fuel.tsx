'use client'

import { useState } from 'react'
import { Search, Fuel as FuelIcon, Droplet, Zap, Gauge } from 'lucide-react'
import { PageHeader, StatCard } from '@/components/shared'
import { DataTable } from '@/components/shared/table/DataTable'
import { AppButton, InputSelect, InputDate } from '@/components/ui-custom'
import { useTableFilter } from '@/hooks'
import { formatCurrency, formatNumber } from '@/lib'
import { FUEL_TYPE } from '@/constants'
import type { FuelType, SelectOption } from '@/types'
import { useVehicles } from '@/modules/vehicles/hooks/useVehicles'
import { useFuelExpenses } from './hooks/useFuel'
import { fuelColumns } from './utils/columns'
import { FuelInputModal } from './components/FuelInputModal'

const isThisMonth = (iso: string) => {
  const d = new Date(iso)
  const now = new Date()
  return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth()
}

export const Fuel = () => {
  const [modalOpen, setModalOpen] = useState(false)

  const { search, setSearch, filters, setFilter, params, page, setPage } =
    useTableFilter({
      vehicleId: undefined as number | undefined,
      fuelType: undefined as FuelType | undefined,
      startDate: undefined as string | undefined,
      endDate: undefined as string | undefined,
    })

  const { data, isLoading } = useFuelExpenses(params)
  const { data: vehicles } = useVehicles({ limit: 100 })

  const items = data?.data ?? []

  // Statistik (dari data yang termuat)
  const totalCostMonth = items
    .filter((f) => isThisMonth(f.createdAt))
    .reduce((s, f) => s + f.totalCost, 0)
  const totalLiter = items
    .filter((f) => f.fuelType === FUEL_TYPE.BBM)
    .reduce((s, f) => s + (f.liter ?? 0), 0)
  const totalKwh = items
    .filter((f) => f.fuelType === FUEL_TYPE.LISTRIK)
    .reduce((s, f) => s + (f.kwh ?? 0), 0)
  const sumCost = items.reduce((s, f) => s + f.totalCost, 0)
  const sumKm = items.reduce((s, f) => s + (f.distanceKm ?? 0), 0)
  const avgPerKm = sumKm > 0 ? sumCost / sumKm : 0

  const vehicleOptions: SelectOption[] = (vehicles ?? []).map((v) => ({
    value: v.id,
    label: `${v.name} · ${v.plateNumber}`,
  }))

  const fuelTypeOptions: SelectOption[] = [
    { value: FUEL_TYPE.BBM, label: 'BBM' },
    { value: FUEL_TYPE.LISTRIK, label: 'Listrik' },
  ]

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Bahan Bakar"
        description="Pencatatan pengisian BBM & listrik kendaraan"
        actions={
          <AppButton
            leftIcon={<FuelIcon className="h-4 w-4" />}
            onClick={() => setModalOpen(true)}
          >
            Catat Pengisian
          </AppButton>
        }
      />

      {/* Stat cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Pengeluaran Bulan Ini"
          value={formatCurrency(totalCostMonth)}
          iconBg="var(--primary-light)"
          icon={<FuelIcon className="h-5 w-5" style={{ color: 'var(--primary)' }} />}
        />
        <StatCard
          label="Total Liter BBM"
          value={`${formatNumber(totalLiter)} L`}
          iconBg="#DCFCE7"
          icon={<Droplet className="h-5 w-5" style={{ color: '#16A34A' }} />}
        />
        <StatCard
          label="Total kWh Listrik"
          value={`${formatNumber(totalKwh)} kWh`}
          iconBg="#DBEAFE"
          icon={<Zap className="h-5 w-5" style={{ color: '#0284C7' }} />}
        />
        <StatCard
          label="Rata-rata Biaya / Km"
          value={formatCurrency(Math.round(avgPerKm))}
          iconBg="#FEF9C3"
          icon={<Gauge className="h-5 w-5" style={{ color: '#854D0E' }} />}
        />
      </div>

      {/* Filter */}
      <div className="flex flex-wrap items-end gap-3">
        <div className="relative w-full max-w-xs">
          <Search className="pointer-events-none absolute inset-y-0 left-3 my-auto h-4 w-4 text-[var(--text-disabled)]" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari kendaraan / driver…"
            className="h-10 w-full rounded-lg border border-[var(--border-input)] bg-[var(--bg-card)] pl-9 pr-3 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-disabled)] focus:border-[var(--primary)] focus:outline-none"
          />
        </div>

        <div className="w-full max-w-[200px]">
          <InputSelect
            placeholder="Semua Kendaraan"
            options={vehicleOptions}
            value={filters.vehicleId ?? ''}
            onChange={(e) =>
              setFilter('vehicleId', e.target.value ? Number(e.target.value) : undefined)
            }
          />
        </div>

        <div className="w-full max-w-[150px]">
          <InputSelect
            placeholder="Semua Jenis"
            options={fuelTypeOptions}
            value={filters.fuelType ?? ''}
            onChange={(e) =>
              setFilter('fuelType', (e.target.value || undefined) as FuelType | undefined)
            }
          />
        </div>

        <div className="w-[150px]">
          <InputDate
            value={filters.startDate ?? ''}
            onChange={(e) => setFilter('startDate', e.target.value || undefined)}
          />
        </div>
        <div className="w-[150px]">
          <InputDate
            value={filters.endDate ?? ''}
            onChange={(e) => setFilter('endDate', e.target.value || undefined)}
          />
        </div>
      </div>

      <DataTable
        data={items}
        columns={fuelColumns}
        isLoading={isLoading}
        pagination={data?.pagination}
        onPageChange={setPage}
        emptyMessage="Belum ada catatan pengisian"
      />

      <FuelInputModal open={modalOpen} onOpenChange={setModalOpen} />
    </div>
  )
}

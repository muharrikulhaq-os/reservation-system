'use client'

import { Fuel as FuelIcon, Droplet, Zap, Receipt } from 'lucide-react'
import { PageHeader, StatCard } from '@/components/shared'
import { DataTable } from '@/components/shared/table/DataTable'
import { AppButton, InputSelect } from '@/components/ui-custom'
import { useTableFilter } from '@/hooks'
import { formatCurrency, formatNumber } from '@/lib'
import { ENERGY_TYPE } from '@/constants'
import type { EnergyType, SelectOption } from '@/types'
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
  const { filters, setFilter, params, setPage, setLimit } = useTableFilter({
    vehicleId: undefined as number | undefined,
    fuelType: undefined as EnergyType | undefined,
  })

  const { data, isLoading } = useFuelExpenses(params)
  const { data: vehicles } = useVehicles({ limit: 100 })

  const items = data?.data ?? []

  const totalCostMonth = items
    .filter((f) => isThisMonth(f.createdAt))
    .reduce((s, f) => s + f.totalCost, 0)
  const totalLiter = items
    .filter((f) => f.fuelType === ENERGY_TYPE.BBM)
    .reduce((s, f) => s + (f.liter ?? 0), 0)
  const totalKwh = items
    .filter((f) => f.fuelType === ENERGY_TYPE.LISTRIK)
    .reduce((s, f) => s + (f.kwh ?? 0), 0)
  const totalCount = data?.pagination?.total ?? items.length

  const vehicleOptions: SelectOption[] = (vehicles ?? []).map((v) => ({
    value: v.id,
    label: `${v.name} · ${v.plateNumber}`,
  }))
  const energyOptions: SelectOption[] = [
    { value: ENERGY_TYPE.BBM, label: 'BBM' },
    { value: ENERGY_TYPE.LISTRIK, label: 'Listrik' },
  ]

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Bahan Bakar"
        description="Pencatatan pengisian BBM & listrik kendaraan"
        actions={
          <FuelInputModal
            trigger={
              <AppButton leftIcon={<FuelIcon className="h-4 w-4" />}>
                Catat Pengisian
              </AppButton>
            }
          />
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
          label="Total Pengisian"
          value={totalCount}
          iconBg="#FEF3C7"
          icon={<Receipt className="h-5 w-5" style={{ color: '#92400E' }} />}
        />
      </div>

      {/* Filter */}
      <div className="flex flex-wrap items-end gap-3">
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
            options={energyOptions}
            value={filters.fuelType ?? ''}
            onChange={(e) =>
              setFilter('fuelType', (e.target.value || undefined) as EnergyType | undefined)
            }
          />
        </div>
      </div>

      <DataTable
        data={items}
        columns={fuelColumns}
        isLoading={isLoading}
        pagination={data?.pagination}
        onPageChange={setPage}
        onLimitChange={setLimit}
        emptyMessage="Belum ada catatan pengisian"
      />
    </div>
  )
}

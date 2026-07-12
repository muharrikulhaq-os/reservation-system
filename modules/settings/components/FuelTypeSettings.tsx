'use client'

import { useState } from 'react'
import { Fuel, Pencil, Plus, Trash2, Zap } from 'lucide-react'
import { Card, CardHeader } from '@/components/common'
import { PageHeader } from '@/components/shared'
import { AppButton } from '@/components/ui-custom'
import { formatCurrency } from '@/lib'
import { ENERGY_TYPE, ENERGY_TYPE_CONFIG } from '@/constants'
import type { FuelTypeMaster } from '@/types'
import { useFuelTypes, useDeleteFuelType } from '@/modules/fuel'
import { FuelTypeFormModal } from './FuelTypeFormModal'

export const FuelTypeSettings = () => {
  const { data: fuelTypes, isLoading } = useFuelTypes()
  const del = useDeleteFuelType()

  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<FuelTypeMaster | null>(null)

  const openCreate = () => {
    setEditing(null)
    setModalOpen(true)
  }
  const openEdit = (ft: FuelTypeMaster) => {
    setEditing(ft)
    setModalOpen(true)
  }
  const handleDelete = (ft: FuelTypeMaster) => {
    if (window.confirm(`Hapus jenis "${ft.name}"?`)) del.mutate(ft.id)
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Jenis Bahan Bakar"
        description="Master jenis BBM & listrik beserta harga acuan (prefill saat pencatatan pengisian)"
        actions={
          <AppButton leftIcon={<Plus className="h-4 w-4" />} onClick={openCreate}>
            Tambah Jenis
          </AppButton>
        }
      />

      <Card>
        <CardHeader title="Daftar Jenis Bahan Bakar" />

        {isLoading ? (
          <p className="py-8 text-center text-sm text-[var(--text-secondary)]">Memuat…</p>
        ) : (fuelTypes ?? []).length === 0 ? (
          <p className="py-8 text-center text-sm text-[var(--text-secondary)]">
            Belum ada jenis bahan bakar. Tambahkan lewat tombol di atas.
          </p>
        ) : (
          <ul className="divide-y divide-[var(--border-divider)]">
            {(fuelTypes ?? []).map((ft) => {
              const cfg = ENERGY_TYPE_CONFIG[ft.type]
              const isBbm = ft.type === ENERGY_TYPE.BBM
              return (
                <li key={ft.id} className="flex items-center gap-3 py-3 first:pt-0">
                  <span
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
                    style={{ backgroundColor: `${cfg.color}1A`, color: cfg.color }}
                  >
                    {isBbm ? <Fuel className="h-4 w-4" /> : <Zap className="h-4 w-4" />}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-sm font-semibold text-[var(--text-primary)]">
                        {ft.name}
                      </p>
                      {!ft.isActive && (
                        <span className="rounded-full bg-[var(--bg-subtle)] px-2 py-0.5 text-[10px] font-semibold text-[var(--text-secondary)]">
                          Nonaktif
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[var(--text-secondary)]">
                      {cfg.label} · {formatCurrency(ft.defaultPrice)} /{' '}
                      {ft.unit === 'KWH' ? 'kWh' : 'Liter'}
                    </p>
                  </div>
                  <AppButton
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => openEdit(ft)}
                    aria-label="Ubah"
                  >
                    <Pencil className="h-4 w-4" />
                  </AppButton>
                  <AppButton
                    variant="ghost"
                    size="icon-sm"
                    loading={del.isPending && del.variables === ft.id}
                    onClick={() => handleDelete(ft)}
                    aria-label="Hapus"
                    className="text-[var(--danger)] hover:text-[var(--danger)]"
                  >
                    <Trash2 className="h-4 w-4" />
                  </AppButton>
                </li>
              )
            })}
          </ul>
        )}
      </Card>

      <FuelTypeFormModal open={modalOpen} onOpenChange={setModalOpen} fuelType={editing} />
    </div>
  )
}

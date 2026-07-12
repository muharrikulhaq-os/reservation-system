'use client'

import { useEffect, useState } from 'react'
import { AlertCircle } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  AppButton,
  InputText,
  InputSelect,
  InputRupiah,
} from '@/components/ui-custom'
import { getErrorMessage } from '@/lib'
import { ENERGY_TYPE } from '@/constants'
import type { EnergyType, FuelTypeMaster, FuelUnit, SelectOption } from '@/types'
import { useCreateFuelType, useUpdateFuelType } from '@/modules/fuel'

interface FuelTypeFormModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  fuelType?: FuelTypeMaster | null // null/undefined = create
}

const typeOptions: SelectOption[] = [
  { value: 'BBM', label: 'BBM' },
  { value: 'LISTRIK', label: 'Listrik' },
]

export const FuelTypeFormModal = ({
  open,
  onOpenChange,
  fuelType,
}: FuelTypeFormModalProps) => {
  const isEdit = !!fuelType
  const create = useCreateFuelType()
  const update = useUpdateFuelType()

  const [name, setName] = useState('')
  const [type, setType] = useState<EnergyType>('BBM')
  const [defaultPrice, setDefaultPrice] = useState<number | undefined>()
  const [isActive, setIsActive] = useState(true)

  // Seed saat modal dibuka
  useEffect(() => {
    if (!open) return
    setName(fuelType?.name ?? '')
    setType(fuelType?.type ?? 'BBM')
    setDefaultPrice(fuelType?.defaultPrice ?? undefined)
    setIsActive(fuelType?.isActive ?? true)
  }, [open, fuelType])

  // Unit diturunkan dari type
  const unit: FuelUnit = type === ENERGY_TYPE.LISTRIK ? 'KWH' : 'LITER'

  const isPending = create.isPending || update.isPending
  const error = create.error ?? update.error
  const canSubmit = name.trim().length > 0 && !!defaultPrice

  const handleSubmit = async () => {
    if (!canSubmit || !defaultPrice) return
    const payload = { name: name.trim(), type, unit, defaultPrice, isActive }
    try {
      if (isEdit && fuelType) {
        await update.mutateAsync({ id: fuelType.id, payload })
      } else {
        await create.mutateAsync(payload)
      }
      onOpenChange(false)
    } catch {
      // ditampilkan via error
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-2xl p-6 shadow-[var(--shadow-modal)] sm:max-w-md">
        <DialogHeader>
          <DialogTitle
            className="text-lg font-bold text-[var(--text-primary)]"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            {isEdit ? 'Ubah Jenis Bahan Bakar' : 'Tambah Jenis Bahan Bakar'}
          </DialogTitle>
        </DialogHeader>

        <div className="mt-2 space-y-4">
          {error && (
            <div className="flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{getErrorMessage(error)}</span>
            </div>
          )}

          <InputText
            label="Nama"
            required
            placeholder="mis. Pertamax / SPKLU PLN"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <div className="grid grid-cols-2 gap-3">
            <InputSelect
              label="Tipe"
              required
              options={typeOptions}
              value={type}
              onChange={(e) => setType(e.target.value as EnergyType)}
            />
            <InputRupiah
              label={`Harga / ${unit === 'KWH' ? 'kWh' : 'Liter'}`}
              required
              value={defaultPrice}
              onChange={setDefaultPrice}
            />
          </div>

          <label className="flex items-center gap-2 text-sm text-[var(--text-primary)]">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="h-4 w-4 rounded border-[var(--border-input)]"
            />
            Aktif (tampil saat pencatatan pengisian)
          </label>

          <div className="flex gap-3 pt-1">
            <AppButton
              variant="secondary"
              fullWidth
              disabled={isPending}
              onClick={() => onOpenChange(false)}
            >
              Batal
            </AppButton>
            <AppButton
              fullWidth
              loading={isPending}
              disabled={!canSubmit || isPending}
              onClick={handleSubmit}
            >
              Simpan
            </AppButton>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

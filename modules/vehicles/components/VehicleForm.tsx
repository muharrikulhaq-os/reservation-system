'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { AlertCircle, Plus, X } from 'lucide-react'
import { Card, CardHeader } from '@/components/common'
import { AppButton, InputText, InputNumber, InputSelect } from '@/components/ui-custom'
import { getErrorMessage } from '@/lib'
import type { Vehicle, SelectOption } from '@/types'
import {
  createVehicleSchema,
  type CreateVehicleFormData,
} from '@/schemas/vehicle.schema'
import {
  useCreateVehicle,
  useUpdateVehicle,
  useVehicleCategories,
  useCreateVehicleCategory,
} from '../hooks/useVehicles'

// ─────────────────────────────────────────
// VEHICLE FORM — create & edit
// ─────────────────────────────────────────

interface VehicleFormProps {
  initialData?: Vehicle
  onSuccess?: () => void
}

export const VehicleForm = ({ initialData, onSuccess }: VehicleFormProps) => {
  const router = useRouter()
  const isEdit = !!initialData

  const { data: categories } = useVehicleCategories()
  const createMutation = useCreateVehicle()
  const updateMutation = useUpdateVehicle(initialData?.id ?? 0)
  const { mutate, isPending, error } = isEdit ? updateMutation : createMutation

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateVehicleFormData>({
    resolver: zodResolver(createVehicleSchema),
    defaultValues: initialData
      ? {
          name: initialData.name,
          plateNumber: initialData.plateNumber,
          brand: initialData.brand,
          model: initialData.model,
          year: initialData.year,
          currentOdometer: initialData.currentOdometer,
          capacity: initialData.capacity,
          categoryId: initialData.category.id,
        }
      : { currentOdometer: 0 },
  })

  const categoryOptions: SelectOption<number>[] = (categories ?? []).map((c) => ({
    value: c.id,
    label: c.name,
  }))

  const onSubmit = (data: CreateVehicleFormData) =>
    mutate(data, {
      onSuccess: () => {
        onSuccess?.()
        router.push('/vehicles')
      },
    })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <CardHeader
          title={isEdit ? 'Data Kendaraan' : 'Tambah Kendaraan'}
          description="Lengkapi informasi kendaraan di bawah ini"
        />

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          {/* Row 1: name full width */}
          <div className="sm:col-span-2">
            <InputText
              label="Nama Kendaraan"
              required
              placeholder="cth. Toyota Avanza Operasional"
              error={errors.name?.message}
              {...register('name')}
            />
          </div>

          {/* Row 2: plate + brand */}
          <InputText
            label="Plat Nomor"
            required
            placeholder="cth. B 1234 ABC"
            error={errors.plateNumber?.message}
            {...register('plateNumber')}
          />
          <InputText
            label="Merek"
            required
            placeholder="cth. Toyota"
            error={errors.brand?.message}
            {...register('brand')}
          />

          {/* Row 3: model + year */}
          <InputText
            label="Model"
            required
            placeholder="cth. Avanza"
            error={errors.model?.message}
            {...register('model')}
          />
          <Controller
            control={control}
            name="year"
            render={({ field }) => (
              <InputNumber
                label="Tahun"
                required
                placeholder="cth. 2022"
                min={1990}
                max={2030}
                value={field.value ?? ''}
                onChange={field.onChange}
                error={errors.year?.message}
              />
            )}
          />

          {/* Row 4: category (+add) + capacity */}
          <Controller
            control={control}
            name="categoryId"
            render={({ field }) => (
              <CategoryField
                options={categoryOptions}
                error={errors.categoryId?.message}
                value={field.value}
                onChange={field.onChange}
              />
            )}
          />
          <Controller
            control={control}
            name="capacity"
            render={({ field }) => (
              <InputNumber
                label="Kapasitas (Penumpang)"
                required
                placeholder="cth. 7"
                min={1}
                max={60}
                value={field.value ?? ''}
                onChange={field.onChange}
                error={errors.capacity?.message}
              />
            )}
          />

          {/* Row 5: odometer — create only */}
          {!isEdit && (
            <Controller
              control={control}
              name="currentOdometer"
              render={({ field }) => (
                <InputNumber
                  label="Odometer Awal (km)"
                  placeholder="cth. 0"
                  min={0}
                  value={field.value ?? ''}
                  onChange={field.onChange}
                  error={errors.currentOdometer?.message}
                />
              )}
            />
          )}
        </div>
      </Card>

      {error && (
        <div className="flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{getErrorMessage(error)}</span>
        </div>
      )}

      <div className="flex items-center justify-end gap-3">
        <AppButton
          type="button"
          variant="secondary"
          onClick={() => router.push('/vehicles')}
        >
          Batal
        </AppButton>
        <AppButton type="submit" variant="primary" loading={isPending}>
          {isEdit ? 'Perbarui' : 'Simpan'}
        </AppButton>
      </div>
    </form>
  )
}

// ─────────────────────────────────────────
// CATEGORY FIELD — select + tambah kategori inline
// ─────────────────────────────────────────

const CategoryField = ({
  options,
  error,
  value,
  onChange,
}: {
  options: SelectOption<number>[]
  error?: string
  value?: number
  onChange: (value: number | undefined) => void
}) => {
  const [adding, setAdding] = useState(false)
  const [name, setName] = useState('')
  const { mutate, isPending } = useCreateVehicleCategory()

  const submit = () => {
    if (!name.trim()) return
    mutate(
      { name: name.trim() },
      {
        onSuccess: (res) => {
          // Pilih otomatis kategori yang baru dibuat
          if (res?.data?.id) onChange(res.data.id)
          setName('')
          setAdding(false)
        },
      },
    )
  }

  return (
    <div className="w-full">
      <div className="flex items-end gap-2">
        <div className="flex-1">
          <InputSelect
            label="Kategori"
            required
            placeholder="Pilih kategori"
            options={options}
            error={error}
            value={value ?? ''}
            onChange={(e) =>
              onChange(e.target.value ? Number(e.target.value) : undefined)
            }
          />
        </div>
        <AppButton
          type="button"
          variant="secondary"
          size="icon"
          aria-label="Tambah kategori"
          className="mb-[2px]"
          onClick={() => setAdding((v) => !v)}
        >
          {adding ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
        </AppButton>
      </div>

      {adding && (
        <div className="mt-2 flex items-end gap-2 rounded-lg bg-[var(--bg-subtle)] p-3">
          <div className="flex-1">
            <InputText
              label="Kategori Baru"
              placeholder="cth. MPV"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <AppButton
            type="button"
            variant="primary"
            loading={isPending}
            onClick={submit}
          >
            Tambah
          </AppButton>
        </div>
      )}
    </div>
  )
}

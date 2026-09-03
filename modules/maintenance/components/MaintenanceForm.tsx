'use client'

import { useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { AlertCircle, AlertTriangle } from 'lucide-react'
import { Card, CardHeader } from '@/components/common'
import {
  AppButton,
  InputText,
  InputNumber,
  InputRupiah,
  InputSelect,
  InputTextArea,
  InputDate,
} from '@/components/ui-custom'
import { getErrorMessage, formatDateTime } from '@/lib'
import {
  RESOURCE_STATUS,
  BOOKING_STATUS,
  MAINTENANCE_STATUS,
  MAINTENANCE_TYPE_OPTIONS,
} from '@/constants'
import type { SelectOption } from '@/types'
import {
  createMaintenanceSchema,
  type CreateMaintenanceFormData,
} from '@/schemas/maintenance.schema'
import { useVehicles } from '@/modules/vehicles/hooks/useVehicles'
import { useBookings } from '@/modules/booking'
import { useCreateMaintenance } from '../hooks/useMaintenance'

const todayYMD = () => {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
    d.getDate(),
  ).padStart(2, '0')}`
}

const typeOptions: SelectOption[] = MAINTENANCE_TYPE_OPTIONS.map((o) => ({
  value: o.value,
  label: o.label,
}))

export const MaintenanceForm = () => {
  const router = useRouter()
  const { data: vehicles } = useVehicles({ limit: 100 })
  const create = useCreateMaintenance()

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CreateMaintenanceFormData>({
    resolver: zodResolver(createMaintenanceSchema),
    defaultValues: { startDate: todayYMD(), description: '', type: 'routine', location: '' },
  })

  // Maintenance hanya untuk kendaraan AVAILABLE
  const availableVehicles = useMemo(
    () => (vehicles ?? []).filter((v) => v.status === RESOURCE_STATUS.AVAILABLE),
    [vehicles],
  )
  const vehicleOptions: SelectOption[] = availableVehicles.map((v) => ({
    value: v.id,
    label: `${v.name} (${v.plateNumber})`,
  }))

  const selectedVehicleId = watch('vehicleId')
  const selectedVehicle = availableVehicles.find((v) => v.id === selectedVehicleId)

  // Peringatan: ada booking APPROVED mendatang untuk kendaraan ini
  const { data: upcoming } = useBookings(
    {
      resourceId: selectedVehicle?.resourceId,
      status: BOOKING_STATUS.APPROVED,
      limit: 5,
    },
    { enabled: !!selectedVehicle },
  )
  const soonBooking = (upcoming?.data ?? [])
    .filter((b) => new Date(b.startDate).getTime() > Date.now())
    .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())[0]

  const handleVehicleChange = (value: string) => {
    const id = value ? Number(value) : (undefined as unknown as number)
    setValue('vehicleId', id, { shouldValidate: true })
    const v = availableVehicles.find((x) => x.id === id)
    setValue('odometer', v ? v.currentOdometer : undefined)
  }

  const onSubmit = (data: CreateMaintenanceFormData) =>
    create.mutate(
      {
        vehicleId: data.vehicleId,
        type: data.type,
        status: MAINTENANCE_STATUS.PENDING,
        description: data.description,
        location: data.location,
        startDate: new Date(data.startDate).toISOString(),
        vendorName: data.vendorName || undefined,
        odometer: data.odometer,
        totalCost: data.totalCost,
      },
      {
        onSuccess: (res) => {
          if (res.warning) alert(res.warning)
          router.push('/maintenance')
        },
      },
    )

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <CardHeader
          title="Informasi Maintenance"
          description="Hanya untuk kendaraan yang tersedia (AVAILABLE)"
        />

        <div className="space-y-5">
          <InputSelect
            label="Kendaraan"
            required
            placeholder="Pilih kendaraan tersedia"
            options={vehicleOptions}
            value={selectedVehicleId ?? ''}
            error={errors.vehicleId?.message}
            onChange={(e) => handleVehicleChange(e.target.value)}
          />

          {soonBooking && (
            <div className="flex items-start gap-2.5 rounded-xl border border-orange-200 bg-orange-50 px-4 py-3 text-sm text-orange-700">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>
                Kendaraan ini punya booking mendatang mulai{' '}
                <span className="font-semibold">
                  {formatDateTime(soonBooking.startDate)}
                </span>
                . Pastikan maintenance selesai sebelum itu.
              </span>
            </div>
          )}

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <InputSelect
              label="Tipe Maintenance"
              required
              options={typeOptions}
              error={errors.type?.message}
              {...register('type')}
            />
            <InputDate
              label="Tanggal Mulai"
              required
              error={errors.startDate?.message}
              {...register('startDate')}
            />
          </div>

          <InputTextArea
            label="Deskripsi Pekerjaan"
            required
            rows={3}
            placeholder="Jelaskan pekerjaan maintenance…"
            error={errors.description?.message}
            {...register('description')}
          />

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <InputText
              label="Lokasi / Bengkel"
              required
              placeholder="mis. Auto2000 Cibubur"
              error={errors.location?.message}
              {...register('location')}
            />
            <InputText
              label="Vendor (opsional)"
              placeholder="Nama bengkel/vendor"
              {...register('vendorName')}
            />
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <InputNumber
              label="Odometer (opsional)"
              min={0}
              value={watch('odometer') ?? ''}
              onChange={(v) => setValue('odometer', v)}
            />
            <InputRupiah
              label="Estimasi Biaya (opsional)"
              onChange={(v) => setValue('totalCost', v)}
            />
          </div>

          {/* Warning status */}
          <div className="flex items-start gap-2.5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>
              Kendaraan akan berstatus MAINTENANCE dan tidak dapat dipesan sampai
              maintenance selesai.
            </span>
          </div>
        </div>
      </Card>

      {create.error && (
        <div className="flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{getErrorMessage(create.error)}</span>
        </div>
      )}

      <div className="flex items-center justify-end gap-3">
        <AppButton
          type="button"
          variant="secondary"
          onClick={() => router.push('/maintenance')}
        >
          Batal
        </AppButton>
        <AppButton type="submit" variant="primary" loading={create.isPending}>
          Simpan
        </AppButton>
      </div>
    </form>
  )
}

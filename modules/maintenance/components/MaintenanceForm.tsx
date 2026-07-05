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
import { getErrorMessage } from '@/lib'
import {
  RESOURCE_STATUS,
  BOOKING_STATUS,
  MAINTENANCE_TYPE_CONFIG,
} from '@/constants'
import type { MaintenanceType, SelectOption } from '@/types'
import {
  createMaintenanceSchema,
  type CreateMaintenanceFormData,
} from '@/schemas/maintenance.schema'
import { useVehicles } from '@/modules/vehicles/hooks/useVehicles'
import { useRooms } from '@/modules/rooms/hooks/useRooms'
import { useBookings } from '@/modules/booking'
import { useCreateMaintenance } from '../hooks/useMaintenance'

const todayYMD = () => {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
    d.getDate(),
  ).padStart(2, '0')}`
}

export const MaintenanceForm = () => {
  const router = useRouter()
  const { data: vehicles } = useVehicles({ limit: 100 })
  const { data: rooms } = useRooms({ limit: 100 })
  const create = useCreateMaintenance()

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CreateMaintenanceFormData>({
    resolver: zodResolver(createMaintenanceSchema),
    defaultValues: { type: 'RUTIN', startDate: todayYMD(), description: '' },
  })

  // Hanya resource AVAILABLE
  const availableVehicles = useMemo(
    () => (vehicles ?? []).filter((v) => v.status === RESOURCE_STATUS.AVAILABLE),
    [vehicles],
  )
  const availableRooms = useMemo(
    () => (rooms ?? []).filter((r) => r.status === RESOURCE_STATUS.AVAILABLE),
    [rooms],
  )

  const vehicleByResourceId = useMemo(
    () => new Map(availableVehicles.map((v) => [v.resourceId, v])),
    [availableVehicles],
  )

  const resourceOptions: SelectOption[] = [
    ...availableVehicles.map((v) => ({
      value: v.resourceId,
      label: `Kendaraan · ${v.name} (${v.plateNumber})`,
    })),
    ...availableRooms.map((r) => ({
      value: r.resourceId,
      label: `Ruangan · ${r.name}`,
    })),
  ]

  const typeOptions: SelectOption[] = (
    Object.keys(MAINTENANCE_TYPE_CONFIG) as MaintenanceType[]
  ).map((t) => ({ value: t, label: MAINTENANCE_TYPE_CONFIG[t].label }))

  const selectedResourceId = watch('resourceId')
  const selectedVehicle = selectedResourceId
    ? vehicleByResourceId.get(selectedResourceId)
    : undefined

  // Cek booking mendatang untuk resource terpilih
  const { data: upcomingBookings } = useBookings(
    { resourceId: selectedResourceId, status: BOOKING_STATUS.APPROVED, limit: 5 },
    { enabled: !!selectedResourceId },
  )
  const hasUpcoming =
    (upcomingBookings?.data ?? []).filter(
      (b) => new Date(b.startDate).getTime() > Date.now(),
    ).length > 0

  const handleResourceChange = (value: string) => {
    const id = value ? Number(value) : undefined
    setValue('resourceId', id as number, { shouldValidate: true })
    const veh = id ? vehicleByResourceId.get(id) : undefined
    setValue('odometer', veh ? veh.currentOdometer : undefined)
  }

  const onSubmit = (data: CreateMaintenanceFormData) =>
    create.mutate(
      { ...data, startDate: new Date(data.startDate).toISOString() },
      { onSuccess: () => router.push('/maintenance') },
    )

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <CardHeader
          title="Informasi Maintenance"
          description="Hanya untuk resource yang tersedia (AVAILABLE)"
        />

        <div className="space-y-5">
          {/* Resource */}
          <div>
            <InputSelect
              label="Resource"
              required
              placeholder="Pilih resource tersedia"
              options={resourceOptions}
              value={selectedResourceId ?? ''}
              error={errors.resourceId?.message}
              onChange={(e) => handleResourceChange(e.target.value)}
            />
            {hasUpcoming && (
              <div className="mt-2 flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2">
                <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-600" />
                <p className="text-xs text-amber-700">
                  Resource ini memiliki booking mendatang. Maintenance akan membuat
                  resource tidak tersedia.
                </p>
              </div>
            )}
          </div>

          {/* Tipe */}
          <InputSelect
            label="Tipe Maintenance"
            required
            options={typeOptions}
            error={errors.type?.message}
            {...register('type')}
          />

          {/* Deskripsi */}
          <InputTextArea
            label="Deskripsi"
            required
            rows={3}
            placeholder="Jelaskan pekerjaan maintenance…"
            error={errors.description?.message}
            {...register('description')}
          />

          {/* Tanggal mulai */}
          <InputDate
            label="Tanggal Mulai"
            required
            error={errors.startDate?.message}
            {...register('startDate')}
          />

          {/* Vendor */}
          <InputText
            label="Vendor / Bengkel"
            placeholder="mis. Auto2000 (opsional)"
            {...register('vendor')}
          />

          {/* Odometer (hanya kendaraan) */}
          {selectedVehicle && (
            <InputNumber
              label="Odometer Saat Ini"
              min={0}
              value={watch('odometer') ?? ''}
              onChange={(v) => setValue('odometer', v)}
            />
          )}

          {/* Estimasi biaya */}
          <InputRupiah
            label="Estimasi Biaya"
            hint="Opsional — bisa diisi saat menyelesaikan maintenance"
            onChange={(v) => setValue('cost', v)}
          />
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

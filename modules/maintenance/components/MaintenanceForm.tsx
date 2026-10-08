'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Info, Send } from 'lucide-react'
import { Card, CardHeader } from '@/components/common'
import {
  AppButton,
  InputDateTime,
  InputNumber,
  InputRupiah,
  InputSelect,
  InputText,
  InputTextArea,
} from '@/components/ui-custom'
import { formatDateTime, kmHint } from '@/lib'
import {
  BOOKING_STATUS,
  COST_BEARER_OPTIONS,
  MAINTENANCE_CATEGORY_OPTIONS,
  MAINTENANCE_STATUS,
  PICKUP_METHOD_OPTIONS,
  RESOURCE_STATUS,
} from '@/constants'
import type { MaintenancePlanPayload, MaintenanceRecord, SelectOption } from '@/types'
import { maintenancePlanSchema, type MaintenancePlanFormData } from '@/schemas/maintenance.schema'
import { useVehicles } from '@/modules/vehicles/hooks/useVehicles'
import { useBookings } from '@/modules/booking'
import { useCreateMaintenance, useUpdateMaintenance, useVendors } from '../hooks/useMaintenance'
import { fromWibInput, toWibInput } from '../utils/helpers'
import { ErrorAlert, WarningAlert } from './shared'

// ─────────────────────────────────────────
// FORM PENGAJUAN MAINTENANCE - buat & ubah
// ─────────────────────────────────────────

export const MaintenanceForm = ({ initialData }: { initialData?: MaintenanceRecord }) => {
  const router = useRouter()
  const isEdit = !!initialData
  const isDraft = !initialData || initialData.status === MAINTENANCE_STATUS.DRAFT

  const { data: vehicles } = useVehicles({ limit: 200 })
  const { data: vendors } = useVendors({ isActive: true })
  const create = useCreateMaintenance()
  const update = useUpdateMaintenance(initialData?.id ?? 0)
  const mutation = isEdit ? update : create
  const [submitIntent, setSubmitIntent] = useState(false)
  const [clientError, setClientError] = useState<string | null>(null)

  const {
    register,
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<MaintenancePlanFormData>({
    resolver: zodResolver(maintenancePlanSchema),
    defaultValues: initialData
      ? {
          vehicleId: initialData.vehicle.id,
          vendorId: initialData.vendor?.id,
          category: initialData.category,
          description: initialData.description,
          complaint: initialData.complaint ?? '',
          location: initialData.location ?? '',
          plannedDate: toWibInput(initialData.plannedDate),
          estimatedDays: initialData.estimatedDays ?? 1,
          pickupMethod: initialData.pickupMethod ?? undefined,
          estimatedCost: initialData.estimatedCost ?? undefined,
          costBearer: initialData.costBearer ?? undefined,
          odometer: initialData.odometer ?? undefined,
        }
      : { category: 'REPAIR', description: '', estimatedDays: 1 },
  })

  const vehicleId = watch('vehicleId')
  const vehicle = (vehicles ?? []).find((v) => v.id === vehicleId)
  const isRental = vehicle?.ownership === 'VENDOR'

  // Kendaraan sewa → tujuan surat selalu vendor pemiliknya (backend memaksa).
  useEffect(() => {
    if (isRental && vehicle?.ownerVendor) setValue('vendorId', vehicle.ownerVendor.id)
  }, [isRental, vehicle, setValue])

  const vehicleOptions: SelectOption[] = useMemo(
    () =>
      (vehicles ?? [])
        .filter((v) => v.status !== RESOURCE_STATUS.INACTIVE || v.id === vehicleId)
        .map((v) => ({
          value: v.id,
          label: `${v.plateNumber} · ${v.name}${v.ownership === 'VENDOR' ? ' (sewa)' : ''}`,
        })),
    [vehicles, vehicleId],
  )
  const vendorOptions: SelectOption[] = (vendors ?? [])
    .filter((v) => v.type !== 'OWNER' || v.id === watch('vendorId'))
    .map((v) => ({ value: v.id, label: `${v.name}${v.type === 'OWNER' ? ' (pemilik)' : ''}` }))

  // Info: booking disetujui mendatang untuk kendaraan ini.
  const { data: upcoming } = useBookings(
    { resourceId: vehicle?.resourceId, status: BOOKING_STATUS.APPROVED, limit: 5 },
    { enabled: !!vehicle },
  )
  const nextBooking = (upcoming?.data ?? [])
    .filter((b) => new Date(b.endDate).getTime() > Date.now())
    .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())[0]

  const toPayload = (d: MaintenancePlanFormData): MaintenancePlanPayload => ({
    vehicleId: d.vehicleId,
    vendorId: d.vendorId,
    category: d.category,
    description: d.description.trim(),
    complaint: d.complaint?.trim() || undefined,
    location: d.location?.trim() || undefined,
    plannedDate: fromWibInput(d.plannedDate),
    estimatedDays: d.estimatedDays,
    pickupMethod: d.pickupMethod,
    estimatedCost: d.estimatedCost,
    costBearer: d.costBearer,
    odometer: d.odometer,
  })

  const onSubmit = (d: MaintenancePlanFormData) => {
    setClientError(null)
    const needsLetterData = submitIntent || !isDraft
    if (needsLetterData && (!d.vendorId || !d.plannedDate)) {
      setClientError('Vendor tujuan dan rencana tanggal wajib diisi untuk mengajukan surat.')
      return
    }
    const payload = { ...toPayload(d), ...(isEdit ? {} : { submit: submitIntent }) }
    mutation.mutate(payload, {
      onSuccess: (res) => {
        if (res.warning) window.alert(res.warning)
        router.push(`/maintenance/${res.data.id}`)
      },
    })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <CardHeader
          title="Kendaraan & Vendor"
          description="Kendaraan sewa otomatis diajukan ke vendor pemiliknya"
        />
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <Controller
            control={control}
            name="vehicleId"
            render={({ field }) => (
              <InputSelect
                label="Kendaraan"
                required
                placeholder="Pilih kendaraan"
                options={vehicleOptions}
                value={field.value ?? ''}
                disabled={isEdit && !isDraft}
                error={errors.vehicleId?.message}
                onChange={(e) => {
                  const id = e.target.value ? Number(e.target.value) : undefined
                  field.onChange(id)
                  const v = (vehicles ?? []).find((x) => x.id === id)
                  setValue('odometer', v?.currentOdometer)
                  // Pindah dari kendaraan sewa: vendor pemilik yang terisi otomatis dilepas.
                  const cur = (vendors ?? []).find((x) => x.id === watch('vendorId'))
                  if (v?.ownership !== 'VENDOR' && cur?.type === 'OWNER') setValue('vendorId', undefined)
                }}
              />
            )}
          />
          <Controller
            control={control}
            name="vendorId"
            render={({ field }) => (
              <div>
                <InputSelect
                  label="Vendor / Bengkel Tujuan"
                  required={!isDraft}
                  placeholder="Pilih vendor"
                  options={vendorOptions}
                  value={field.value ?? ''}
                  disabled={isRental}
                  hint={
                    isRental
                      ? `Kendaraan sewa - otomatis ke ${vehicle?.ownerVendor?.name ?? 'vendor pemilik'}`
                      : undefined
                  }
                  onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                />
                {!isRental && (
                  <Link
                    href="/maintenance/vendors"
                    target="_blank"
                    className="mt-1.5 inline-block text-xs font-medium text-[var(--primary)] hover:underline"
                  >
                    + Kelola vendor & bengkel
                  </Link>
                )}
              </div>
            )}
          />
        </div>
        {nextBooking && (
          <div className="mt-5">
            <WarningAlert>
              Kendaraan ini punya booking disetujui mulai{' '}
              <span className="font-semibold">{formatDateTime(nextBooking.startDate)}</span>. Pastikan
              jadwal maintenance tidak bentrok (sistem akan memberi peringatan bila bentrok).
            </WarningAlert>
          </div>
        )}
      </Card>

      <Card>
        <CardHeader title="Pekerjaan yang Dimohon" />
        <div className="space-y-5">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <InputSelect
              label="Jenis Pekerjaan"
              required
              options={MAINTENANCE_CATEGORY_OPTIONS}
              error={errors.category?.message}
              {...register('category')}
            />
            <Controller
              control={control}
              name="odometer"
              render={({ field }) => (
                <InputNumber
                  label="Odometer Saat Ini (km)"
                  min={0}
                  value={field.value ?? ''}
                  onChange={field.onChange}
                  hint={vehicle ? kmHint(['Km terakhir kendaraan', vehicle.currentOdometer]) : undefined}
                />
              )}
            />
          </div>
          <InputTextArea
            label="Uraian Pekerjaan"
            required
            rows={3}
            placeholder="mis. Ganti kampas rem depan & periksa sistem pengereman"
            error={errors.description?.message}
            {...register('description')}
          />
          <InputTextArea
            label="Keluhan (opsional)"
            rows={2}
            placeholder="mis. Rem berbunyi saat pengereman"
            {...register('complaint')}
          />
        </div>
      </Card>

      <Card>
        <CardHeader
          title="Rencana Pelaksanaan"
          description="Tanggal rencana memblokir booking kendaraan setelah surat diajukan"
        />
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <InputDateTime
            label="Rencana Tanggal"
            required={!isDraft}
            error={errors.plannedDate?.message}
            {...register('plannedDate')}
          />
          <Controller
            control={control}
            name="estimatedDays"
            render={({ field }) => (
              <InputNumber
                label="Estimasi Lama (hari)"
                required
                min={1}
                max={365}
                value={field.value ?? ''}
                onChange={field.onChange}
                error={errors.estimatedDays?.message}
              />
            )}
          />
          <Controller
            control={control}
            name="pickupMethod"
            render={({ field }) => (
              <InputSelect
                label="Cara Serah"
                placeholder="Pilih cara serah"
                options={PICKUP_METHOD_OPTIONS}
                value={field.value ?? ''}
                onChange={(e) => field.onChange(e.target.value || undefined)}
              />
            )}
          />
          <InputText label="Lokasi (opsional)" placeholder="mis. Bengkel cabang Bekasi" {...register('location')} />
          <Controller
            control={control}
            name="estimatedCost"
            render={({ field }) => (
              <InputRupiah label="Estimasi Biaya (opsional)" value={field.value} onChange={field.onChange} />
            )}
          />
          <Controller
            control={control}
            name="costBearer"
            render={({ field }) => (
              <InputSelect
                label="Biaya Ditanggung"
                placeholder="Belum diisi"
                options={COST_BEARER_OPTIONS}
                value={field.value ?? ''}
                onChange={(e) => field.onChange(e.target.value || undefined)}
              />
            )}
          />
        </div>
      </Card>

      {isDraft && !isEdit && (
        <div className="flex items-start gap-2.5 rounded-xl border border-[var(--border-card)] bg-[var(--bg-subtle)] px-4 py-3 text-sm text-[var(--text-secondary)]">
          <Info className="mt-0.5 h-4 w-4 shrink-0" />
          <span>
            <b>Simpan Draf</b> belum membuat surat. <b>Simpan & Ajukan</b> langsung membuat nomor surat
            dan PDF Surat Pengajuan yang bisa dicetak dari halaman detail.
          </span>
        </div>
      )}

      <ErrorAlert error={clientError ?? mutation.error} />

      <div className="flex flex-wrap items-center justify-end gap-3">
        <AppButton type="button" variant="secondary" onClick={() => router.back()}>
          Batal
        </AppButton>
        {isEdit ? (
          <AppButton type="submit" loading={mutation.isPending} onClick={() => setSubmitIntent(false)}>
            Simpan Perubahan
          </AppButton>
        ) : (
          <>
            <AppButton
              type="submit"
              variant="secondary"
              loading={mutation.isPending && !submitIntent}
              onClick={() => setSubmitIntent(false)}
            >
              Simpan Draf
            </AppButton>
            <AppButton
              type="submit"
              leftIcon={<Send className="h-4 w-4" />}
              loading={mutation.isPending && submitIntent}
              onClick={() => setSubmitIntent(true)}
            >
              Simpan & Ajukan
            </AppButton>
          </>
        )}
      </div>
    </form>
  )
}

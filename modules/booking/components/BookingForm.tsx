'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { AlertCircle, AlertTriangle, Building2, Car, Clock, DoorOpen } from 'lucide-react'
import { Card, CardHeader, CardSection } from '@/components/common'
import { AppButton, InputTextArea } from '@/components/ui-custom'
import {
  AvailabilityCalendar,
  ResourceStatusBadge,
  type CalendarEvent,
  type DateTimeRange,
} from '@/components/shared'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { getErrorMessage, formatShortDate, formatDuration } from '@/lib'
import { RESOURCE_TYPE, RESOURCE_STATUS } from '@/constants'
import type { ResourceStatus, ResourceType } from '@/types'
import {
  createBookingSchema,
  type CreateBookingFormData,
} from '@/schemas/booking.schema'
import { useCreateBooking } from '../hooks/useBookings'
import { useVehicles } from '@/modules/vehicles/hooks/useVehicles'
import { useRooms } from '@/modules/rooms/hooks/useRooms'

// ─────────────────────────────────────────
// Bentuk resource yang bisa dipilih (vehicle/room
// dinormalisasi jadi satu shape)
// ─────────────────────────────────────────

interface SelectableResource {
  resourceId: number
  name: string
  subtitle: string
  status: ResourceStatus
  type: ResourceType
}

export const BookingForm = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const preselectedResourceId = searchParams.get('resourceId')
  const preselectedType = searchParams.get('type') as ResourceType | null

  const [activeTab, setActiveTab] = useState<ResourceType>(
    preselectedType === RESOURCE_TYPE.ROOM
      ? RESOURCE_TYPE.ROOM
      : RESOURCE_TYPE.VEHICLE,
  )
  const [selected, setSelected] = useState<SelectableResource | null>(null)
  // Tampilkan picker? Default disembunyikan jika ada preselect.
  const [showPicker, setShowPicker] = useState(!preselectedResourceId)
  // Jadwal terpilih dari calendar (tanggal + jam, sudah dikonfirmasi)
  const [schedule, setSchedule] = useState<DateTimeRange | null>(null)
  const [conflicts, setConflicts] = useState<CalendarEvent[]>([])

  const { data: vehicles, isLoading: loadingVehicles } = useVehicles({
    limit: 100,
  })
  const { data: rooms, isLoading: loadingRooms } = useRooms({ limit: 100 })

  const { mutate, isPending, error } = useCreateBooking()

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<CreateBookingFormData>({
    resolver: zodResolver(createBookingSchema),
    defaultValues: { purpose: '' },
  })

  // Normalisasi resource list sesuai tab
  const resources: SelectableResource[] =
    activeTab === RESOURCE_TYPE.VEHICLE
      ? (vehicles ?? []).map((v) => ({
          resourceId: v.resourceId,
          name: v.name,
          subtitle: v.plateNumber,
          status: v.status,
          type: RESOURCE_TYPE.VEHICLE,
        }))
      : (rooms ?? []).map((r) => ({
          resourceId: r.resourceId,
          name: r.name,
          subtitle: r.location,
          status: r.status,
          type: RESOURCE_TYPE.ROOM,
        }))

  const isLoadingResources =
    activeTab === RESOURCE_TYPE.VEHICLE ? loadingVehicles : loadingRooms

  // Pilih resource → set form value, reset range
  const handleSelectResource = (resource: SelectableResource) => {
    setSelected(resource)
    setShowPicker(false)
    setValue('resourceId', resource.resourceId, { shouldValidate: true })
    setSchedule(null)
    setConflicts([])
    setValue('startDate', '', { shouldValidate: false })
    setValue('endDate', '', { shouldValidate: false })
  }

  // Auto-select resource dari query param (sekali, saat data siap)
  useEffect(() => {
    if (!preselectedResourceId || selected) return
    const idNum = Number(preselectedResourceId)
    if (preselectedType === RESOURCE_TYPE.ROOM) {
      const r = (rooms ?? []).find((x) => x.resourceId === idNum)
      if (r) {
        setActiveTab(RESOURCE_TYPE.ROOM)
        handleSelectResource({
          resourceId: r.resourceId,
          name: r.name,
          subtitle: r.location,
          status: r.status,
          type: RESOURCE_TYPE.ROOM,
        })
      }
    } else {
      const v = (vehicles ?? []).find((x) => x.resourceId === idNum)
      if (v) {
        setActiveTab(RESOURCE_TYPE.VEHICLE)
        handleSelectResource({
          resourceId: v.resourceId,
          name: v.name,
          subtitle: v.plateNumber,
          status: v.status,
          type: RESOURCE_TYPE.VEHICLE,
        })
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [preselectedResourceId, preselectedType, vehicles, rooms])

  // Konfirmasi jadwal dari calendar (tanggal + jam digabung jadi ISO)
  const handleDateTimeSelect = (range: DateTimeRange) => {
    setSchedule(range)
    const startISO = new Date(
      `${formatYMD(range.startDate)}T${range.startTime}:00`,
    ).toISOString()
    const endISO = new Date(
      `${formatYMD(range.endDate)}T${range.endTime}:00`,
    ).toISOString()
    setValue('startDate', startISO, { shouldValidate: true })
    setValue('endDate', endISO, { shouldValidate: true })
  }

  // ISO gabungan tanggal + jam (untuk ringkasan & durasi)
  const startISO = schedule
    ? new Date(
        `${formatYMD(schedule.startDate)}T${schedule.startTime}:00`,
      ).toISOString()
    : null
  const endISO = schedule
    ? new Date(
        `${formatYMD(schedule.endDate)}T${schedule.endTime}:00`,
      ).toISOString()
    : null

  const onSubmit = (data: CreateBookingFormData) =>
    mutate(data, { onSuccess: () => router.push('/booking') })

  const TypeIcon = selected?.type === RESOURCE_TYPE.ROOM ? Building2 : Car

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* ── a. Resource: summary (preselect) atau picker ── */}
      {selected && !showPicker ? (
        <Card>
          <CardHeader title="Resource Dipilih" />
          <CardSection className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--bg-card)] text-[var(--text-secondary)]">
              <TypeIcon className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-[var(--text-primary)]">
                {selected.name}
              </p>
              <p className="truncate text-xs text-[var(--text-secondary)]">
                {selected.subtitle}
              </p>
            </div>
            <ResourceStatusBadge status={selected.status} />
            <button
              type="button"
              onClick={() => setShowPicker(true)}
              className="text-xs font-medium text-[var(--primary)] hover:underline"
            >
              Ganti
            </button>
          </CardSection>
        </Card>
      ) : (
        <Card>
          <CardHeader
            title="Pilih Resource"
            description="Pilih kendaraan atau ruangan yang ingin dipinjam"
          />

          <Tabs
            value={activeTab}
            onValueChange={(v) => {
              setActiveTab(v as ResourceType)
              setSelected(null)
              setSchedule(null)
              setConflicts([])
            }}
            className="mb-4"
          >
            <TabsList className="rounded-lg bg-[var(--bg-subtle)] p-1">
              <TabsTrigger
                value={RESOURCE_TYPE.VEHICLE}
                className="rounded-md px-4 text-sm font-medium text-[var(--text-secondary)] data-[state=active]:bg-[var(--bg-card)] data-[state=active]:text-[var(--primary)] data-[state=active]:shadow-sm"
              >
                Kendaraan
              </TabsTrigger>
              <TabsTrigger
                value={RESOURCE_TYPE.ROOM}
                className="rounded-md px-4 text-sm font-medium text-[var(--text-secondary)] data-[state=active]:bg-[var(--bg-card)] data-[state=active]:text-[var(--primary)] data-[state=active]:shadow-sm"
              >
                Ruangan
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {isLoadingResources ? (
            <p className="py-8 text-center text-sm text-[var(--text-secondary)]">
              Memuat resource…
            </p>
          ) : resources.length === 0 ? (
            <p className="py-8 text-center text-sm text-[var(--text-secondary)]">
              Tidak ada resource tersedia
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {resources.map((resource) => {
                const isSelected = selected?.resourceId === resource.resourceId
                const isAvailable = resource.status === RESOURCE_STATUS.AVAILABLE
                const ResIcon =
                  resource.type === RESOURCE_TYPE.ROOM ? DoorOpen : Car

                return (
                  <button
                    key={resource.resourceId}
                    type="button"
                    disabled={!isAvailable}
                    onClick={() => handleSelectResource(resource)}
                    className={cnCard(isSelected, isAvailable)}
                  >
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[var(--bg-subtle)] text-[var(--text-secondary)]">
                      <ResIcon className="h-5 w-5" />
                    </span>
                    <div className="min-w-0 flex-1 text-left">
                      <p className="truncate text-sm font-semibold text-[var(--text-primary)]">
                        {resource.name}
                      </p>
                      <p className="truncate text-xs text-[var(--text-secondary)]">
                        {resource.subtitle}
                      </p>
                    </div>
                    <ResourceStatusBadge status={resource.status} />
                  </button>
                )
              })}
            </div>
          )}

          {errors.resourceId && (
            <p className="mt-2 flex items-center gap-1 text-xs text-[var(--danger)]">
              <AlertCircle className="h-3 w-3" /> {errors.resourceId.message}
            </p>
          )}
        </Card>
      )}

      {/* ── b. Kalender ketersediaan (setelah pilih resource) ── */}
      {selected && (
        <Card>
          <CardHeader
            title="Pilih Jadwal"
            description="Klik tanggal mulai lalu tanggal selesai, lalu pilih jam"
          />
          <AvailabilityCalendar
            resourceId={selected.resourceId}
            resourceType={selected.type}
            mode="range"
            minDate={new Date()}
            onSelectDateTime={handleDateTimeSelect}
            onConflictDetected={setConflicts}
          />

          {/* Banner bentrok */}
          {conflicts.length > 0 && (
            <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              <div>
                <p className="font-semibold">Jadwal bentrok</p>
                <ul className="mt-1 space-y-0.5 text-xs">
                  {conflicts.map((c) => (
                    <li key={c.id}>
                      • {c.startTime}–{c.endTime} — {c.title}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {(errors.startDate || errors.endDate) && (
            <p className="mt-2 flex items-center gap-1 text-xs text-[var(--danger)]">
              <AlertCircle className="h-3 w-3" /> Tanggal mulai & selesai wajib
              dipilih
            </p>
          )}
        </Card>
      )}

      {/* ── c. Detail (setelah jadwal dikonfirmasi) ── */}
      {selected && schedule && (
        <Card>
          <CardHeader title="Detail Booking" />

          {/* Ringkasan resource */}
          <CardSection className="mb-5 flex items-center gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[var(--bg-card)] text-[var(--text-secondary)]">
              <TypeIcon className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-[var(--text-primary)]">
                {selected.name}
              </p>
              <p className="truncate text-xs text-[var(--text-secondary)]">
                {selected.subtitle}
              </p>
            </div>
          </CardSection>

          {/* Ringkasan jadwal (read-only — dari calendar) */}
          <CardSection className="mb-5">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.07em] text-[var(--text-secondary)]">
                  MULAI
                </p>
                <p className="font-medium text-[var(--text-primary)]">
                  {formatShortDate(schedule.startDate)}
                </p>
                <p className="text-xs text-[var(--text-secondary)]">
                  {schedule.startTime} WIB
                </p>
              </div>
              <div>
                <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.07em] text-[var(--text-secondary)]">
                  SELESAI
                </p>
                <p className="font-medium text-[var(--text-primary)]">
                  {formatShortDate(schedule.endDate)}
                </p>
                <p className="text-xs text-[var(--text-secondary)]">
                  {schedule.endTime} WIB
                </p>
              </div>
            </div>
            <div className="mt-3 flex items-center gap-2 rounded-lg border border-[var(--border-divider)] bg-[var(--bg-card)] px-3 py-2">
              <Clock className="h-3.5 w-3.5 text-[var(--text-secondary)]" />
              <span className="text-xs text-[var(--text-secondary)]">
                Durasi:{' '}
                <span className="font-medium text-[var(--text-primary)]">
                  {formatDuration(startISO, endISO)}
                </span>
              </span>
            </div>
          </CardSection>

          {/* Tujuan */}
          <InputTextArea
            label="Tujuan Peminjaman"
            required
            rows={4}
            placeholder="Jelaskan tujuan peminjaman (minimal 10 karakter)…"
            maxLength={500}
            showCount
            error={errors.purpose?.message}
            {...register('purpose')}
          />
        </Card>
      )}

      {/* ── d. Error alert ── */}
      {error && (
        <div className="flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{getErrorMessage(error)}</span>
        </div>
      )}

      {/* ── e. Aksi ── */}
      <div className="flex items-center justify-end gap-3">
        <AppButton
          type="button"
          variant="secondary"
          onClick={() => router.push('/booking')}
        >
          Batal
        </AppButton>
        <AppButton type="submit" variant="primary" loading={isPending}>
          Ajukan Booking
        </AppButton>
      </div>
    </form>
  )
}

// ─────────────────────────────────────────
// Helper kecil
// ─────────────────────────────────────────

const cnCard = (isSelected: boolean, isAvailable: boolean) =>
  [
    'flex items-center gap-3 rounded-xl border p-3 transition-all',
    isSelected
      ? 'border-[1.5px] border-[var(--primary)] bg-[var(--primary-light)]'
      : 'border-[var(--border-card)] bg-[var(--bg-card)] hover:border-[var(--border-input)]',
    !isAvailable && 'cursor-not-allowed opacity-50',
  ]
    .filter(Boolean)
    .join(' ')

/** YYYY-MM-DD dari komponen tanggal lokal (bukan UTC) */
const formatYMD = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
    d.getDate(),
  ).padStart(2, '0')}`

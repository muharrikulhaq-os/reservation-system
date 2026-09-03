'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { AlertCircle, Building2, Car, Clock, UserCheck } from 'lucide-react'
import { Card, CardHeader, CardSection } from '@/components/common'
import { AppButton, InputTextArea, InputNumber } from '@/components/ui-custom'
import { DriverSelector } from './DriverSelector'
import { ResourcePicker } from './ResourcePicker'
import {
  AvailabilityCalendar,
  ResourceStatusBadge,
  BookingTypeBadge,
  SpdActiveBadge,
  SafeImage,
  type CalendarEvent,
  type DateTimeRange,
} from '@/components/shared'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn, getErrorMessage, formatShortDate, formatDuration, resolveFileUrl } from '@/lib'
import { RESOURCE_TYPE, BOOKING_TYPE, BOOKING_TYPE_CONFIG, BOOKING_STATUS } from '@/constants'
import type { ResourceType, Vehicle, Room, BookingType } from '@/types'
import {
  createBookingSchema,
  type CreateBookingFormData,
} from '@/schemas/booking.schema'
import { useCreateBooking } from '../hooks/useBookings'
import { useVehicles } from '@/modules/vehicles/hooks/useVehicles'
import { useRooms } from '@/modules/rooms/hooks/useRooms'

export const BookingForm = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const preselectedResourceId = searchParams.get('resourceId')
  const preselectedType = searchParams.get('type') as ResourceType | null

  const [resourceType, setResourceType] = useState<ResourceType>(
    preselectedType === RESOURCE_TYPE.ROOM
      ? RESOURCE_TYPE.ROOM
      : RESOURCE_TYPE.VEHICLE,
  )
  const [selected, setSelected] = useState<Vehicle | Room | null>(null)
  const [showPicker, setShowPicker] = useState(!preselectedResourceId)
  const [schedule, setSchedule] = useState<DateTimeRange | null>(null)
  const [conflicts, setConflicts] = useState<CalendarEvent[]>([])
  // Jadwal bentrok tetap boleh diajukan (nanti admin gabungkan/alihkan saat
  // approve) - tapi harus lewat keputusan eksplisit, bukan lolos diam-diam.
  const [conflictAcknowledged, setConflictAcknowledged] = useState(false)
  const [selectedDriverId, setSelectedDriverId] = useState<number | null>(null)
  const [suggestedDriverId, setSuggestedDriverId] = useState<number | null>(null)
  const [passengerCount, setPassengerCount] = useState<number>(1)
  const [bookingType, setBookingType] = useState<BookingType>(BOOKING_TYPE.NON_SPD)

  // Untuk resolusi preselect dari query param
  const { data: vehicles } = useVehicles({ limit: 100 })
  const { data: rooms } = useRooms({ limit: 100 })

  const { mutate, isPending, error } = useCreateBooking()

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<CreateBookingFormData>({
    resolver: zodResolver(createBookingSchema),
    defaultValues: { purpose: '', passengerCount: 1 },
  })

  const isVehicle = resourceType === RESOURCE_TYPE.VEHICLE
  const capacity =
    isVehicle && selected ? (selected as Vehicle).capacity : undefined
  const subtitle = selected
    ? isVehicle
      ? (selected as Vehicle).plateNumber
      : (selected as Room).location
    : ''

  // Pilih resource → set form value + reset turunannya
  const handleSelectResource = (resource: Vehicle | Room) => {
    setSelected(resource)
    setShowPicker(false)
    setValue('resourceId', resource.resourceId, { shouldValidate: true })
    setSchedule(null)
    setConflicts([])
    setConflictAcknowledged(false)
    setSelectedDriverId(null)
    setSuggestedDriverId(null)
    setPassengerCount(1)
    setBookingType(BOOKING_TYPE.NON_SPD)
    setValue('passengerCount', 1, { shouldValidate: true })
    setValue('startDate', '', { shouldValidate: false })
    setValue('endDate', '', { shouldValidate: false })
  }

  const resetOnTabChange = (type: ResourceType) => {
    setResourceType(type)
    setSelected(null)
    setSchedule(null)
    setConflicts([])
    setConflictAcknowledged(false)
    setSelectedDriverId(null)
    setSuggestedDriverId(null)
    setPassengerCount(1)
    setBookingType(BOOKING_TYPE.NON_SPD)
  }

  // Auto-select resource dari query param (sekali, saat data siap)
  useEffect(() => {
    if (!preselectedResourceId || selected) return
    const idNum = Number(preselectedResourceId)
    if (preselectedType === RESOURCE_TYPE.ROOM) {
      const r = (rooms ?? []).find((x) => x.resourceId === idNum)
      if (r) {
        setResourceType(RESOURCE_TYPE.ROOM)
        handleSelectResource(r)
      }
    } else {
      const v = (vehicles ?? []).find((x) => x.resourceId === idNum)
      if (v) {
        setResourceType(RESOURCE_TYPE.VEHICLE)
        handleSelectResource(v)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [preselectedResourceId, preselectedType, vehicles, rooms])

  // Konfirmasi jadwal dari calendar (tanggal + jam digabung jadi ISO)
  const handleDateTimeSelect = (range: DateTimeRange) => {
    setSchedule(range)
    setConflictAcknowledged(false)
    setValue(
      'startDate',
      new Date(`${formatYMD(range.startDate)}T${range.startTime}:00`).toISOString(),
      { shouldValidate: true },
    )
    setValue(
      'endDate',
      new Date(`${formatYMD(range.endDate)}T${range.endTime}:00`).toISOString(),
      { shouldValidate: true },
    )
  }

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

  const handlePassengerChange = (v: number | undefined) => {
    const n = v ?? 1
    setPassengerCount(n)
    setValue('passengerCount', n, { shouldValidate: true })
  }

  // Validasi kapasitas (butuh data kendaraan)
  const isPassengerValid =
    !isVehicle || (passengerCount >= 1 && passengerCount <= (capacity ?? 0))

  // Jadwal siap dipakai lanjut: sudah dikonfirmasi, dan kalau bentrok, admin
  // sudah eksplisit pilih "Tetap Ajukan" di panel keputusan.
  const scheduleReady = !!schedule && (conflicts.length === 0 || conflictAcknowledged)

  const finalDriverId = selectedDriverId ?? suggestedDriverId ?? undefined

  const onSubmit = (data: CreateBookingFormData) =>
    mutate(
      {
        ...data,
        passengerCount: isVehicle ? passengerCount : 1,
        driverId: isVehicle ? finalDriverId : undefined,
        bookingType: isVehicle ? bookingType : undefined,
      },
      { onSuccess: () => router.push('/booking') },
    )

  const TypeIcon = isVehicle ? Car : Building2

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* ── a. Resource: summary atau picker ── */}
      {selected && !showPicker ? (
        <Card>
          <CardHeader title="Resource Dipilih" />
          <CardSection className="flex items-center gap-3">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[var(--bg-subtle)] text-[var(--text-secondary)]">
              <SafeImage
                src={resolveFileUrl(selected.photoUrl)}
                alt={selected.name}
                className="h-full w-full object-cover"
                fallback={<TypeIcon className="h-6 w-6" />}
              />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-[var(--text-primary)]">
                {selected.name}
              </p>
              <p className="truncate text-xs text-[var(--text-secondary)]">
                {subtitle}
              </p>
            </div>
            <div className="flex shrink-0 flex-col items-end gap-1">
              <ResourceStatusBadge status={selected.status} />
              {isVehicle && (selected as Vehicle).isSpdActive && <SpdActiveBadge />}
            </div>
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
            value={resourceType}
            onValueChange={(v) => resetOnTabChange(v as ResourceType)}
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

          <ResourcePicker
            resourceType={resourceType}
            value={selected?.id ?? null}
            onChange={handleSelectResource}
          />

          {errors.resourceId && (
            <p className="mt-2 flex items-center gap-1 text-xs text-[var(--danger)]">
              <AlertCircle className="h-3 w-3" /> {errors.resourceId.message}
            </p>
          )}
        </Card>
      )}

      {/* ── a2. Jumlah penumpang (hanya VEHICLE) ── */}
      {selected && isVehicle && (
        <Card>
          <CardHeader title="Jumlah Penumpang" />
          <div className="max-w-[220px]">
            <InputNumber
              label="Jumlah Penumpang"
              min={1}
              max={capacity}
              value={passengerCount}
              onChange={handlePassengerChange}
            />
          </div>
          <p className="mt-1 text-xs text-[var(--text-secondary)]">
            Kapasitas {selected.name}: {capacity} orang
          </p>
          {!isPassengerValid && (
            <p className="mt-1 flex items-center gap-1 text-xs text-[var(--danger)]">
              <AlertCircle className="h-3 w-3" />
              Jumlah penumpang melebihi kapasitas kendaraan ({capacity} orang)
            </p>
          )}
        </Card>
      )}

      {/* ── b. Kalender ketersediaan ── */}
      {selected && (
        <Card>
          <CardHeader
            title="Pilih Jadwal"
            description="Klik tanggal mulai lalu tanggal selesai, lalu pilih jam"
          />
          <AvailabilityCalendar
            resourceId={selected.resourceId}
            resourceType={resourceType}
            mode="range"
            minDate={new Date()}
            allowConflictOverride
            onSelectDateTime={handleDateTimeSelect}
            onConflictDetected={setConflicts}
          />

          {(errors.startDate || errors.endDate) && (
            <p className="mt-2 flex items-center gap-1 text-xs text-[var(--danger)]">
              <AlertCircle className="h-3 w-3" /> Tanggal mulai & selesai wajib
              dipilih
            </p>
          )}
        </Card>
      )}

      {/* ── b2. Jadwal bentrok - keputusan wajib sebelum lanjut ── */}
      {selected && schedule && conflicts.length > 0 && !conflictAcknowledged && (
        <Card className="border-amber-200 bg-amber-50/40">
          <div className="flex items-start gap-2.5">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-700" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-amber-800">
                Jadwal ini bentrok dengan booking lain
              </p>
              <ul className="mt-1.5 space-y-0.5 text-xs text-amber-700">
                {conflicts.map((c) => (
                  <li key={c.id}>
                    • {c.startTime}–{c.endTime} - {c.title}
                  </li>
                ))}
              </ul>
              <p className="mt-2 text-xs text-amber-700">
                {isVehicle ? 'Kendaraan' : 'Ruangan'} ini sudah dipakai/dipesan
                di jadwal yang sama. Anda bisa pilih {isVehicle ? 'kendaraan' : 'ruangan'} lain,
                atau tetap ajukan - admin akan menggabungkan (merge) atau
                mengalihkan booking ini saat meninjau.
              </p>
              <div className="mt-3 flex gap-2">
                <AppButton
                  type="button"
                  size="sm"
                  variant="secondary"
                  onClick={() => {
                    setShowPicker(true)
                    setSelected(null)
                    setSchedule(null)
                    setConflicts([])
                  }}
                >
                  Pilih {isVehicle ? 'Kendaraan' : 'Ruangan'} Lain
                </AppButton>
                <AppButton
                  type="button"
                  size="sm"
                  onClick={() => setConflictAcknowledged(true)}
                >
                  Tetap Ajukan
                </AppButton>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* ── c. Detail (setelah jadwal dikonfirmasi & bentrok diputuskan) ── */}
      {selected && scheduleReady && (
        <Card>
          <CardHeader title="Detail Booking" />

          <CardSection className="mb-5 flex items-center gap-3">
            <span className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[var(--bg-subtle)] text-[var(--text-secondary)]">
              <SafeImage
                src={resolveFileUrl(selected.photoUrl)}
                alt={selected.name}
                className="h-full w-full object-cover"
                fallback={<TypeIcon className="h-6 w-6" />}
              />
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-[var(--text-primary)]">
                {selected.name}
              </p>
              <p className="truncate text-xs text-[var(--text-secondary)]">
                {subtitle}
              </p>
            </div>
          </CardSection>

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

          {isVehicle && (
            <div className="mb-5">
              <div className="mb-1.5 flex items-center justify-between gap-2">
                <label className="block text-[10px] font-semibold uppercase tracking-[0.07em] text-[var(--text-secondary)]">
                  Jenis Perjalanan <span className="text-[var(--danger)]">*</span>
                </label>
                <BookingTypeBadge bookingType={bookingType} status={BOOKING_STATUS.PENDING} />
              </div>
              <div className="grid grid-cols-2 gap-2">
                {([BOOKING_TYPE.NON_SPD, BOOKING_TYPE.SPD] as const).map((bt) => {
                  const active = bookingType === bt
                  return (
                    <button
                      key={bt}
                      type="button"
                      onClick={() => setBookingType(bt)}
                      className={cn(
                        'flex h-10 items-center justify-center rounded-lg border text-sm font-medium transition-all',
                        active
                          ? 'border-[1.5px] border-[var(--primary)] bg-[var(--primary-light)] text-[var(--primary)]'
                          : 'border-[var(--border-input)] text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)]',
                      )}
                    >
                      {BOOKING_TYPE_CONFIG[bt].label}
                    </button>
                  )
                })}
              </div>
              <p className="mt-1.5 text-xs text-[var(--text-disabled)]">
                {BOOKING_TYPE_CONFIG[bookingType].description}
              </p>
            </div>
          )}

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

      {/* ── c2. Driver - hanya VEHICLE, setelah jadwal ──
          Kendaraan dengan supir tetap (fixedDriver) otomatis pakai supir itu -
          tidak ada pilihan lain, jadi DriverSelector diganti info terkunci.
          Kalau admin perlu ganti supir (mis. berhalangan), itu ditangani lewat
          alur assign-vehicle admin setelah booking dibuat, bukan di sini. */}
      {isVehicle && selected && scheduleReady && startISO && endISO && (
        (selected as Vehicle).fixedDriver ? (
          <Card>
            <CardHeader title="Driver" />
            <div className="flex items-center gap-3 rounded-lg border border-[var(--border-divider)] bg-[var(--bg-subtle)] px-4 py-3">
              <UserCheck className="h-4 w-4 shrink-0 text-[var(--primary)]" />
              <div className="min-w-0">
                <p className="text-sm font-semibold text-[var(--text-primary)]">
                  {(selected as Vehicle).fixedDriver!.name}
                </p>
                <p className="text-xs text-[var(--text-secondary)]">
                  Supir tetap kendaraan ini - dipilih otomatis
                </p>
              </div>
            </div>
          </Card>
        ) : (
          <Card>
            <CardHeader
              title="Pilih Driver"
              description="Kosongkan untuk penugasan otomatis / oleh admin"
            />
            <DriverSelector
              startDate={startISO}
              endDate={endISO}
              passengerCount={passengerCount}
              bookedVehicleCapacity={capacity ?? null}
              bookedVehiclePlate={
                isVehicle ? (selected as Vehicle).plateNumber : null
              }
              value={selectedDriverId}
              onChange={setSelectedDriverId}
              onSuggestedChange={setSuggestedDriverId}
            />
          </Card>
        )
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
        <AppButton
          type="submit"
          variant="primary"
          loading={isPending}
          disabled={isPending || !isPassengerValid || !scheduleReady}
        >
          Ajukan Booking
        </AppButton>
      </div>
    </form>
  )
}

// ─────────────────────────────────────────
// Helper
// ─────────────────────────────────────────

/** YYYY-MM-DD dari komponen tanggal lokal (bukan UTC) */
const formatYMD = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
    d.getDate(),
  ).padStart(2, '0')}`

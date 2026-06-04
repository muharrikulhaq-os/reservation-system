'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { AlertCircle, Car, Clock, DoorOpen } from 'lucide-react'
import { Card, CardHeader, CardSection } from '@/components/common'
import { AppButton, InputTextArea } from '@/components/ui-custom'
import { AvailabilityCalendar, ResourceStatusBadge } from '@/components/shared'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { getErrorMessage, formatDate, formatDuration } from '@/lib'
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

  const [activeTab, setActiveTab] = useState<ResourceType>(RESOURCE_TYPE.VEHICLE)
  const [selected, setSelected] = useState<SelectableResource | null>(null)
  const [range, setRange] = useState<{ start: Date | null; end: Date | null }>({
    start: null,
    end: null,
  })

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
    setValue('resourceId', resource.resourceId, { shouldValidate: true })
    setRange({ start: null, end: null })
    setValue('startDate', '', { shouldValidate: false })
    setValue('endDate', '', { shouldValidate: false })
  }

  // Pilih tanggal mulai (klik pertama)
  const handleSelectStart = (date: Date) => {
    setRange({ start: date, end: null })
    setValue('startDate', '', { shouldValidate: false })
    setValue('endDate', '', { shouldValidate: false })
  }

  // Pilih range lengkap (klik kedua)
  const handleSelectRange = ({ start, end }: { start: Date; end: Date }) => {
    setRange({ start, end })
    setValue('startDate', start.toISOString(), { shouldValidate: true })
    setValue('endDate', end.toISOString(), { shouldValidate: true })
  }

  const hasRange = !!range.start && !!range.end

  const onSubmit = (data: CreateBookingFormData) =>
    mutate(data, { onSuccess: () => router.push('/booking') })

  const TypeIcon = selected?.type === RESOURCE_TYPE.ROOM ? DoorOpen : Car

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* ── a. Pemilihan resource ── */}
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
            setRange({ start: null, end: null })
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

      {/* ── b. Kalender ketersediaan (setelah pilih resource) ── */}
      {selected && (
        <Card>
          <CardHeader
            title="Pilih Tanggal"
            description="Klik tanggal mulai lalu tanggal selesai pada kalender"
          />
          <AvailabilityCalendar
            resourceId={selected.resourceId}
            resourceType={selected.type}
            mode="range"
            minDate={new Date()}
            selectedRange={range}
            onSelectDate={handleSelectStart}
            onSelectRange={handleSelectRange}
          />
          {(errors.startDate || errors.endDate) && (
            <p className="mt-2 flex items-center gap-1 text-xs text-[var(--danger)]">
              <AlertCircle className="h-3 w-3" /> Tanggal mulai & selesai wajib
              dipilih
            </p>
          )}
        </Card>
      )}

      {/* ── c. Detail (setelah range lengkap) ── */}
      {selected && hasRange && range.start && range.end && (
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

          {/* Info tanggal + durasi */}
          <div className="mb-5 flex flex-wrap items-center gap-2">
            <DateChip label="Mulai" value={formatDate(range.start.toISOString())} />
            <DateChip
              label="Selesai"
              value={formatDate(range.end.toISOString())}
            />
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--primary-light)] px-3 py-1 text-xs font-semibold text-[var(--primary)]">
              <Clock className="h-3.5 w-3.5" />
              {formatDuration(range.start.toISOString(), range.end.toISOString())}
            </span>
          </div>

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

const DateChip = ({ label, value }: { label: string; value: string }) => (
  <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--bg-subtle)] px-3 py-1 text-xs text-[var(--text-secondary)]">
    <span className="font-semibold text-[var(--text-primary)]">{label}:</span>
    {value}
  </span>
)

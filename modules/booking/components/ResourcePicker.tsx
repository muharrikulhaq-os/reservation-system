'use client'

import { Search, Car, Building2, Check, ChevronLeft, ChevronRight } from 'lucide-react'
import { InputText, IconButton } from '@/components/ui-custom'
import { cn, resolveFileUrl } from '@/lib'
import { useTableFilter } from '@/hooks'
import { RESOURCE_TYPE, RESOURCE_STATUS } from '@/constants'
import type { ResourceType, Vehicle, Room } from '@/types'
import { useVehiclesPaginated } from '@/modules/vehicles/hooks/useVehicles'
import { useRoomsPaginated } from '@/modules/rooms/hooks/useRooms'
import { ResourceStatusBadge } from '@/components/shared'

// ─────────────────────────────────────────
// RESOURCE PICKER
// Pilih kendaraan/ruangan - search + pagination + foto
// ─────────────────────────────────────────

interface ResourcePickerProps {
  resourceType: ResourceType
  value: number | null
  onChange: (resource: Vehicle | Room) => void
}

export const ResourcePicker = ({
  resourceType,
  value,
  onChange,
}: ResourcePickerProps) => {
  const { search, setSearch, page, setPage, params } = useTableFilter({}, 6)

  const isVehicle = resourceType === RESOURCE_TYPE.VEHICLE
  const queryParams = { ...params }

  const vehQ = useVehiclesPaginated(queryParams, { enabled: isVehicle })
  const roomQ = useRoomsPaginated(queryParams, { enabled: !isVehicle })

  const active = isVehicle ? vehQ : roomQ
  const items = (active.data?.data ?? []) as (Vehicle | Room)[]
  const pagination = active.data?.pagination
  const isLoading = active.isLoading

  return (
    <div className="space-y-4">
      {/* Search */}
      <InputText
        placeholder={isVehicle ? 'Cari kendaraan…' : 'Cari ruangan…'}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        leftIcon={<Search className="h-4 w-4" />}
      />

      {/* Grid cards */}
      {isLoading ? (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-40 animate-pulse rounded-xl bg-[var(--bg-subtle)]"
            />
          ))}
        </div>
      ) : items.length === 0 ? (
        <p className="py-8 text-center text-sm text-[var(--text-disabled)]">
          Tidak ada {isVehicle ? 'kendaraan' : 'ruangan'} tersedia.
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
          {items.map((resource) => (
            <ResourcePickerCard
              key={resource.id}
              resource={resource}
              resourceType={resourceType}
              selected={value === resource.id}
              onClick={() => onChange(resource)}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <IconButton
            variant="ghost"
            size="icon-sm"
            aria-label="Halaman sebelumnya"
            disabled={page <= 1}
            onClick={() => setPage(page - 1)}
            icon={<ChevronLeft className="h-4 w-4" />}
          />
          <span className="text-sm text-[var(--text-secondary)]">
            {page} / {pagination.totalPages}
          </span>
          <IconButton
            variant="ghost"
            size="icon-sm"
            aria-label="Halaman berikutnya"
            disabled={page >= pagination.totalPages}
            onClick={() => setPage(page + 1)}
            icon={<ChevronRight className="h-4 w-4" />}
          />
        </div>
      )}
    </div>
  )
}

// ─────────────────────────────────────────
// CARD
// ─────────────────────────────────────────

const ResourcePickerCard = ({
  resource,
  resourceType,
  selected,
  onClick,
}: {
  resource: Vehicle | Room
  resourceType: ResourceType
  selected: boolean
  onClick: () => void
}) => {
  const isVehicle = resourceType === RESOURCE_TYPE.VEHICLE
  const photoUrl = resource.photoUrl ? resolveFileUrl(resource.photoUrl) : null

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'group overflow-hidden rounded-xl border text-left transition-all',
        selected
          ? 'border-[1.5px] border-[var(--primary)] ring-2 ring-[var(--primary-light)]'
          : 'border-[var(--border-card)] hover:border-[var(--border-input)]',
      )}
    >
      {/* Foto / placeholder */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-[var(--bg-subtle)]">
        {photoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={photoUrl}
            alt={resource.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            {isVehicle ? (
              <Car className="h-10 w-10 text-[var(--text-disabled)]" />
            ) : (
              <Building2 className="h-10 w-10 text-[var(--text-disabled)]" />
            )}
          </div>
        )}
        {selected && (
          <div className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-[var(--primary)] text-white">
            <Check className="h-3.5 w-3.5" />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-3">
        <p className="truncate text-sm font-semibold text-[var(--text-primary)]">
          {resource.name}
        </p>
        {isVehicle ? (
          <p className="truncate text-xs text-[var(--text-secondary)]">
            {(resource as Vehicle).plateNumber} · {(resource as Vehicle).capacity} kursi
          </p>
        ) : (
          <p className="truncate text-xs text-[var(--text-secondary)]">
            {(resource as Room).location} · {(resource as Room).capacity} orang
          </p>
        )}
        <div className="mt-2">
          <ResourceStatusBadge status={resource.status} className="px-2 py-0.5 text-[10px]" />
        </div>
      </div>
    </button>
  )
}

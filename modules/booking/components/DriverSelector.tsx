'use client'

import { useEffect, useMemo, useState } from 'react'
import { Car, Info, MapPin, Search, Zap } from 'lucide-react'
import { cn } from '@/lib'
import { Pagination, UserAvatar, SpdActiveBadge } from '@/components/shared'
import { InputText } from '@/components/ui-custom'
import { useAvailableDrivers } from '@/modules/drivers'
import type { AvailableDriver, PaginationMeta } from '@/types'

const PAGE_SIZE = 5

// ─────────────────────────────────────────
// DRIVER SELECTOR
// - Supir "kosong" (belum pegang kendaraan) → akan memakai kendaraan yang
//   kamu booking (kapasitas mengikuti kendaraan itu).
// - Supir "sibuk" (sudah pegang kendaraan dari booking aktif) → memilihnya =
//   digabung ke tripnya & pakai kendaraannya (cek sisa kursi).
// ─────────────────────────────────────────

interface DriverSelectorProps {
  startDate: string
  endDate: string
  passengerCount: number
  /** Kapasitas kendaraan yang sedang dibooking (untuk supir kosong). */
  bookedVehicleCapacity: number | null
  /** Plat kendaraan yang sedang dibooking (untuk info supir kosong). */
  bookedVehiclePlate: string | null
  value: number | null
  onChange: (driverId: number | null) => void
  /** Driver yang dipakai jika user tidak memilih (auto-assign). */
  onSuggestedChange?: (driverId: number | null) => void
}

// Kapasitas & sisa kursi efektif untuk booking ini.
const effectiveSeats = (
  d: AvailableDriver,
  bookedCapacity: number | null,
): { capacity: number | null; remaining: number | null; isFree: boolean } => {
  const isFree = d.vehicleId == null
  if (isFree) {
    // Supir kosong: pakai kendaraan yang dibooking, belum punya trip.
    return { capacity: bookedCapacity, remaining: bookedCapacity, isFree }
  }
  return { capacity: d.vehicleCapacity, remaining: d.remainingSeats, isFree }
}

export const DriverSelector = ({
  startDate,
  endDate,
  passengerCount,
  bookedVehicleCapacity,
  bookedVehiclePlate,
  value,
  onChange,
  onSuggestedChange,
}: DriverSelectorProps) => {
  const { data: drivers, isLoading } = useAvailableDrivers({ startDate, endDate })
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)

  // Supir dengan sisa kursi cukup untuk jumlah penumpang.
  const eligibleDrivers = useMemo(
    () =>
      (drivers ?? []).filter((d) => {
        const { remaining } = effectiveSeats(d, bookedVehicleCapacity)
        return remaining != null && remaining >= passengerCount
      }),
    [drivers, passengerCount, bookedVehicleCapacity],
  )

  // Cari berdasarkan nama supir - dipaginasi, 5 per halaman secara default.
  const filteredDrivers = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return eligibleDrivers
    return eligibleDrivers.filter((d) => d.driverName.toLowerCase().includes(q))
  }, [eligibleDrivers, search])

  // Balik ke halaman 1 kalau pencarian/daftar berubah, biar tidak nyangkut
  // di halaman kosong.
  useEffect(() => {
    setPage(1)
  }, [search, eligibleDrivers.length])

  const totalPages = Math.max(1, Math.ceil(filteredDrivers.length / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)
  const pagedDrivers = filteredDrivers.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  )
  const paginationMeta: PaginationMeta = {
    total: filteredDrivers.length,
    page: currentPage,
    limit: PAGE_SIZE,
    totalPages,
  }

  // Auto-pick: prioritaskan supir KOSONG (senggang, belum pegang kendaraan).
  const suggestedDriverId = useMemo(() => {
    if (eligibleDrivers.length === 0) return null
    const free = eligibleDrivers.find((d) => d.vehicleId == null)
    return (free ?? eligibleDrivers[0]).driverId
  }, [eligibleDrivers])

  useEffect(() => {
    onSuggestedChange?.(suggestedDriverId)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [suggestedDriverId])

  const suggestedDriver = eligibleDrivers.find(
    (d) => d.driverId === suggestedDriverId,
  )

  return (
    <div className="space-y-2">
      {/* Info auto-assign */}
      {value === null && suggestedDriver && (
        <div className="flex items-start gap-2 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2">
          <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-blue-600" />
          <p className="text-xs text-blue-700">
            Jika tidak memilih, driver{' '}
            <span className="font-medium">{suggestedDriver.driverName}</span> akan
            ditugaskan otomatis.
          </p>
        </div>
      )}

      {/* Opsi: otomatis / admin yang menugaskan */}
      <button
        type="button"
        onClick={() => onChange(null)}
        className={cn(
          'w-full rounded-xl border p-3 text-left transition-all',
          value === null
            ? 'border-[1.5px] border-[var(--primary)] bg-[var(--primary-light)]'
            : 'border-[var(--border-card)] hover:bg-[var(--bg-subtle)]',
        )}
      >
        <p className="text-sm font-medium text-[var(--text-primary)]">
          Otomatis / Admin yang Menugaskan
        </p>
        <p className="text-xs text-[var(--text-secondary)]">
          Sistem memilih supir senggang, atau admin menugaskan manual
        </p>
      </button>

      {/* Loading */}
      {isLoading && (
        <p className="py-3 text-center text-sm text-[var(--text-disabled)]">
          Memuat driver…
        </p>
      )}

      {/* Pencarian - hanya kalau ada lebih dari satu supir eligible */}
      {!isLoading && eligibleDrivers.length > 0 && (
        <InputText
          placeholder="Cari nama supir…"
          leftIcon={<Search className="h-4 w-4" />}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      )}

      {/* Empty - belum ada supir yang eligible sama sekali */}
      {!isLoading && eligibleDrivers.length === 0 && (
        <p className="py-3 text-center text-sm text-[var(--text-disabled)]">
          Tidak ada supir dengan kursi cukup untuk {passengerCount} penumpang. Admin
          akan menugaskan.
        </p>
      )}

      {/* Empty - pencarian tidak cocok */}
      {!isLoading && eligibleDrivers.length > 0 && filteredDrivers.length === 0 && (
        <p className="py-3 text-center text-sm text-[var(--text-disabled)]">
          Tidak ada supir dengan nama "{search}".
        </p>
      )}

      {/* List driver eligible (dipaginasi) */}
      {pagedDrivers.map((driver) => {
        const { capacity, remaining, isFree } = effectiveSeats(
          driver,
          bookedVehicleCapacity,
        )
        const isSelected = value === driver.driverId
        const hasOverlap = driver.overlappingPassengers > 0

        return (
          <button
            key={driver.driverId}
            type="button"
            onClick={() => onChange(driver.driverId)}
            className={cn(
              'w-full rounded-xl border p-3 text-left transition-all',
              isSelected
                ? 'border-[1.5px] border-[var(--primary)] bg-[var(--primary-light)]'
                : 'border-[var(--border-card)] hover:bg-[var(--bg-subtle)]',
            )}
          >
            <div className="flex items-center gap-2.5">
              <UserAvatar name={driver.driverName} size="sm" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-[var(--text-primary)]">
                  {driver.driverName}
                </p>
                <p className="text-xs text-[var(--text-secondary)]">
                  {isFree ? (
                    <span className="inline-flex items-center gap-1">
                      <Car className="h-3 w-3" /> Belum punya kendaraan
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1">
                      <Car className="h-3 w-3" /> {driver.plateNumber} · Kapasitas{' '}
                      {capacity}
                    </span>
                  )}
                </p>
              </div>

              {/* Badge sisa kursi / status */}
              <div className="flex shrink-0 flex-col items-end gap-1 text-right">
                {isFree ? (
                  <span className="inline-flex items-center rounded-full bg-[var(--bg-subtle)] px-2 py-0.5 text-[10px] font-semibold text-[var(--text-secondary)]">
                    Kosong
                  </span>
                ) : (
                  <span
                    className={cn(
                      'inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold',
                      (remaining ?? 0) >= passengerCount
                        ? 'bg-green-50 text-green-700'
                        : 'bg-red-50 text-red-600',
                    )}
                  >
                    Sisa {remaining} kursi
                  </span>
                )}
                {driver.isSpdActive && (
                  <SpdActiveBadge title="Supir sedang bertugas SPD hari ini" />
                )}
              </div>
            </div>

            {/* Supir kosong → akan pakai kendaraan yang dibooking */}
            {isFree && (
              <div className="mt-2 flex items-center gap-1.5 rounded-lg bg-[var(--bg-subtle)] px-2.5 py-1.5 text-[10px] text-[var(--text-secondary)]">
                <Info className="h-3 w-3 shrink-0 text-blue-600" />
                <span className="truncate">
                  Akan memakai kendaraan yang kamu booking
                  {bookedVehiclePlate ? (
                    <>
                      {' '}
                      <span className="font-medium text-[var(--text-primary)]">
                        {bookedVehiclePlate}
                      </span>
                    </>
                  ) : null}
                  {bookedVehicleCapacity != null
                    ? ` · kapasitas ${bookedVehicleCapacity}`
                    : ''}
                </span>
              </div>
            )}

            {/* Supir sibuk → info trip yang sudah ada */}
            {!isFree && hasOverlap && (
              <div className="mt-2 flex items-center gap-1.5 rounded-lg bg-[var(--bg-subtle)] px-2.5 py-1.5 text-[10px] text-[var(--text-secondary)]">
                <MapPin className="h-3 w-3 shrink-0 text-amber-600" />
                <span className="truncate">
                  Sudah ada trip:{' '}
                  <span className="font-medium text-[var(--text-primary)]">
                    {driver.overlappingPurpose || 'Tujuan lain'}
                  </span>{' '}
                  · {driver.overlappingPassengers} penumpang
                </span>
              </div>
            )}

            {/* Supir sibuk + terpilih → pemberitahuan merge */}
            {!isFree && hasOverlap && isSelected && (
              <div className="mt-2 flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-2.5 py-2">
                <Zap className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-600" />
                <p className="text-[10px] text-amber-700">
                  Supir ini sedang membawa trip lain. Booking-mu akan{' '}
                  <span className="font-semibold">digabung</span> ke trip itu dan
                  memakai kendaraan{' '}
                  <span className="font-semibold">{driver.plateNumber}</span> (sisa{' '}
                  {remaining} kursi). Admin meninjau saat persetujuan.
                </p>
              </div>
            )}
          </button>
        )
      })}

      {/* Pager - cuma tampil kalau lebih dari satu halaman */}
      {totalPages > 1 && (
        <Pagination pagination={paginationMeta} onPageChange={setPage} />
      )}
    </div>
  )
}

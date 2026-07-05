'use client'

import { useEffect, useMemo } from 'react'
import { Info, Zap } from 'lucide-react'
import { cn } from '@/lib'
import { UserAvatar } from '@/components/shared'
import { useAvailableDrivers } from '@/modules/drivers'

// ─────────────────────────────────────────
// DRIVER SELECTOR
// Driver tersedia + filter kapasitas + auto-assign
// ─────────────────────────────────────────

interface DriverSelectorProps {
  startDate: string
  endDate: string
  passengerCount: number
  value: number | null
  onChange: (driverId: number | null) => void
  /** Driver yang akan dipakai jika user tidak memilih (auto-assign). */
  onSuggestedChange?: (driverId: number | null) => void
}

export const DriverSelector = ({
  startDate,
  endDate,
  passengerCount,
  value,
  onChange,
  onSuggestedChange,
}: DriverSelectorProps) => {
  const { data: drivers, isLoading } = useAvailableDrivers({ startDate, endDate })

  // Hanya driver dengan sisa kursi cukup untuk jumlah penumpang
  const eligibleDrivers = useMemo(
    () => (drivers ?? []).filter((d) => d.remainingSeats >= passengerCount),
    [drivers, passengerCount],
  )

  // Auto-pick: prioritas driver benar-benar kosong (overlappingPassengers === 0)
  const suggestedDriverId = useMemo(() => {
    if (eligibleDrivers.length === 0) return null
    const free = eligibleDrivers.find((d) => d.overlappingPassengers === 0)
    return (free ?? eligibleDrivers[0]).driverId
  }, [eligibleDrivers])

  // Beritahu parent driver yang disarankan (untuk dikirim saat submit jika value === null)
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
          Sistem memilih driver tersedia, atau admin menugaskan manual
        </p>
      </button>

      {/* Loading */}
      {isLoading && (
        <p className="py-3 text-center text-sm text-[var(--text-disabled)]">
          Memuat driver…
        </p>
      )}

      {/* Empty */}
      {!isLoading && eligibleDrivers.length === 0 && (
        <p className="py-3 text-center text-sm text-[var(--text-disabled)]">
          Tidak ada driver dengan kursi cukup untuk {passengerCount} penumpang. Admin
          akan menugaskan.
        </p>
      )}

      {/* List driver eligible */}
      {eligibleDrivers.map((driver) => {
        const isFull = driver.remainingSeats < passengerCount
        const hasOverlap = driver.overlappingPassengers > 0
        const isSelected = value === driver.driverId

        return (
          <button
            key={driver.driverId}
            type="button"
            onClick={() => onChange(driver.driverId)}
            disabled={isFull}
            className={cn(
              'w-full rounded-xl border p-3 text-left transition-all',
              isSelected
                ? 'border-[1.5px] border-[var(--primary)] bg-[var(--primary-light)]'
                : 'border-[var(--border-card)] hover:bg-[var(--bg-subtle)]',
              isFull && 'cursor-not-allowed opacity-50',
            )}
          >
            <div className="flex items-center gap-2.5">
              <UserAvatar name={driver.driverName} size="sm" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-[var(--text-primary)]">
                  {driver.driverName}
                </p>
                <p className="text-xs text-[var(--text-secondary)]">
                  {driver.plateNumber} · Kapasitas {driver.vehicleCapacity}
                </p>
              </div>

              {/* Badge sisa kursi */}
              <div className="shrink-0 text-right">
                <span
                  className={cn(
                    'inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold',
                    driver.remainingSeats >= passengerCount
                      ? 'bg-green-50 text-green-700'
                      : 'bg-red-50 text-red-600',
                  )}
                >
                  Sisa {driver.remainingSeats} kursi
                </span>
                {hasOverlap && (
                  <p className="mt-0.5 text-[10px] text-amber-600">
                    {driver.overlappingPassengers} penumpang lain
                  </p>
                )}
              </div>
            </div>

            {/* Kandidat merge — driver sudah punya booking overlap */}
            {hasOverlap && isSelected && (
              <div className="mt-2 flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-2.5 py-2">
                <Zap className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-600" />
                <p className="text-[10px] text-amber-700">
                  Driver ini sudah punya booking lain di waktu yang sama. Admin akan
                  meninjau apakah booking bisa digabung (merge) atau ditugaskan terpisah.
                </p>
              </div>
            )}
          </button>
        )
      })}
    </div>
  )
}

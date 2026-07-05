'use client'

import { AlertTriangle } from 'lucide-react'
import { cn } from '@/lib'
import { UserAvatar } from '@/components/shared'
import { useDriverAvailability } from '@/modules/drivers'

// ─────────────────────────────────────────
// DRIVER SELECTOR
// List driver + info sisa kursi + warning kandidat merge
// ─────────────────────────────────────────

interface DriverSelectorProps {
  startDate: string
  endDate: string
  value: number | null
  onChange: (driverId: number | null) => void
}

export const DriverSelector = ({
  startDate,
  endDate,
  value,
  onChange,
}: DriverSelectorProps) => {
  const { data: drivers, isLoading } = useDriverAvailability({ startDate, endDate })

  if (isLoading) {
    return (
      <p className="py-6 text-center text-sm text-[var(--text-secondary)]">
        Memuat ketersediaan driver…
      </p>
    )
  }

  return (
    <div className="space-y-2">
      {/* Opsi: tidak pilih driver */}
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
        <p className="text-sm font-medium text-[var(--text-primary)]">Tanpa Driver</p>
        <p className="text-xs text-[var(--text-secondary)]">
          Admin akan menugaskan driver saat approval
        </p>
      </button>

      {/* List driver */}
      {drivers?.map((driver) => {
        const isFull =
          driver.hasExistingBooking && driver.existingBooking?.remainingSeats === 0
        const isSelected = value === driver.id

        return (
          <button
            key={driver.id}
            type="button"
            onClick={() => onChange(driver.id)}
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
              <UserAvatar name={driver.name} size="sm" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-[var(--text-primary)]">
                  {driver.name}
                </p>
                <p className="text-xs text-[var(--text-secondary)]">
                  {driver.phoneNumber}
                </p>
              </div>

              {/* Badge ketersediaan */}
              {driver.hasExistingBooking && driver.existingBooking ? (
                <div className="text-right">
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-700">
                    Sisa {driver.existingBooking.remainingSeats} kursi
                  </span>
                  <p className="mt-0.5 text-[10px] text-[var(--text-disabled)]">
                    Sudah ada: {driver.existingBooking.destination}
                  </p>
                </div>
              ) : (
                <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-0.5 text-[10px] font-semibold text-green-700">
                  Tersedia
                </span>
              )}
            </div>

            {/* Warning kandidat merge — saat driver terpilih & sudah punya booking */}
            {driver.hasExistingBooking && driver.existingBooking && isSelected && (
              <div className="mt-2 flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-2.5 py-2">
                <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-600" />
                <p className="text-[10px] text-amber-700">
                  Driver ini sudah memiliki booking lain. Admin akan meninjau apakah
                  booking bisa digabung (merge).
                </p>
              </div>
            )}
          </button>
        )
      })}

      {drivers?.length === 0 && (
        <p className="py-4 text-center text-sm text-[var(--text-secondary)]">
          Tidak ada driver aktif.
        </p>
      )}
    </div>
  )
}

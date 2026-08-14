'use client'

import { useState } from 'react'
import { Fuel, Zap } from 'lucide-react'
import { Card, CardHeader } from '@/components/common'
import { cn, formatCurrency, formatNumber, formatDate } from '@/lib'
import { ENERGY_TYPE } from '@/constants'
import type { FuelExpense } from '@/types'
import { useFuelExpenses, FuelDetailModal } from '@/modules/fuel'

// ─────────────────────────────────────────
// BOOKING FUEL HISTORY
// Riwayat pengisian BBM/listrik untuk satu booking.
// Menyembunyikan diri jika belum ada pengisian.
// ─────────────────────────────────────────

export const BookingFuelHistory = ({ bookingId }: { bookingId: number }) => {
  const { data, isLoading } = useFuelExpenses({ bookingId, limit: 50 })
  const items = data?.data ?? []
  const [selected, setSelected] = useState<FuelExpense | null>(null)

  if (isLoading || items.length === 0) return null

  const total = items.reduce((s, f) => s + f.totalCost, 0)

  return (
    <Card>
      <CardHeader
        title="Riwayat Pengisian BBM"
        description={`${items.length} pengisian · ${formatCurrency(total)}`}
      />

      <ul className="divide-y divide-[var(--border-divider)]">
        {items.map((f) => {
          const isBbm = f.fuelType === ENERGY_TYPE.BBM
          return (
            <li key={f.id}>
              <button
                type="button"
                onClick={() => setSelected(f)}
                className="flex w-full items-center gap-3 rounded-lg px-1 py-3 text-left transition-colors first:pt-0 hover:bg-[var(--bg-subtle)]"
              >
                <span
                  className={cn(
                    'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg',
                    isBbm
                      ? 'bg-amber-50 text-amber-600'
                      : 'bg-blue-50 text-blue-600',
                  )}
                >
                  {isBbm ? <Fuel className="h-4 w-4" /> : <Zap className="h-4 w-4" />}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-[var(--text-primary)]">
                    {isBbm
                      ? `${formatNumber(f.liter ?? 0)} L`
                      : `${formatNumber(f.kwh ?? 0)} kWh`}{' '}
                    · {formatCurrency(f.totalCost)}
                  </p>
                  <p className="truncate text-xs text-[var(--text-secondary)]">
                    {f.driverName || '-'} · {formatDate(f.createdAt)}
                  </p>
                </div>
              </button>
            </li>
          )
        })}
      </ul>

      {selected && (
        <FuelDetailModal
          fuel={selected}
          open={!!selected}
          onOpenChange={(o) => !o && setSelected(null)}
        />
      )}
    </Card>
  )
}

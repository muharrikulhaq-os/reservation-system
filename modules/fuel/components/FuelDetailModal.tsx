'use client'

import { Fuel as FuelIcon, ImageOff, Zap } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { formatDate, formatCurrency, formatNumber, resolveFileUrl } from '@/lib'
import { ENERGY_TYPE, ENERGY_TYPE_CONFIG } from '@/constants'
import type { FuelExpense } from '@/types'
import { useVehicles } from '@/modules/vehicles/hooks/useVehicles'

// ─────────────────────────────────────────
// FUEL DETAIL MODAL
// Menampilkan rincian pengisian + foto bukti transaksi.
// Data lengkap sudah ada di row list → tidak perlu fetch ulang.
// ─────────────────────────────────────────

const Row = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <div className="flex items-start justify-between gap-4 py-2.5">
    <span className="text-xs font-semibold uppercase tracking-[0.06em] text-[var(--text-secondary)]">
      {label}
    </span>
    <span className="text-right text-sm text-[var(--text-primary)]">{value}</span>
  </div>
)

interface Props {
  fuel: FuelExpense
  open: boolean
  onOpenChange: (open: boolean) => void
}

export const FuelDetailModal = ({ fuel, open, onOpenChange }: Props) => {
  const { data: vehicles } = useVehicles({ limit: 100 })
  const vehicle = (vehicles ?? []).find((v) => v.id === fuel.vehicleId)

  const isBbm = fuel.fuelType === ENERGY_TYPE.BBM
  const cfg = ENERGY_TYPE_CONFIG[fuel.fuelType]
  const proofUrl = resolveFileUrl(fuel.proofPhotoUrl)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto rounded-2xl p-6 shadow-[var(--shadow-modal)] sm:max-w-lg">
        <DialogHeader>
          <DialogTitle
            className="flex items-center gap-2 text-lg font-bold text-[var(--text-primary)]"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            {isBbm ? (
              <FuelIcon className="h-5 w-5 text-[var(--primary)]" />
            ) : (
              <Zap className="h-5 w-5 text-[#0284C7]" />
            )}
            Detail Pengisian
          </DialogTitle>
        </DialogHeader>

        <div className="mt-2">
          {/* Jenis energi */}
          {cfg && (
            <span
              className="mb-3 inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-semibold"
              style={{ backgroundColor: `${cfg.color}1A`, color: cfg.color }}
            >
              {isBbm ? <FuelIcon className="h-2.5 w-2.5" /> : <Zap className="h-2.5 w-2.5" />}
              {cfg.label}
            </span>
          )}

          <div className="divide-y divide-[var(--border-divider)]">
            <Row
              label="Kendaraan"
              value={
                vehicle
                  ? `${vehicle.name} · ${vehicle.plateNumber}`
                  : `#${fuel.vehicleId}`
              }
            />
            <Row label="Driver" value={fuel.driverName || '—'} />
            {isBbm ? (
              <>
                <Row
                  label="Liter"
                  value={fuel.liter != null ? `${formatNumber(fuel.liter)} L` : '—'}
                />
                <Row
                  label="Harga / Liter"
                  value={
                    fuel.pricePerLiter != null ? formatCurrency(fuel.pricePerLiter) : '—'
                  }
                />
              </>
            ) : (
              <>
                <Row
                  label="kWh"
                  value={fuel.kwh != null ? `${formatNumber(fuel.kwh)} kWh` : '—'}
                />
                <Row
                  label="Harga / kWh"
                  value={fuel.pricePerKwh != null ? formatCurrency(fuel.pricePerKwh) : '—'}
                />
              </>
            )}
            <Row label="Total" value={formatCurrency(fuel.totalCost)} />
            <Row
              label="Odometer"
              value={
                fuel.odometerBefore == null && fuel.odometerAfter == null
                  ? '—'
                  : `${formatNumber(fuel.odometerBefore ?? 0)} → ${formatNumber(
                      fuel.odometerAfter ?? 0,
                    )} km`
              }
            />
            <Row label="Catatan" value={fuel.note || '—'} />
            <Row label="Tanggal" value={formatDate(fuel.createdAt)} />
          </div>

          {/* Bukti transaksi */}
          <div className="mt-5">
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.06em] text-[var(--text-secondary)]">
              Bukti Transaksi
            </p>
            {proofUrl ? (
              <a
                href={proofUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block overflow-hidden rounded-xl border border-[var(--border-card)]"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={proofUrl}
                  alt="Bukti pengisian"
                  className="max-h-72 w-full object-contain bg-[var(--bg-subtle)]"
                />
              </a>
            ) : (
              <div className="flex items-center gap-2 rounded-xl border border-dashed border-[var(--border-card)] bg-[var(--bg-subtle)] px-4 py-6 text-sm text-[var(--text-disabled)]">
                <ImageOff className="h-4 w-4" />
                Tidak ada foto bukti.
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

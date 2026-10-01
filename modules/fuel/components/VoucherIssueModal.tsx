'use client'

import { useEffect, useMemo, useState } from 'react'
import { AlertCircle, AlertTriangle, Ticket } from 'lucide-react'
import { toast } from 'sonner'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { AppButton, InputNumber, InputSelect, InputTextArea } from '@/components/ui-custom'
import { formatDateTime, formatNumber, getErrorMessage } from '@/lib'
import { useDebounce } from '@/hooks'
import type { FuelVoucher, FuelVoucherPreview, SelectOption, VehicleFuelBalance } from '@/types'
import { useDrivers } from '@/modules/drivers'
import { useFuelTypes } from '../hooks/useFuelTypes'
import { useFuelStations, useIssueFuelVoucher, usePreviewFuelVoucher } from '../hooks/useFuelVoucher'
import { formatQty, formatRupiahExact } from '../utils/format'

// ─────────────────────────────────────────
// TERBITKAN VOUCHER BBM (admin)
// Liter = min(saldo + hak dari jarak sejak isi terakhir, kapasitas tangki);
// nominal = liter × harga master (tanpa pembulatan). Pratinjau dihitung
// server (sumber kebenaran yang sama dengan saat terbit).
// ─────────────────────────────────────────

interface Props {
  vehicle: VehicleFuelBalance
  open: boolean
  onOpenChange: (open: boolean) => void
  onIssued?: (voucher: FuelVoucher) => void
}

const Line = ({ label, value, strong }: { label: string; value: React.ReactNode; strong?: boolean }) => (
  <div className="flex items-center justify-between gap-3 py-1.5 text-sm">
    <span className="text-[var(--text-secondary)]">{label}</span>
    <span className={strong ? 'font-bold text-[var(--text-primary)]' : 'text-[var(--text-primary)]'}>{value}</span>
  </div>
)

export const VoucherIssueModal = ({ vehicle, open, onOpenChange, onIssued }: Props) => {
  const { data: fuelTypes } = useFuelTypes()
  const { data: stations } = useFuelStations(true)
  const { data: drivers } = useDrivers({ limit: 100 })
  const preview = usePreviewFuelVoucher()
  const issue = useIssueFuelVoucher()

  const bbmTypes = useMemo(() => (fuelTypes ?? []).filter((t) => t.isActive && t.type === 'BBM'), [fuelTypes])
  const [fuelTypeId, setFuelTypeId] = useState<number | undefined>()
  const [stationId, setStationId] = useState<number | undefined>()
  const [driverId, setDriverId] = useState<number | ''>('')
  const [odometer, setOdometer] = useState<number | undefined>()
  const [note, setNote] = useState('')
  const [calc, setCalc] = useState<FuelVoucherPreview | null>(null)

  useEffect(() => {
    if (!open) return
    setFuelTypeId(bbmTypes[0]?.id)
    setStationId(stations?.[0]?.id)
    setDriverId(vehicle.fixedDriverId ?? '')
    setOdometer(vehicle.currentOdometer)
    setNote('')
    setCalc(null)
    issue.reset()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, vehicle.vehicleId])

  useEffect(() => {
    if (open && !fuelTypeId && bbmTypes[0]) setFuelTypeId(bbmTypes[0].id)
  }, [open, fuelTypeId, bbmTypes])
  useEffect(() => {
    if (open && !stationId && stations?.[0]) setStationId(stations[0].id)
  }, [open, stationId, stations])

  const debouncedOdo = useDebounce(odometer, 400)
  const odoInvalid = odometer != null && odometer < vehicle.currentOdometer

  // Pratinjau ulang setiap input berubah.
  useEffect(() => {
    if (!open || !fuelTypeId || !stationId || debouncedOdo == null || debouncedOdo < vehicle.currentOdometer) {
      setCalc(null)
      return
    }
    let cancelled = false
    preview
      .mutateAsync({ vehicleId: vehicle.vehicleId, fuelTypeId, stationId, odometer: debouncedOdo })
      .then((d) => !cancelled && setCalc(d))
      .catch(() => !cancelled && setCalc(null))
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, vehicle.vehicleId, fuelTypeId, stationId, debouncedOdo])

  const submit = async () => {
    if (!fuelTypeId || !stationId || odometer == null) return
    try {
      const v = await issue.mutateAsync({
        vehicleId: vehicle.vehicleId,
        fuelTypeId,
        stationId,
        odometer,
        driverId: driverId === '' ? 0 : driverId,
        note: note.trim() || undefined,
      })
      toast.success(`Voucher ${v.code} diterbitkan`)
      onOpenChange(false)
      onIssued?.(v)
    } catch {
      // ditampilkan via issue.error
    }
  }

  const driverOptions: SelectOption[] = [
    { value: '', label: 'Tanpa driver (admin menandai terpakai)' },
    ...(drivers ?? []).filter((d) => d.isActive).map((d) => ({ value: d.id, label: d.name })),
  ]
  const previewError = preview.error && !calc ? getErrorMessage(preview.error) : null
  const noStation = (stations ?? []).length === 0

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto rounded-2xl p-6 shadow-[var(--shadow-modal)] sm:max-w-lg">
        <DialogHeader>
          <DialogTitle
            className="flex items-center gap-2 text-lg font-bold text-[var(--text-primary)]"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            <Ticket className="h-5 w-5 text-[var(--primary)]" /> Terbitkan Voucher BBM
          </DialogTitle>
        </DialogHeader>
        <div className="mt-2 space-y-4">
          <p className="text-sm font-medium text-[var(--text-primary)]">
            {vehicle.vehicleName} · {vehicle.plateNumber}
          </p>
          {issue.error && (
            <div className="flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{getErrorMessage(issue.error)}</span>
            </div>
          )}
          {noStation && (
            <div className="flex items-start gap-2.5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>Belum ada SPBU mitra aktif. Tambahkan di Pengaturan → SPBU Mitra.</span>
            </div>
          )}
          <InputNumber
            label="Odometer Sekarang (km)"
            required
            min={vehicle.currentOdometer}
            value={odometer ?? ''}
            onChange={setOdometer}
            error={odoInvalid ? `Tidak boleh kurang dari ${formatNumber(vehicle.currentOdometer)} km` : undefined}
            hint={`Tercatat: ${formatNumber(vehicle.currentOdometer)} km`}
          />
          <div className="grid grid-cols-2 gap-3">
            <InputSelect
              label="Jenis BBM"
              required
              options={bbmTypes.map((t) => ({ value: t.id, label: `${t.name} · ${formatRupiahExact(t.defaultPrice)}/L` }))}
              value={fuelTypeId ?? ''}
              onChange={(e) => setFuelTypeId(e.target.value ? Number(e.target.value) : undefined)}
            />
            <InputSelect
              label="SPBU Mitra"
              required
              placeholder="Pilih SPBU"
              options={(stations ?? []).map((s) => ({ value: s.id, label: s.name }))}
              value={stationId ?? ''}
              onChange={(e) => setStationId(e.target.value ? Number(e.target.value) : undefined)}
            />
          </div>
          <InputSelect
            label="Driver Penerima"
            options={driverOptions}
            value={driverId}
            onChange={(e) => setDriverId(e.target.value ? Number(e.target.value) : '')}
          />

          {/* Pratinjau hitungan */}
          <div className="rounded-xl border border-[var(--border-divider)] bg-[var(--bg-subtle)] px-4 py-3">
            <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.07em] text-[var(--text-secondary)]">
              Perhitungan
            </p>
            {calc ? (
              <div className="divide-y divide-[var(--border-divider)]">
                <Line
                  label="Jarak sejak isi terakhir"
                  value={`${formatNumber(calc.checkpointOdometer)} → ${formatNumber(calc.odometer)} km (${formatNumber(calc.distanceKm)} km)`}
                />
                <Line label={`Hak (÷ ${formatQty(calc.kmPerLiter)} km/L)`} value={`${formatQty(calc.accruedLiter)} L`} />
                <Line label="Saldo terbawa" value={`${formatQty(calc.carriedLiter)} L`} />
                <Line label="Tersedia" value={`${formatQty(calc.availableLiter)} L`} />
                {calc.cappedByTank && (
                  <Line label="Dibatasi tangki" value={`${formatQty(calc.tankCapacityLiter)} L (sisa ${formatQty(calc.remainingLiter)} L tetap di saldo)`} />
                )}
                <Line label="Liter voucher" value={`${formatQty(calc.liter)} L`} strong />
                <Line label="Harga / liter" value={formatRupiahExact(calc.pricePerLiter)} />
                <Line label="Nominal voucher" value={formatRupiahExact(calc.amount)} strong />
                <Line label="Berlaku sampai" value={`${formatDateTime(calc.validUntil)} WIB`} />
              </div>
            ) : previewError ? (
              <p className="text-sm text-red-600">{previewError}</p>
            ) : (
              <p className="text-sm text-[var(--text-secondary)]">{preview.isPending ? 'Menghitung…' : 'Lengkapi isian untuk melihat perhitungan.'}</p>
            )}
            {calc && calc.liter <= 0 && (
              <p className="mt-2 text-xs text-amber-700">Saldo belum cukup - voucher tidak bisa diterbitkan.</p>
            )}
            {calc?.activeVoucherId && (
              <p className="mt-2 text-xs text-amber-700">Kendaraan ini masih punya voucher aktif - batalkan dulu bila ingin menerbitkan ulang.</p>
            )}
          </div>

          <InputTextArea label="Catatan" rows={2} placeholder="Opsional…" value={note} onChange={(e) => setNote(e.target.value)} />

          <div className="flex gap-3 pt-1">
            <AppButton variant="secondary" fullWidth onClick={() => onOpenChange(false)}>
              Batal
            </AppButton>
            <AppButton
              fullWidth
              loading={issue.isPending}
              disabled={!calc || calc.liter <= 0 || !!calc.activeVoucherId || odoInvalid || issue.isPending}
              onClick={submit}
            >
              Terbitkan
            </AppButton>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

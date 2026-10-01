'use client'

import { useEffect, useState } from 'react'
import { AlertCircle, Settings2 } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { AppButton, InputNumber } from '@/components/ui-custom'
import { getErrorMessage, formatNumber } from '@/lib'
import type { VehicleFuelBalance } from '@/types'
import { useUpdateFuelProfile } from '../hooks/useFuelVoucher'

// Profil BBM kendaraan: konsumsi km/L, kapasitas tangki (batas voucher),
// efisiensi km/kWh & kapasitas baterai (listrik), odometer awal hitung saldo.

interface Props {
  vehicle: VehicleFuelBalance
  open: boolean
  onOpenChange: (open: boolean) => void
}

export const FuelProfileModal = ({ vehicle, open, onOpenChange }: Props) => {
  const save = useUpdateFuelProfile()
  const [kmPerLiter, setKmPerLiter] = useState<number | undefined>()
  const [tank, setTank] = useState<number | undefined>()
  const [kmPerKwh, setKmPerKwh] = useState<number | undefined>()
  const [battery, setBattery] = useState<number | undefined>()
  const [baseline, setBaseline] = useState<number | undefined>()

  useEffect(() => {
    if (!open) return
    const p = vehicle.profile
    setKmPerLiter(p.kmPerLiter ?? undefined)
    setTank(p.tankCapacityLiter ?? undefined)
    setKmPerKwh(p.kmPerKwh ?? undefined)
    setBattery(p.batteryCapacityKwh ?? undefined)
    setBaseline(p.fuelBaselineOdometer)
    save.reset()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, vehicle])

  const hasBbm = vehicle.energyType !== 'LISTRIK'
  const hasEv = vehicle.energyType !== 'BBM'
  const baselineLocked = vehicle.baselineLocked ?? Object.values(vehicle.balances).some((b) => b?.hasEntries)

  const submit = async () => {
    try {
      await save.mutateAsync({
        vehicleId: vehicle.vehicleId,
        payload: {
          kmPerLiter: hasBbm ? (kmPerLiter ?? null) : null,
          tankCapacityLiter: hasBbm ? (tank ?? null) : null,
          kmPerKwh: hasEv ? (kmPerKwh ?? null) : null,
          batteryCapacityKwh: hasEv ? (battery ?? null) : null,
          ...(baselineLocked ? {} : { fuelBaselineOdometer: baseline }),
        },
      })
      onOpenChange(false)
    } catch {
      // ditampilkan via save.error
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-2xl p-6 shadow-[var(--shadow-modal)] sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg font-bold text-[var(--text-primary)]">
            <Settings2 className="h-5 w-5 text-[var(--primary)]" /> Profil BBM · {vehicle.plateNumber}
          </DialogTitle>
        </DialogHeader>
        <div className="mt-2 space-y-4">
          {save.error && (
            <div className="flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{getErrorMessage(save.error)}</span>
            </div>
          )}
          {hasBbm && (
            <div className="grid grid-cols-2 gap-3">
              <InputNumber
                label="Konsumsi (km/liter)"
                required
                min={0}
                step={0.1}
                value={kmPerLiter ?? ''}
                onChange={setKmPerLiter}
                hint="Hak liter = jarak ÷ nilai ini"
              />
              <InputNumber
                label="Kapasitas Tangki (L)"
                required
                min={0}
                step={0.5}
                value={tank ?? ''}
                onChange={setTank}
                hint="Batas maksimal voucher"
              />
            </div>
          )}
          {hasEv && (
            <div className="grid grid-cols-2 gap-3">
              <InputNumber
                label="Efisiensi (km/kWh)"
                min={0}
                step={0.1}
                value={kmPerKwh ?? ''}
                onChange={setKmPerKwh}
              />
              <InputNumber
                label="Kapasitas Baterai (kWh)"
                min={0}
                step={0.5}
                value={battery ?? ''}
                onChange={setBattery}
                hint="Untuk estimasi dari % baterai"
              />
            </div>
          )}
          <InputNumber
            label="Odometer Awal Hitung Saldo (km)"
            min={0}
            max={vehicle.currentOdometer}
            value={baseline ?? ''}
            onChange={setBaseline}
            disabled={baselineLocked}
            hint={
              baselineLocked
                ? 'Terkunci karena sudah ada catatan saldo - gunakan Penyesuaian Saldo.'
                : `Odometer saat pengisian terakhir sebelum sistem dipakai (maks. ${formatNumber(vehicle.currentOdometer)} km).`
            }
          />
          <div className="flex gap-3 pt-1">
            <AppButton variant="secondary" fullWidth onClick={() => onOpenChange(false)}>
              Batal
            </AppButton>
            <AppButton fullWidth loading={save.isPending} disabled={save.isPending} onClick={submit}>
              Simpan
            </AppButton>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

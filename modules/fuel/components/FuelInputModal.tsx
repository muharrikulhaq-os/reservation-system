'use client'

import { useEffect, useMemo, useState } from 'react'
import { AlertCircle, AlertTriangle, Fuel } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  AppButton,
  InputNumber,
  InputRupiah,
  InputSelect,
  InputFile,
  InputTextArea,
} from '@/components/ui-custom'
import { cn, getErrorMessage, formatCurrency, formatNumber } from '@/lib'
import { FUEL_TYPE, FUEL_GRADE_CONFIG, BBM_GRADES } from '@/constants'
import type { FuelGrade, FuelType, SelectOption } from '@/types'
import { useVehicles } from '@/modules/vehicles/hooks/useVehicles'
import { useFuelPrices } from '@/hooks'
import { useCreateFuel } from '../hooks/useFuel'

interface FuelInputModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  presetVehicleId?: number // prefill jika dari booking
  presetBookingId?: number
  onSuccess?: () => void
}

export const FuelInputModal = ({
  open,
  onOpenChange,
  presetVehicleId,
  presetBookingId,
  onSuccess,
}: FuelInputModalProps) => {
  const { data: vehicles } = useVehicles({ limit: 100 })
  const { data: fuelPrices } = useFuelPrices()
  const create = useCreateFuel()

  const [vehicleId, setVehicleId] = useState<number | undefined>(presetVehicleId)
  const [fuelType, setFuelType] = useState<FuelType>(FUEL_TYPE.BBM)
  const [fuelGrade, setFuelGrade] = useState<FuelGrade>('PERTALITE')
  const [liter, setLiter] = useState<number | undefined>()
  const [pricePerLiter, setPricePerLiter] = useState<number | undefined>()
  const [kwh, setKwh] = useState<number | undefined>()
  const [pricePerKwh, setPricePerKwh] = useState<number | undefined>()
  const [odometerBefore, setOdometerBefore] = useState<number | undefined>()
  const [odometerAfter, setOdometerAfter] = useState<number | undefined>()
  const [proofPhoto, setProofPhoto] = useState<File | null>(null)
  const [note, setNote] = useState('')

  const isBbm = fuelType === FUEL_TYPE.BBM
  const isPresetVehicle = !!presetVehicleId

  const selectedVehicle = useMemo(
    () => (vehicles ?? []).find((v) => v.id === vehicleId),
    [vehicles, vehicleId],
  )

  // Prefill odometer awal dari kendaraan terpilih
  useEffect(() => {
    if (selectedVehicle) setOdometerBefore(selectedVehicle.currentOdometer)
  }, [selectedVehicle])

  // Prefill harga dari master setting sesuai grade
  useEffect(() => {
    const price = fuelPrices?.find((p) => p.grade === fuelGrade)?.pricePerUnit
    if (price == null) return
    if (isBbm) setPricePerLiter(price)
    else setPricePerKwh(price)
  }, [fuelGrade, fuelPrices, isBbm])

  // Switch tipe → reset grade & harga
  const handleTypeChange = (type: FuelType) => {
    setFuelType(type)
    setFuelGrade(type === FUEL_TYPE.LISTRIK ? 'LISTRIK' : 'PERTALITE')
  }

  const totalCost = isBbm
    ? (liter ?? 0) * (pricePerLiter ?? 0)
    : (kwh ?? 0) * (pricePerKwh ?? 0)
  const distanceKm = (odometerAfter ?? 0) - (odometerBefore ?? 0)

  const odoAfterInvalid =
    odometerAfter != null &&
    odometerBefore != null &&
    odometerAfter <= odometerBefore
  const odoBeforeWarning =
    selectedVehicle != null &&
    odometerBefore != null &&
    odometerBefore < selectedVehicle.currentOdometer

  const canSubmit =
    !!vehicleId &&
    !!proofPhoto &&
    odometerBefore != null &&
    odometerAfter != null &&
    !odoAfterInvalid &&
    (isBbm ? !!liter && !!pricePerLiter : !!kwh && !!pricePerKwh)

  const resetForm = () => {
    setVehicleId(presetVehicleId)
    setFuelType(FUEL_TYPE.BBM)
    setFuelGrade('PERTALITE')
    setLiter(undefined)
    setPricePerLiter(undefined)
    setKwh(undefined)
    setPricePerKwh(undefined)
    setOdometerBefore(undefined)
    setOdometerAfter(undefined)
    setProofPhoto(null)
    setNote('')
  }

  const handleSubmit = async () => {
    if (!canSubmit || !vehicleId || !proofPhoto) return
    try {
      await create.mutateAsync({
        vehicleId,
        bookingId: presetBookingId,
        fuelType,
        fuelGrade: isBbm ? fuelGrade : 'LISTRIK',
        liter: isBbm ? liter : undefined,
        pricePerLiter: isBbm ? pricePerLiter : undefined,
        kwh: !isBbm ? kwh : undefined,
        pricePerKwh: !isBbm ? pricePerKwh : undefined,
        odometerBefore: odometerBefore!,
        odometerAfter: odometerAfter!,
        proofPhoto,
        note: note.trim() || undefined,
      })
      resetForm()
      onOpenChange(false)
      onSuccess?.()
    } catch {
      // ditampilkan via create.error
    }
  }

  const vehicleOptions: SelectOption[] = (vehicles ?? []).map((v) => ({
    value: v.id,
    label: `${v.name} · ${v.plateNumber}`,
  }))

  const gradeOptions: SelectOption[] = BBM_GRADES.map((g) => ({
    value: g,
    label: FUEL_GRADE_CONFIG[g].label,
  }))

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto rounded-2xl p-6 shadow-[var(--shadow-modal)] sm:max-w-lg">
        <DialogHeader>
          <DialogTitle
            className="flex items-center gap-2 text-lg font-bold text-[var(--text-primary)]"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            <Fuel className="h-5 w-5 text-[var(--primary)]" /> Catat Pengisian
          </DialogTitle>
        </DialogHeader>

        <div className="mt-2 space-y-4">
          {create.error && (
            <div className="flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{getErrorMessage(create.error)}</span>
            </div>
          )}

          {/* Kendaraan */}
          <InputSelect
            label="Kendaraan"
            required
            placeholder="Pilih kendaraan"
            options={vehicleOptions}
            value={vehicleId ?? ''}
            disabled={isPresetVehicle}
            onChange={(e) =>
              setVehicleId(e.target.value ? Number(e.target.value) : undefined)
            }
          />

          {/* Tipe bahan bakar */}
          <div>
            <p className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.07em] text-[var(--text-secondary)]">
              Jenis Bahan Bakar <span className="text-[var(--danger)]">*</span>
            </p>
            <div className="grid grid-cols-2 gap-2">
              {([FUEL_TYPE.BBM, FUEL_TYPE.LISTRIK] as FuelType[]).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => handleTypeChange(t)}
                  className={cn(
                    'h-10 rounded-lg border text-sm font-medium transition-all',
                    fuelType === t
                      ? 'border-[1.5px] border-[var(--primary)] bg-[var(--primary-light)] text-[var(--primary)]'
                      : 'border-[var(--border-input)] bg-[var(--bg-card)] text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)]',
                  )}
                >
                  {t === FUEL_TYPE.BBM ? 'BBM' : 'Listrik (EV)'}
                </button>
              ))}
            </div>
          </div>

          {/* Grade (hanya BBM) */}
          {isBbm && (
            <InputSelect
              label="Grade BBM"
              required
              options={gradeOptions}
              value={fuelGrade}
              onChange={(e) => setFuelGrade(e.target.value as FuelGrade)}
            />
          )}

          {/* Jumlah + harga */}
          <div className="grid grid-cols-2 gap-3">
            {isBbm ? (
              <>
                <InputNumber
                  label="Jumlah Liter"
                  required
                  min={0}
                  step={0.01}
                  value={liter ?? ''}
                  onChange={setLiter}
                />
                <InputRupiah
                  label="Harga / Liter"
                  required
                  value={pricePerLiter}
                  onChange={setPricePerLiter}
                />
              </>
            ) : (
              <>
                <InputNumber
                  label="Jumlah kWh"
                  required
                  min={0}
                  step={0.01}
                  value={kwh ?? ''}
                  onChange={setKwh}
                />
                <InputRupiah
                  label="Harga / kWh"
                  required
                  value={pricePerKwh}
                  onChange={setPricePerKwh}
                />
              </>
            )}
          </div>

          {/* Odometer */}
          <div className="grid grid-cols-2 gap-3">
            <InputNumber
              label="Odometer Sebelum"
              required
              min={0}
              value={odometerBefore ?? ''}
              onChange={setOdometerBefore}
              error={
                odoBeforeWarning
                  ? `Di bawah odometer terakhir (${formatNumber(
                      selectedVehicle!.currentOdometer,
                    )} km)`
                  : undefined
              }
            />
            <InputNumber
              label="Odometer Sesudah"
              required
              min={0}
              value={odometerAfter ?? ''}
              onChange={setOdometerAfter}
              error={odoAfterInvalid ? 'Harus lebih besar dari sebelum' : undefined}
            />
          </div>

          {/* Ringkasan auto-calculate */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg border border-[var(--border-divider)] bg-[var(--bg-subtle)] px-3 py-2">
              <p className="text-[10px] font-semibold uppercase tracking-[0.07em] text-[var(--text-secondary)]">
                Total Biaya
              </p>
              <p className="mt-0.5 text-sm font-semibold text-[var(--text-primary)]">
                {formatCurrency(totalCost)}
              </p>
            </div>
            <div className="rounded-lg border border-[var(--border-divider)] bg-[var(--bg-subtle)] px-3 py-2">
              <p className="text-[10px] font-semibold uppercase tracking-[0.07em] text-[var(--text-secondary)]">
                Jarak Tempuh
              </p>
              <p className="mt-0.5 text-sm font-semibold text-[var(--text-primary)]">
                {formatNumber(distanceKm > 0 ? distanceKm : 0)} km
              </p>
            </div>
          </div>

          {/* Bukti foto — WAJIB */}
          <InputFile
            label="Bukti Foto (struk/nota)"
            required
            accept="image/jpeg,image/png"
            maxSizeMb={5}
            onChange={(files) => setProofPhoto(files[0] ?? null)}
          />

          {!proofPhoto && (
            <p className="flex items-center gap-1 text-xs text-[var(--text-secondary)]">
              <AlertTriangle className="h-3 w-3" /> Bukti foto wajib diunggah.
            </p>
          )}

          {/* Catatan */}
          <InputTextArea
            label="Catatan"
            rows={2}
            placeholder="Opsional…"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />

          {/* Aksi */}
          <div className="flex gap-3 pt-1">
            <AppButton
              variant="secondary"
              fullWidth
              disabled={create.isPending}
              onClick={() => onOpenChange(false)}
            >
              Batal
            </AppButton>
            <AppButton
              fullWidth
              loading={create.isPending}
              disabled={!canSubmit || create.isPending}
              onClick={handleSubmit}
            >
              Simpan
            </AppButton>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

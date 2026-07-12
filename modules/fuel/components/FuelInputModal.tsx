'use client'

import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { AlertCircle, AlertTriangle, Fuel, Zap } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  AppButton,
  InputSelect,
  InputText,
  InputNumber,
  InputRupiah,
  InputFile,
  InputTextArea,
} from '@/components/ui-custom'
import { cn, getErrorMessage, formatCurrency } from '@/lib'
import { RESOURCE_STATUS, ENERGY_TYPE } from '@/constants'
import type { EnergyType, SelectOption } from '@/types'
import { useVehicles } from '@/modules/vehicles/hooks/useVehicles'
import { useCreateFuel } from '../hooks/useFuel'
import { useFuelTypes } from '../hooks/useFuelTypes'

interface FuelInputModalProps {
  presetVehicleId?: number
  presetBookingId?: number
  onSuccess?: () => void
  trigger?: ReactNode
}

export const FuelInputModal = ({
  presetVehicleId,
  presetBookingId,
  onSuccess,
  trigger,
}: FuelInputModalProps) => {
  const [open, setOpen] = useState(false)
  const { data: vehicles } = useVehicles({ status: RESOURCE_STATUS.AVAILABLE, limit: 100 })
  const { data: fuelTypes } = useFuelTypes()
  const create = useCreateFuel()

  const activeFuelTypes = useMemo(
    () => (fuelTypes ?? []).filter((t) => t.isActive),
    [fuelTypes],
  )

  const [vehicleId, setVehicleId] = useState<number | undefined>(presetVehicleId)
  const [energyType, setEnergyType] = useState<EnergyType>(ENERGY_TYPE.BBM)
  const [fuelTypeId, setFuelTypeId] = useState<number | undefined>()
  const [fuelGrade, setFuelGrade] = useState('')
  const [liter, setLiter] = useState<number | undefined>()
  const [pricePerLiter, setPricePerLiter] = useState<number | undefined>()
  const [kwh, setKwh] = useState<number | undefined>()
  const [pricePerKwh, setPricePerKwh] = useState<number | undefined>()
  const [odometerBefore, setOdometerBefore] = useState<number | undefined>()
  const [odometerAfter, setOdometerAfter] = useState<number | undefined>()
  const [proof, setProof] = useState<File | null>(null)
  const [note, setNote] = useState('')

  const isPresetVehicle = !!presetVehicleId
  const selectedVehicle = useMemo(
    () => (vehicles ?? []).find((v) => v.id === vehicleId),
    [vehicles, vehicleId],
  )
  // Tipe energi dipilih eksplisit; daftar jenis bahan bakar difilter mengikutinya
  // (BBM → Solar/Pertalite/…, LISTRIK → hanya bahan bakar listrik).
  const typesForEnergy = useMemo(
    () => activeFuelTypes.filter((t) => t.type === energyType),
    [activeFuelTypes, energyType],
  )
  const isBbm = energyType === ENERGY_TYPE.BBM
  const selectedType = useMemo(
    () => typesForEnergy.find((t) => t.id === fuelTypeId),
    [typesForEnergy, fuelTypeId],
  )

  // Jaga agar fuelTypeId selalu valid untuk tipe energi terpilih.
  useEffect(() => {
    if (!typesForEnergy.some((t) => t.id === fuelTypeId)) {
      setFuelTypeId(typesForEnergy[0]?.id)
    }
  }, [typesForEnergy, fuelTypeId])

  // Prefill harga dari defaultPrice fuel type terpilih
  useEffect(() => {
    if (!selectedType) return
    if (selectedType.type === ENERGY_TYPE.LISTRIK) setPricePerKwh(selectedType.defaultPrice)
    else setPricePerLiter(selectedType.defaultPrice)
  }, [selectedType])

  // Prefill odometer awal dari kendaraan
  useEffect(() => {
    if (selectedVehicle) setOdometerBefore(selectedVehicle.currentOdometer)
  }, [selectedVehicle])

  const totalCost = isBbm
    ? (liter ?? 0) * (pricePerLiter ?? 0)
    : (kwh ?? 0) * (pricePerKwh ?? 0)
  const odoInvalid =
    odometerBefore != null && odometerAfter != null && odometerAfter <= odometerBefore

  const canSubmit =
    !!vehicleId &&
    !!selectedType && // fuelTypeId harus benar-benar ada di master
    !!proof &&
    totalCost > 0 &&
    !odoInvalid &&
    (isBbm ? !!liter && !!pricePerLiter : !!kwh && !!pricePerKwh)

  const resetForm = () => {
    setVehicleId(presetVehicleId)
    setEnergyType(ENERGY_TYPE.BBM)
    setFuelTypeId(undefined)
    setFuelGrade('')
    setLiter(undefined)
    setPricePerLiter(undefined)
    setKwh(undefined)
    setPricePerKwh(undefined)
    setOdometerBefore(undefined)
    setOdometerAfter(undefined)
    setProof(null)
    setNote('')
  }

  const handleSubmit = async () => {
    if (!canSubmit || !vehicleId || !fuelTypeId || !proof) return
    try {
      await create.mutateAsync({
        vehicleId,
        bookingId: presetBookingId,
        fuelTypeId,
        fuelGrade: isBbm && fuelGrade.trim() ? fuelGrade.trim() : undefined,
        ...(isBbm ? { liter, pricePerLiter } : { kwh, pricePerKwh }),
        odometerBefore,
        odometerAfter,
        note: note.trim() || undefined,
        proofPhoto: proof,
      })
      resetForm()
      setOpen(false)
      onSuccess?.()
    } catch {
      // ditampilkan via create.error
    }
  }

  const vehicleOptions: SelectOption[] = (vehicles ?? []).map((v) => ({
    value: v.id,
    label: `${v.name} · ${v.plateNumber}`,
  }))
  const fuelTypeOptions: SelectOption[] = typesForEnergy.map((t) => ({
    value: t.id,
    label: t.name,
  }))

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <AppButton leftIcon={<Fuel className="h-4 w-4" />}>Catat Pengisian</AppButton>
        )}
      </DialogTrigger>
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

          {/* Belum ada master jenis bahan bakar → tak bisa mengisi */}
          {activeFuelTypes.length === 0 && (
            <div className="flex items-start gap-2.5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>
                Belum ada jenis bahan bakar. Tambahkan dulu di{' '}
                <span className="font-semibold">Pengaturan → Jenis Bahan Bakar</span>{' '}
                sebelum mencatat pengisian.
              </span>
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

          {/* Tipe energi — menentukan daftar jenis bahan bakar */}
          <div>
            <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.07em] text-[var(--text-secondary)]">
              Tipe Energi <span className="text-[var(--danger)]">*</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              {([ENERGY_TYPE.BBM, ENERGY_TYPE.LISTRIK] as const).map((et) => {
                const active = energyType === et
                const bbm = et === ENERGY_TYPE.BBM
                return (
                  <button
                    key={et}
                    type="button"
                    onClick={() => setEnergyType(et)}
                    className={cn(
                      'flex h-10 items-center justify-center gap-1.5 rounded-lg border text-sm font-medium transition-all',
                      active
                        ? 'border-[1.5px] border-[var(--primary)] bg-[var(--primary-light)] text-[var(--primary)]'
                        : 'border-[var(--border-input)] text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)]',
                    )}
                  >
                    {bbm ? <Fuel className="h-4 w-4" /> : <Zap className="h-4 w-4" />}
                    {bbm ? 'BBM' : 'Listrik'}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Jenis bahan bakar (difilter tipe energi) */}
          <div>
            <InputSelect
              label={isBbm ? 'Jenis BBM' : 'Jenis Listrik'}
              required
              placeholder={isBbm ? 'Pilih jenis BBM' : 'Pilih jenis listrik'}
              options={fuelTypeOptions}
              value={fuelTypeId ?? ''}
              onChange={(e) =>
                setFuelTypeId(e.target.value ? Number(e.target.value) : undefined)
              }
            />
            {activeFuelTypes.length > 0 && typesForEnergy.length === 0 && (
              <p className="mt-1.5 flex items-center gap-1 text-xs text-amber-700">
                <AlertTriangle className="h-3 w-3" />
                Belum ada jenis {isBbm ? 'BBM' : 'listrik'} di master. Tambahkan di
                Pengaturan → Jenis Bahan Bakar.
              </p>
            )}
          </div>

          {/* Field kondisional */}
          {isBbm ? (
            <>
              <div className="grid grid-cols-2 gap-3">
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
              </div>
              <InputText
                label="Grade / RON (opsional)"
                placeholder="mis. RON 92"
                value={fuelGrade}
                onChange={(e) => setFuelGrade(e.target.value)}
              />
            </>
          ) : (
            <div className="grid grid-cols-2 gap-3">
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
            </div>
          )}

          {/* Odometer */}
          <div className="grid grid-cols-2 gap-3">
            <InputNumber
              label="Odometer Awal"
              min={0}
              value={odometerBefore ?? ''}
              onChange={setOdometerBefore}
            />
            <InputNumber
              label="Odometer Akhir"
              min={0}
              value={odometerAfter ?? ''}
              onChange={setOdometerAfter}
              error={odoInvalid ? 'Harus lebih besar dari awal' : undefined}
            />
          </div>

          {/* Total (read-only) */}
          <div className="rounded-lg border border-[var(--border-divider)] bg-[var(--bg-subtle)] px-3 py-2">
            <p className="text-[10px] font-semibold uppercase tracking-[0.07em] text-[var(--text-secondary)]">
              Total Biaya
            </p>
            <p className="mt-0.5 text-base font-bold text-[var(--text-primary)]">
              {formatCurrency(totalCost)}
            </p>
          </div>

          {/* Bukti — WAJIB */}
          <InputFile
            label="Bukti Foto (struk/nota)"
            required
            accept="image/jpeg,image/png"
            maxSizeMb={5}
            onChange={(files) => setProof(files[0] ?? null)}
          />
          {!proof && (
            <p className="flex items-center gap-1 text-xs text-[var(--text-secondary)]">
              <AlertTriangle className="h-3 w-3" /> Bukti foto wajib diunggah.
            </p>
          )}

          <InputTextArea
            label="Catatan"
            rows={2}
            placeholder="Opsional…"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />

          <div className="flex gap-3 pt-1">
            <AppButton
              variant="secondary"
              fullWidth
              disabled={create.isPending}
              onClick={() => setOpen(false)}
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

'use client'

import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { AlertCircle, AlertTriangle, Fuel, Gauge, Zap } from 'lucide-react'
import { toast } from 'sonner'
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
import { cn, getErrorMessage, formatNumber, kmHint } from '@/lib'
import { ENERGY_TYPE } from '@/constants'
import type { EnergyType, FuelFillReason, SelectOption } from '@/types'
import { useVehicles } from '@/modules/vehicles/hooks/useVehicles'
import { useCreateFuel } from '../hooks/useFuel'
import { useFuelTypes } from '../hooks/useFuelTypes'
import { useFuelBalance, useFuelStations } from '../hooks/useFuelVoucher'
import { FUEL_REASON_LABEL, formatQty, formatRupiahExact } from '../utils/format'

// ─────────────────────────────────────────
// CATAT PENGISIAN LANGSUNG (tanpa voucher)
// SPD / perjalanan jauh / darurat / SPBU non-mitra / charging kantor.
// Liter keluar mengurangi saldo BBM kendaraan (boleh minus).
// ─────────────────────────────────────────

interface FuelInputModalProps {
  presetVehicleId?: number
  presetBookingId?: number
  onSuccess?: () => void
  trigger?: ReactNode
}

type KwhMode = 'INPUT' | 'METER' | 'BATTERY'
const OTHER_STATION = -1

const reasonOptions: SelectOption[] = (
  ['SPD', 'LONG_TRIP', 'EMERGENCY', 'OFFICE', 'OTHER'] as FuelFillReason[]
).map((r) => ({ value: r, label: FUEL_REASON_LABEL[r] }))

export const FuelInputModal = ({
  presetVehicleId,
  presetBookingId,
  onSuccess,
  trigger,
}: FuelInputModalProps) => {
  const [open, setOpen] = useState(false)
  // Tidak difilter status - kendaraan yang paling sering diisi BBM justru
  // sedang IN_USE (dipakai driver di tengah perjalanan), bukan AVAILABLE.
  const { data: vehicles } = useVehicles({ limit: 100 })
  const { data: fuelTypes } = useFuelTypes()
  const { data: stations } = useFuelStations(true)
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
  const [kwhMode, setKwhMode] = useState<KwhMode>('INPUT')
  const [kwh, setKwh] = useState<number | undefined>()
  const [meterStart, setMeterStart] = useState<number | undefined>()
  const [meterEnd, setMeterEnd] = useState<number | undefined>()
  const [batteryBefore, setBatteryBefore] = useState<number | undefined>()
  const [batteryAfter, setBatteryAfter] = useState<number | undefined>()
  const [pricePerKwh, setPricePerKwh] = useState<number | undefined>()
  const [odometer, setOdometer] = useState<number | undefined>()
  const [stationId, setStationId] = useState<number>(OTHER_STATION)
  const [stationName, setStationName] = useState('')
  const [reason, setReason] = useState<FuelFillReason | ''>('')
  const [proof, setProof] = useState<File | null>(null)
  const [note, setNote] = useState('')

  const isPresetVehicle = !!presetVehicleId
  const selectedVehicle = useMemo(
    () => (vehicles ?? []).find((v) => v.id === vehicleId),
    [vehicles, vehicleId],
  )
  const { data: balanceData } = useFuelBalance(open ? vehicleId : undefined)
  const balance = balanceData?.balances?.[energyType]
  const profile = balanceData?.profile

  // Tipe energi dipilih eksplisit; daftar jenis bahan bakar difilter mengikutinya.
  const typesForEnergy = useMemo(
    () => activeFuelTypes.filter((t) => t.type === energyType),
    [activeFuelTypes, energyType],
  )
  const isBbm = energyType === ENERGY_TYPE.BBM
  const selectedType = useMemo(
    () => typesForEnergy.find((t) => t.id === fuelTypeId),
    [typesForEnergy, fuelTypeId],
  )

  useEffect(() => {
    if (!typesForEnergy.some((t) => t.id === fuelTypeId)) {
      setFuelTypeId(typesForEnergy[0]?.id)
    }
  }, [typesForEnergy, fuelTypeId])

  // Harga dari satu master (Pengaturan → Jenis Bahan Bakar), tetap bisa diubah.
  useEffect(() => {
    if (!selectedType) return
    if (selectedType.type === ENERGY_TYPE.LISTRIK) setPricePerKwh(selectedType.defaultPrice)
    else setPricePerLiter(selectedType.defaultPrice)
  }, [selectedType])

  useEffect(() => {
    if (selectedVehicle) setOdometer(selectedVehicle.currentOdometer)
  }, [selectedVehicle])

  // Kendaraan BBM/LISTRIK cuma bisa diisi sesuai tipenya sendiri; HYBRID bebas.
  useEffect(() => {
    if (!selectedVehicle) return
    if (selectedVehicle.energyType === 'BBM' || selectedVehicle.energyType === 'LISTRIK') {
      setEnergyType(selectedVehicle.energyType)
    }
  }, [selectedVehicle])

  // Listrik umumnya di-charge di kantor.
  useEffect(() => {
    if (!isBbm && !reason) setReason('OFFICE')
  }, [isBbm, reason])

  // Jumlah kWh sesuai mode (estimasi baterai ÷ 0,9 = rugi-rugi charger, sama dgn server).
  const kwhValue = useMemo(() => {
    if (kwhMode === 'INPUT') return kwh ?? 0
    if (kwhMode === 'METER') {
      return meterStart != null && meterEnd != null && meterEnd > meterStart ? meterEnd - meterStart : 0
    }
    const cap = profile?.batteryCapacityKwh
    if (!cap || batteryBefore == null || batteryAfter == null || batteryAfter <= batteryBefore) return 0
    return Math.round(((batteryAfter - batteryBefore) / 100) * cap / 0.9 * 100) / 100
  }, [kwhMode, kwh, meterStart, meterEnd, batteryBefore, batteryAfter, profile])

  const quantity = isBbm ? (liter ?? 0) : kwhValue
  const price = isBbm ? (pricePerLiter ?? 0) : (pricePerKwh ?? 0)
  const totalCost = Math.round(quantity * price * 100) / 100
  const minOdo = selectedVehicle?.currentOdometer ?? 0
  const odoInvalid = odometer != null && odometer < minOdo

  // Hak dari jarak sejak titik hitung terakhir sampai odometer yang diisi.
  const entitlement = useMemo(() => {
    if (!balance || !balance.kmPerUnit || odometer == null) return null
    const km = Math.max(0, odometer - balance.checkpointOdometer)
    return Math.round((balance.recordedBalance + km / balance.kmPerUnit) * 100) / 100
  }, [balance, odometer])
  const exceedsEntitlement = entitlement != null && quantity > entitlement + 0.01
  const tank = isBbm ? profile?.tankCapacityLiter : null
  const exceedsTank = !!tank && quantity > tank

  const canSubmit =
    !!vehicleId &&
    !!selectedType &&
    !!proof &&
    odometer != null &&
    odometer > 0 &&
    !odoInvalid &&
    quantity > 0 &&
    price > 0

  const resetForm = () => {
    setVehicleId(presetVehicleId)
    setEnergyType(ENERGY_TYPE.BBM)
    setFuelTypeId(undefined)
    setFuelGrade('')
    setLiter(undefined)
    setPricePerLiter(undefined)
    setKwhMode('INPUT')
    setKwh(undefined)
    setMeterStart(undefined)
    setMeterEnd(undefined)
    setBatteryBefore(undefined)
    setBatteryAfter(undefined)
    setPricePerKwh(undefined)
    setOdometer(undefined)
    setStationId(OTHER_STATION)
    setStationName('')
    setReason('')
    setProof(null)
    setNote('')
  }

  const handleSubmit = async () => {
    if (!canSubmit || !vehicleId || !fuelTypeId || !proof || odometer == null) return
    try {
      const res = await create.mutateAsync({
        vehicleId,
        bookingId: presetBookingId,
        fuelTypeId,
        fuelGrade: isBbm && fuelGrade.trim() ? fuelGrade.trim() : undefined,
        ...(isBbm
          ? { liter, pricePerLiter }
          : {
              pricePerKwh,
              ...(kwhMode === 'INPUT' ? { kwh } : {}),
              ...(kwhMode === 'METER' ? { meterStartKwh: meterStart, meterEndKwh: meterEnd } : {}),
              ...(kwhMode === 'BATTERY' ? { batteryBefore, batteryAfter } : {}),
            }),
        odometer,
        stationId: stationId !== OTHER_STATION ? stationId : undefined,
        stationName: stationId === OTHER_STATION && stationName.trim() ? stationName.trim() : undefined,
        reason: reason || undefined,
        note: note.trim() || undefined,
        proofPhoto: proof,
      })
      for (const w of res.data?.warnings ?? []) toast.warning(w)
      toast.success('Pengisian dicatat')
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
  const stationOptions: SelectOption[] = [
    ...(stations ?? []).map((s) => ({ value: s.id, label: `${s.name} (mitra)` })),
    { value: OTHER_STATION, label: isBbm ? 'SPBU lain (bukan mitra)' : 'Lokasi lain' },
  ]
  const unit = isBbm ? 'L' : 'kWh'

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
            <Fuel className="h-5 w-5 text-[var(--primary)]" /> Catat Pengisian Langsung
          </DialogTitle>
        </DialogHeader>

        <div className="mt-2 space-y-4">
          <p className="text-xs text-[var(--text-secondary)]">
            Untuk SPD, perjalanan jauh, darurat, SPBU non-mitra, atau charging kantor. Pengisian di
            SPBU mitra memakai voucher dari admin.
          </p>

          {create.error && (
            <div className="flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{getErrorMessage(create.error)}</span>
            </div>
          )}

          {activeFuelTypes.length === 0 && (
            <div className="flex items-start gap-2.5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>
                Belum ada jenis bahan bakar. Tambahkan dulu di{' '}
                <span className="font-semibold">Pengaturan → Jenis Bahan Bakar</span>.
              </span>
            </div>
          )}

          <InputSelect
            label="Kendaraan"
            required
            placeholder="Pilih kendaraan"
            options={vehicleOptions}
            value={vehicleId ?? ''}
            disabled={isPresetVehicle}
            onChange={(e) => setVehicleId(e.target.value ? Number(e.target.value) : undefined)}
          />

          {/* Tipe energi */}
          <div>
            <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.07em] text-[var(--text-secondary)]">
              Tipe Energi <span className="text-[var(--danger)]">*</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              {([ENERGY_TYPE.BBM, ENERGY_TYPE.LISTRIK] as const).map((et) => {
                const active = energyType === et
                const bbm = et === ENERGY_TYPE.BBM
                const locked =
                  !!selectedVehicle &&
                  selectedVehicle.energyType !== 'HYBRID' &&
                  selectedVehicle.energyType !== et
                return (
                  <button
                    key={et}
                    type="button"
                    disabled={locked}
                    onClick={() => setEnergyType(et)}
                    className={cn(
                      'flex h-10 items-center justify-center gap-1.5 rounded-lg border text-sm font-medium transition-all',
                      active
                        ? 'border-[1.5px] border-[var(--primary)] bg-[var(--primary-light)] text-[var(--primary)]'
                        : 'border-[var(--border-input)] text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)]',
                      locked && 'cursor-not-allowed opacity-40 hover:bg-transparent',
                    )}
                  >
                    {bbm ? <Fuel className="h-4 w-4" /> : <Zap className="h-4 w-4" />}
                    {bbm ? 'BBM' : 'Listrik'}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Odometer + saldo */}
          <div>
            <InputNumber
              label="Odometer Saat Mengisi (km)"
              required
              min={minOdo}
              value={odometer ?? ''}
              onChange={setOdometer}
              error={odoInvalid ? `Tidak boleh kurang dari ${formatNumber(minOdo)} km` : undefined}
              hint={
                selectedVehicle
                  ? kmHint(
                      ['Km terakhir kendaraan', minOdo],
                      [isBbm ? 'Km isi BBM terakhir' : 'Km pengisian daya terakhir', balance?.checkpointOdometer],
                    )
                  : 'Pilih kendaraan dulu'
              }
            />
            {balance && (
              <div className="mt-2 flex items-start gap-2 rounded-lg border border-[var(--border-divider)] bg-[var(--bg-subtle)] px-3 py-2 text-xs text-[var(--text-secondary)]">
                <Gauge className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                {balance.kmPerUnit ? (
                  <span>
                    Saldo{' '}
                    {formatQty(balance.recordedBalance)} {unit} · hak sampai odometer ini{' '}
                    <b className="text-[var(--text-primary)]">
                      {formatQty(entitlement)} {unit}
                    </b>{' '}
                    ({formatQty(balance.kmPerUnit)} km/{unit})
                  </span>
                ) : (
                  <span>
                    {isBbm ? 'Konsumsi km/liter' : 'Efisiensi km/kWh'} kendaraan belum diatur -
                    pengisian dicatat tanpa dihitung ke saldo.
                  </span>
                )}
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <InputSelect
              label={isBbm ? 'Jenis BBM' : 'Jenis Listrik'}
              required
              options={fuelTypeOptions}
              value={fuelTypeId ?? ''}
              onChange={(e) => setFuelTypeId(e.target.value ? Number(e.target.value) : undefined)}
            />
            <InputSelect
              label="Alasan"
              placeholder="Pilih alasan"
              options={reasonOptions}
              value={reason}
              onChange={(e) => setReason(e.target.value as FuelFillReason | '')}
            />
          </div>

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
            <>
              <div>
                <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.07em] text-[var(--text-secondary)]">
                  Cara Hitung kWh
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(
                    [
                      ['INPUT', 'kWh langsung'],
                      ['METER', 'Meter charger'],
                      ['BATTERY', '% Baterai'],
                    ] as [KwhMode, string][]
                  ).map(([m, label]) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setKwhMode(m)}
                      className={cn(
                        'h-9 rounded-lg border text-xs font-medium',
                        kwhMode === m
                          ? 'border-[1.5px] border-[var(--primary)] bg-[var(--primary-light)] text-[var(--primary)]'
                          : 'border-[var(--border-input)] text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)]',
                      )}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
              {kwhMode === 'INPUT' && (
                <InputNumber label="Jumlah kWh" required min={0} step={0.01} value={kwh ?? ''} onChange={setKwh} />
              )}
              {kwhMode === 'METER' && (
                <div className="grid grid-cols-2 gap-3">
                  <InputNumber label="Meter Awal (kWh)" required min={0} step={0.01} value={meterStart ?? ''} onChange={setMeterStart} />
                  <InputNumber label="Meter Akhir (kWh)" required min={0} step={0.01} value={meterEnd ?? ''} onChange={setMeterEnd} />
                </div>
              )}
              {kwhMode === 'BATTERY' && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <InputNumber label="Baterai Sebelum (%)" required min={0} max={100} value={batteryBefore ?? ''} onChange={setBatteryBefore} />
                    <InputNumber label="Baterai Sesudah (%)" required min={0} max={100} value={batteryAfter ?? ''} onChange={setBatteryAfter} />
                  </div>
                  {!profile?.batteryCapacityKwh && (
                    <p className="flex items-center gap-1 text-xs text-amber-700">
                      <AlertTriangle className="h-3 w-3" /> Kapasitas baterai kendaraan belum diatur
                      (Bahan Bakar → Saldo → Profil).
                    </p>
                  )}
                </>
              )}
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg border border-[var(--border-divider)] bg-[var(--bg-subtle)] px-3 py-2">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.07em] text-[var(--text-secondary)]">
                    kWh Terpakai
                  </p>
                  <p className="mt-0.5 text-sm font-bold text-[var(--text-primary)]">
                    {formatQty(kwhValue)} kWh{kwhMode === 'BATTERY' ? ' (estimasi)' : ''}
                  </p>
                </div>
                <InputRupiah label="Harga / kWh" required value={pricePerKwh} onChange={setPricePerKwh} />
              </div>
            </>
          )}

          <div className="grid grid-cols-2 gap-3">
            <InputSelect
              label={isBbm ? 'SPBU' : 'Lokasi'}
              options={stationOptions}
              value={stationId}
              onChange={(e) => setStationId(Number(e.target.value))}
            />
            {stationId === OTHER_STATION && (
              <InputText
                label={isBbm ? 'Nama SPBU' : 'Nama Lokasi'}
                placeholder={isBbm ? 'mis. SPBU 34-xxxxx' : 'mis. Kantor pusat'}
                value={stationName}
                onChange={(e) => setStationName(e.target.value)}
              />
            )}
          </div>

          {(exceedsEntitlement || exceedsTank) && (
            <div className="flex items-start gap-2.5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-800">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>
                {exceedsEntitlement &&
                  `Melebihi hak saldo (${formatQty(entitlement)} ${unit}) - saldo akan minus dan voucher berikutnya berkurang. `}
                {exceedsTank && `Melebihi kapasitas tangki (${formatQty(tank)} L).`}
              </span>
            </div>
          )}

          <div className="rounded-lg border border-[var(--border-divider)] bg-[var(--bg-subtle)] px-3 py-2">
            <p className="text-[10px] font-semibold uppercase tracking-[0.07em] text-[var(--text-secondary)]">
              Total Biaya
            </p>
            <p className="mt-0.5 text-base font-bold text-[var(--text-primary)]">
              {formatRupiahExact(totalCost)}
            </p>
          </div>

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

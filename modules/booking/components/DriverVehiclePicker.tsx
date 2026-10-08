'use client'

import { useEffect, useMemo, useState } from 'react'
import { Car, Info, UserRound } from 'lucide-react'
import { SearchableSelect, type SearchableOption } from '@/components/ui-custom'
import { Switch } from '@/components/ui/switch'
import { getErrorMessage } from '@/lib'
import { RESOURCE_STATUS } from '@/constants'
import type { AssignOptionDriver, AssignOptionVehicle } from '@/types'
import { useAssignOptions } from '../hooks/useBookings'

// ─────────────────────────────────────────
// DRIVER + KENDARAAN PICKER (panel Tugaskan & dialog Alihkan)
// Dropdown dengan pencarian langsung. Driver menampilkan kendaraan tetapnya,
// kendaraan menampilkan supir tetapnya. Yang tidak bisa dipakai di jadwal
// booking ini tetap tampil (abu-abu + alasan) - alasannya dari backend,
// sama dengan penolakan assign-vehicle. Memilih salah satu yang punya
// pasangan tetap otomatis ikut memilih pasangannya (bila tersedia) - bisa
// dimatikan lewat sakelar "Ikuti pasangan tetap" (pilihan diingat per browser).
// ─────────────────────────────────────────

interface Props {
  bookingId: number
  driverId: string
  vehicleId: string
  onDriverChange: (id: string) => void
  onVehicleChange: (id: string) => void
  /** false = jangan muat dulu (mis. dialog belum dibuka). */
  enabled?: boolean
}

// Pilihan sakelar "Ikuti pasangan tetap" diingat per browser.
const FOLLOW_PAIR_KEY = 'assign-follow-pair'
const readFollowPair = () => {
  try {
    return localStorage.getItem(FOLLOW_PAIR_KEY) !== '0'
  } catch {
    return true
  }
}
const saveFollowPair = (v: boolean) => {
  try {
    localStorage.setItem(FOLLOW_PAIR_KEY, v ? '1' : '0')
  } catch {
    // penyimpanan diblokir - cukup untuk sesi ini
  }
}

// Yang bisa dipilih di atas, lalu urut nama.
const byAvailabilityThenName = <T extends { available: boolean; name: string }>(a: T, b: T) =>
  Number(b.available) - Number(a.available) || a.name.localeCompare(b.name, 'id')

// Baris info: ikon + teks + tambahan (NIP / kursi) dalam satu baris rata tengah.
const Line = ({ icon: Icon, children, extra }: { icon: typeof Car; children: React.ReactNode; extra?: string }) => (
  <span className="flex flex-wrap items-center gap-x-1">
    <Icon className="h-3 w-3 shrink-0" />
    <span>{children}</span>
    {extra && <span>· {extra}</span>}
  </span>
)

const driverOption = (d: AssignOptionDriver): SearchableOption => ({
  value: String(d.id),
  label: d.name,
  description: (
    <>
      <Line icon={Car} extra={d.employeeId || undefined}>
        {d.fixedVehicle ? `${d.fixedVehicle.name} · ${d.fixedVehicle.plateNumber}` : 'Tanpa kendaraan tetap'}
      </Line>
      {!d.available && d.reason && <span className="block text-[#92400E]">{d.reason}</span>}
    </>
  ),
  keywords: [d.employeeId, d.phoneNumber, d.fixedVehicle?.name ?? '', d.fixedVehicle?.plateNumber ?? ''],
  disabled: !d.available,
  badge: !d.available
    ? { text: 'Tidak tersedia', tone: 'warning' }
    : d.isCurrent
      ? { text: 'Saat ini', tone: 'neutral' }
      : { text: 'Tersedia', tone: 'success' },
})

const vehicleOption = (v: AssignOptionVehicle): SearchableOption => ({
  value: String(v.id),
  label: `${v.name} · ${v.plateNumber}`,
  description: (
    <>
      <Line icon={UserRound} extra={`${v.capacity} kursi`}>
        {v.fixedDriver ? `Supir tetap: ${v.fixedDriver.name}` : 'Tanpa supir tetap'}
      </Line>
      {!v.available && v.reason && <span className="block text-[#92400E]">{v.reason}</span>}
      {v.available && v.warning && <span className="block text-[#92400E]">{v.warning}</span>}
    </>
  ),
  keywords: [v.plateNumber, v.fixedDriver?.name ?? ''],
  disabled: !v.available,
  badge: !v.available
    ? { text: v.status === RESOURCE_STATUS.INACTIVE ? 'Nonaktif' : 'Tidak tersedia', tone: v.status === RESOURCE_STATUS.INACTIVE ? 'neutral' : 'warning' }
    : v.warning
      ? { text: 'Kapasitas kurang', tone: 'warning' }
      : v.isCurrent
        ? { text: 'Saat ini', tone: 'neutral' }
        : { text: 'Tersedia', tone: 'success' },
})

export const DriverVehiclePicker = ({
  bookingId,
  driverId,
  vehicleId,
  onDriverChange,
  onVehicleChange,
  enabled = true,
}: Props) => {
  const { data, isLoading, error } = useAssignOptions(bookingId, enabled)
  const [pairNote, setPairNote] = useState('')
  // true = memilih satu ikut memilih pasangan tetapnya; false = bebas.
  // Dibaca setelah mount (localStorage tidak ada saat render server).
  const [followPair, setFollowPair] = useState(true)
  useEffect(() => setFollowPair(readFollowPair()), [])

  const toggleFollowPair = (v: boolean) => {
    setFollowPair(v)
    saveFollowPair(v)
    setPairNote('')
  }

  const drivers = useMemo(() => [...(data?.drivers ?? [])].sort(byAvailabilityThenName), [data])
  const vehicles = useMemo(() => [...(data?.vehicles ?? [])].sort(byAvailabilityThenName), [data])
  const driverOptions = useMemo(() => drivers.map(driverOption), [drivers])
  const vehicleOptions = useMemo(() => vehicles.map(vehicleOption), [vehicles])

  const handleDriver = (id: string) => {
    onDriverChange(id)
    setPairNote('')
    if (!followPair) return
    const fv = drivers.find((d) => String(d.id) === id)?.fixedVehicle
    if (!fv || String(fv.id) === vehicleId) return
    const v = vehicles.find((x) => x.id === fv.id)
    if (v?.available) {
      onVehicleChange(String(v.id))
      setPairNote(`Kendaraan tetapnya (${v.name} · ${v.plateNumber}) otomatis dipilih - masih bisa diganti.`)
    } else if (v) {
      setPairNote(`Kendaraan tetapnya (${v.plateNumber}) tidak tersedia di jadwal ini - pilih kendaraan lain.`)
    }
  }

  const handleVehicle = (id: string) => {
    onVehicleChange(id)
    setPairNote('')
    if (!followPair) return
    const fd = vehicles.find((v) => String(v.id) === id)?.fixedDriver
    if (!fd || String(fd.id) === driverId) return
    const d = drivers.find((x) => x.id === fd.id)
    if (d?.available) {
      onDriverChange(String(d.id))
      setPairNote(`Supir tetapnya (${d.name}) otomatis dipilih - masih bisa diganti.`)
    } else {
      setPairNote(`Supir tetapnya (${fd.name}) tidak tersedia di jadwal ini - pilih driver lain.`)
    }
  }

  const availableCount = (list: { available: boolean }[]) => list.filter((x) => x.available).length

  return (
    <div className="space-y-3">
      {error && (
        <p className="text-xs text-[var(--danger)]">Gagal memuat pilihan: {getErrorMessage(error)}</p>
      )}
      <label className="flex cursor-pointer items-start justify-between gap-3 rounded-lg border border-[var(--border-divider)] bg-[var(--bg-subtle)] px-3 py-2.5">
        <span className="min-w-0">
          <span className="block text-sm font-medium text-[var(--text-primary)]">Ikuti pasangan tetap</span>
          <span className="block text-xs text-[var(--text-secondary)]">
            {followPair
              ? 'Memilih driver ikut memilih kendaraan tetapnya, dan sebaliknya.'
              : 'Bebas: driver dan kendaraan dipilih masing-masing.'}
          </span>
        </span>
        <Switch checked={followPair} onCheckedChange={toggleFollowPair} className="mt-0.5 shrink-0" />
      </label>
      <SearchableSelect
        label="Pilih Driver"
        required
        placeholder="Pilih driver"
        searchPlaceholder="Cari nama, NIP, atau plat kendaraan…"
        emptyText="Driver tidak ditemukan"
        loading={isLoading}
        options={driverOptions}
        value={driverId}
        onChange={handleDriver}
        hint={data ? `${availableCount(drivers)} dari ${drivers.length} driver tersedia di jadwal ini` : undefined}
      />
      <SearchableSelect
        label="Pilih Kendaraan"
        required
        placeholder="Pilih kendaraan"
        searchPlaceholder="Cari nama, plat, atau nama supir…"
        emptyText="Kendaraan tidak ditemukan"
        loading={isLoading}
        options={vehicleOptions}
        value={vehicleId}
        onChange={handleVehicle}
        hint={data ? `${availableCount(vehicles)} dari ${vehicles.length} kendaraan tersedia di jadwal ini` : undefined}
      />
      {pairNote && (
        <p className="flex items-start gap-1.5 rounded-lg bg-[var(--bg-subtle)] px-3 py-2 text-xs text-[var(--text-secondary)]">
          <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          {pairNote}
        </p>
      )}
    </div>
  )
}

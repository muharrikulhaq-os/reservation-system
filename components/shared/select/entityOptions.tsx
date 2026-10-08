import { Building2, Car, MapPin, Phone, UserRound, Users } from 'lucide-react'
import type { SearchableOption, SearchableOptionTone } from '@/components/ui-custom'
import { RESOURCE_STATUS } from '@/constants'
import { formatKm } from '@/lib'
import type { Driver, FuelStation, ResourceStatus, Room, RoomKeeper, Vehicle, Vendor } from '@/types'

// ─────────────────────────────────────────
// OPSI DROPDOWN INFORMATIF (SearchableSelect)
// Satu tempat untuk tampilan opsi entitas di semua dropdown: label + baris
// keterangan (pasangan tetap, lokasi, kapasitas, km, kontak) + badge status +
// kata kunci pencarian. Dipakai bersama supaya setiap dropdown kendaraan /
// supir / ruangan / vendor / SPBU tampil sama di semua halaman.
// ─────────────────────────────────────────

// Baris info: ikon + teks, dipisah titik tengah.
const Info = ({ icon: Icon, parts }: { icon: typeof Car; parts: (string | null | undefined | false)[] }) => (
  <span className="flex flex-wrap items-center gap-x-1">
    <Icon className="h-3 w-3 shrink-0" />
    <span>{parts.filter(Boolean).join(' · ')}</span>
  </span>
)

const RESOURCE_BADGE: Record<ResourceStatus, { text: string; tone: SearchableOptionTone }> = {
  AVAILABLE: { text: 'Tersedia', tone: 'success' },
  IN_USE: { text: 'Dipakai', tone: 'warning' },
  MAINTENANCE: { text: 'Maintenance', tone: 'warning' },
  INACTIVE: { text: 'Nonaktif', tone: 'neutral' },
}

interface OptionOverrides {
  /** Opsi tidak bisa dipilih (alasannya tampil di keterangan). */
  disabledReason?: string
  /** Ganti badge bawaan (mis. "Saat ini"). */
  badge?: SearchableOption['badge']
}

const withOverrides = (o: SearchableOption, ov?: OptionOverrides): SearchableOption => ({
  ...o,
  ...(ov?.badge ? { badge: ov.badge } : {}),
  ...(ov?.disabledReason
    ? {
        disabled: true,
        description: (
          <>
            {o.description}
            <span className="block text-[#92400E]">{ov.disabledReason}</span>
          </>
        ),
      }
    : {}),
})

/** Kendaraan: plat, supir tetap, kursi, km terakhir, sewa; badge status. */
export const vehicleOption = (v: Vehicle, ov?: OptionOverrides): SearchableOption =>
  withOverrides(
    {
      value: String(v.id),
      label: `${v.name} · ${v.plateNumber}`,
      description: (
        <>
          <Info
            icon={UserRound}
            parts={[v.fixedDriver ? `Supir tetap: ${v.fixedDriver.name}` : 'Tanpa supir tetap', `${v.capacity} kursi`]}
          />
          <Info
            icon={Car}
            parts={[
              formatKm(v.currentOdometer),
              v.ownership === 'VENDOR' ? `Sewa${v.ownerVendor ? ` (${v.ownerVendor.name})` : ''}` : null,
            ]}
          />
        </>
      ),
      keywords: [v.plateNumber, v.fixedDriver?.name ?? '', v.ownerVendor?.name ?? '', v.category?.name ?? ''],
      badge: RESOURCE_BADGE[v.status],
    },
    ov,
  )

/** Supir: kendaraan tetap / yang sedang dibawa, NIP; badge status. */
export const driverOption = (d: Driver, ov?: OptionOverrides): SearchableOption =>
  withOverrides(
    {
      value: String(d.id),
      label: d.name,
      description: (
        <Info
          icon={Car}
          parts={[
            d.fixedVehicle ? `Kendaraan tetap: ${d.fixedVehicle.plateNumber}` : 'Tanpa kendaraan tetap',
            d.assignedPlate ? `Membawa ${d.assignedPlate}` : null,
            d.employeeId,
          ]}
        />
      ),
      keywords: [d.employeeId, d.phoneNumber, d.fixedVehicle?.plateNumber ?? '', d.assignedPlate ?? ''],
      disabled: !d.isActive || !d.userIsActive,
      badge:
        !d.isActive || !d.userIsActive
          ? { text: 'Nonaktif', tone: 'neutral' }
          : d.assignedPlate
            ? { text: 'Bertugas', tone: 'warning' }
            : { text: 'Tersedia', tone: 'success' },
    },
    ov,
  )

/** Ruangan: lokasi, kapasitas, penjaga; badge status. */
export const roomOption = (r: Room, ov?: OptionOverrides): SearchableOption =>
  withOverrides(
    {
      value: String(r.resourceId),
      label: r.name,
      description: (
        <>
          <Info icon={MapPin} parts={[r.location, `${r.capacity} orang`]} />
          <Info icon={UserRound} parts={[r.roomKeeper ? `Penjaga: ${r.roomKeeper.name}` : 'Belum ada penjaga']} />
        </>
      ),
      keywords: [r.location, r.roomKeeper?.name ?? ''],
      disabled: r.status !== RESOURCE_STATUS.AVAILABLE,
      badge: RESOURCE_BADGE[r.status],
    },
    ov,
  )

/** Vendor: jenis, PIC, telepon, alamat. */
export const vendorOption = (v: Vendor, ov?: OptionOverrides): SearchableOption =>
  withOverrides(
    {
      value: String(v.id),
      label: v.name,
      description: (
        <>
          <Info icon={Building2} parts={[v.typeLabel, v.picName ? `PIC ${v.picName}` : null, v.phone]} />
          {v.address && <Info icon={MapPin} parts={[v.address]} />}
        </>
      ),
      keywords: [v.typeLabel, v.picName ?? '', v.address ?? '', v.phone ?? ''],
      disabled: !v.isActive,
      badge: !v.isActive ? { text: 'Nonaktif', tone: 'neutral' } : undefined,
    },
    ov,
  )

/** SPBU mitra: alamat, kontak. */
export const stationOption = (s: FuelStation, ov?: OptionOverrides): SearchableOption =>
  withOverrides(
    {
      value: String(s.id),
      label: s.name,
      description: (
        <>
          <Info icon={MapPin} parts={[s.address || 'Alamat belum diisi']} />
          {(s.contactPerson || s.phone) && <Info icon={Phone} parts={[s.contactPerson, s.phone]} />}
        </>
      ),
      keywords: [s.address ?? '', s.contactPerson ?? '', s.phone ?? ''],
      disabled: !s.isActive,
      badge: !s.isActive ? { text: 'Nonaktif', tone: 'neutral' } : undefined,
    },
    ov,
  )

/** Penjaga ruangan: NIP, ruangan yang sudah dijaga. */
export const roomKeeperOption = (k: RoomKeeper, ov?: OptionOverrides): SearchableOption =>
  withOverrides(
    {
      value: String(k.id),
      label: k.name,
      description: (
        <Info
          icon={Users}
          parts={[
            k.employeeId,
            k.rooms.length ? `Menjaga: ${k.rooms.map((r) => r.name).join(', ')}` : 'Belum menjaga ruangan',
          ]}
        />
      ),
      keywords: [k.employeeId, k.phoneNumber, ...k.rooms.map((r) => r.name)],
      disabled: !k.isActive,
      badge: !k.isActive ? { text: 'Nonaktif', tone: 'neutral' } : undefined,
    },
    ov,
  )

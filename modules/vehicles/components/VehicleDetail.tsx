'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Card, CardHeader, CardSection, CardDivider, AdminOnly } from '@/components/common'
import {
  AvailabilityCalendar,
  ResourceStatusBadge,
  SpdActiveBadge,
  PhotoUploader,
  AttachmentList,
  StatusChanger,
  Badge,
} from '@/components/shared'
import { AppButton, InputSelect } from '@/components/ui-custom'
import { formatOdometer } from '@/lib'
import { useAuthStore } from '@/store/auth.store'
import type { ResourceStatus, SelectOption } from '@/types'
import {
  useVehicle,
  useVehicleAttachments,
  useUpdateVehicleStatus,
  useUpdateVehiclePhoto,
  useUploadVehicleAttachment,
  useDeleteVehicle,
  useSetVehicleFixedDriver,
} from '../hooks/useVehicles'
import { useDeleteAttachment } from '@/hooks'
// Impor langsung dari file hook (bukan barrel) untuk menghindari siklus
// impor vehicles ⇄ drivers.
import { useDrivers } from '@/modules/drivers/hooks/useDrivers'

// ─────────────────────────────────────────
// VEHICLE DETAIL
// ─────────────────────────────────────────

interface VehicleDetailProps {
  vehicleId: number
}

export const VehicleDetail = ({ vehicleId }: VehicleDetailProps) => {
  const router = useRouter()
  const isAdmin = useAuthStore((s) => s.isAdmin())

  const { data: vehicle, isLoading } = useVehicle(vehicleId)
  const { data: attachments } = useVehicleAttachments(vehicleId)

  const updateStatus = useUpdateVehicleStatus()
  const updatePhoto = useUpdateVehiclePhoto()
  const uploadAttachment = useUploadVehicleAttachment(vehicleId)
  const deleteAttachment = useDeleteAttachment()
  const deleteVehicle = useDeleteVehicle()
  const setFixedDriver = useSetVehicleFixedDriver()
  const { data: drivers } = useDrivers({ limit: 100 })

  if (isLoading) {
    return (
      <p className="py-16 text-center text-sm text-[var(--text-secondary)]">
        Memuat data kendaraan…
      </p>
    )
  }

  if (!vehicle) {
    return (
      <p className="py-16 text-center text-sm text-[var(--text-secondary)]">
        Kendaraan tidak ditemukan.
      </p>
    )
  }

  const handleStatusChange = (status: ResourceStatus) =>
    updateStatus.mutate({ id: vehicle.id, payload: { status } })

  // Supir aktif yang belum punya kendaraan tetap lain (atau memang sudah
  // jadi supir tetap kendaraan ini) - selain itu tidak muncul di pilihan.
  const fixedDriverOptions: SelectOption[] = (drivers ?? [])
    .filter((d) => d.isActive && (!d.fixedVehicle || d.fixedVehicle.id === vehicle.id))
    .map((d) => ({ value: d.id, label: d.name }))

  const handleFixedDriverChange = (value: string) =>
    setFixedDriver.mutate({ id: vehicle.id, driverId: value ? Number(value) : null })

  const handleDelete = () => {
    if (!confirm(`Hapus kendaraan "${vehicle.name}"?`)) return
    deleteVehicle.mutate(vehicle.id, {
      onSuccess: () => router.push('/vehicles'),
    })
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
      {/* ── Kolom kiri (60%) ── */}
      <div className="space-y-6 lg:col-span-3">
        {/* Foto */}
        <PhotoUploader
          currentPhotoUrl={vehicle.photoUrl}
          canEdit={isAdmin}
          loading={updatePhoto.isPending}
          onUpload={(file) => updatePhoto.mutate({ id: vehicle.id, file })}
        />

        {/* Info */}
        <Card>
          <CardHeader title="Informasi Kendaraan" />
          <div className="grid grid-cols-2 gap-x-4 gap-y-5">
            <InfoItem label="Merek & Model" value={`${vehicle.brand} ${vehicle.model}`} />
            <InfoItem label="Tahun" value={String(vehicle.year)} />
            <InfoItem label="Plat Nomor" value={vehicle.plateNumber} />
            <InfoItem
              label="Kategori"
              value={<Badge variant="muted">{vehicle.category.name}</Badge>}
            />
            <InfoItem label="Kapasitas" value={`${vehicle.capacity} Penumpang`} />
            <InfoItem label="Odometer" value={formatOdometer(vehicle.currentOdometer)} />
          </div>
        </Card>

        {/* Kalender ketersediaan */}
        <Card>
          <AvailabilityCalendar resourceId={vehicle.resourceId} mode="view" />
        </Card>

        {/* Lampiran */}
        <Card>
          <CardHeader title="Lampiran" />
          <AttachmentList
            attachments={attachments ?? []}
            canEdit={isAdmin}
            uploadLoading={uploadAttachment.isPending}
            onUpload={(payload) => uploadAttachment.mutate(payload)}
            onDelete={(id) => deleteAttachment.mutate(id)}
          />
        </Card>
      </div>

      {/* ── Kolom kanan (40%) ── */}
      <div className="space-y-6 lg:col-span-2">
        {/* Status (admin) */}
        <AdminOnly>
          <Card>
            <CardHeader title="Ubah Status" />
            <StatusChanger
              currentStatus={vehicle.status}
              loading={updateStatus.isPending}
              onStatusChange={handleStatusChange}
            />
          </Card>
        </AdminOnly>

        {/* Supir tetap (admin) */}
        <AdminOnly>
          <Card>
            <CardHeader
              title="Supir Tetap"
              description="Kendaraan ini otomatis pakai supir ini saat dibooking - tidak ada pilihan supir lain"
            />
            <InputSelect
              placeholder="Tidak ada (bebas dipilih saat booking)"
              options={fixedDriverOptions}
              value={vehicle.fixedDriver?.id ?? ''}
              disabled={setFixedDriver.isPending}
              onChange={(e) => handleFixedDriverChange(e.target.value)}
            />
          </Card>
        </AdminOnly>

        {/* Aksi cepat */}
        <Card>
          <CardHeader title="Aksi" />
          <div className="space-y-3">
            <AppButton variant="primary" fullWidth asChild>
              <Link
                href={`/booking/new?resourceId=${vehicle.resourceId}&type=VEHICLE`}
              >
                Booking Kendaraan Ini
              </Link>
            </AppButton>

            <AdminOnly>
              <AppButton variant="secondary" fullWidth asChild>
                <Link href={`/vehicles/${vehicle.id}/edit`}>Edit Kendaraan</Link>
              </AppButton>
              <AppButton
                variant="secondary"
                fullWidth
                loading={deleteVehicle.isPending}
                onClick={handleDelete}
                className="border-[var(--danger)] text-[var(--danger)] hover:bg-red-50"
              >
                Hapus
              </AppButton>
            </AdminOnly>
          </div>
        </Card>

        {/* Info tambahan */}
        <Card>
          <CardHeader title="Informasi Tambahan" />
          <CardSection className="space-y-3">
            <InfoItem label="Resource ID" value={`#${vehicle.resourceId}`} />
            <CardDivider />
            <InfoItem
              label="Status Saat Ini"
              value={
                <div className="flex flex-wrap items-center gap-1.5">
                  <ResourceStatusBadge status={vehicle.status} />
                  {vehicle.isSpdActive && <SpdActiveBadge />}
                </div>
              }
            />
          </CardSection>
        </Card>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────
// INFO ITEM
// ─────────────────────────────────────────

const InfoItem = ({
  label,
  value,
}: {
  label: string
  value: React.ReactNode
}) => (
  <div>
    <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.07em] text-[var(--text-secondary)]">
      {label}
    </p>
    <div className="text-sm text-[var(--text-primary)]">{value}</div>
  </div>
)

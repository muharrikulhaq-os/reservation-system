'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Card, CardHeader, CardSection, CardDivider, AdminOnly } from '@/components/common'
import {
  AvailabilityCalendar,
  ResourceStatusBadge,
  PhotoUploader,
  AttachmentList,
  StatusChanger,
} from '@/components/shared'
import { AppButton } from '@/components/ui-custom'
import { useAuthStore } from '@/store/auth.store'
import type { ResourceStatus } from '@/types'
import {
  useRoom,
  useRoomAttachments,
  useUpdateRoomStatus,
  useUpdateRoomPhoto,
  useUploadRoomAttachment,
  useDeleteRoom,
} from '../hooks/useRooms'
import { useDeleteAttachment } from '@/hooks'

// ─────────────────────────────────────────
// ROOM DETAIL
// ─────────────────────────────────────────

interface RoomDetailProps {
  roomId: number
}

export const RoomDetail = ({ roomId }: RoomDetailProps) => {
  const router = useRouter()
  const isAdmin = useAuthStore((s) => s.isAdmin())

  const { data: room, isLoading } = useRoom(roomId)
  const { data: attachments } = useRoomAttachments(roomId)

  const updateStatus = useUpdateRoomStatus()
  const updatePhoto = useUpdateRoomPhoto()
  const uploadAttachment = useUploadRoomAttachment(roomId)
  const deleteAttachment = useDeleteAttachment()
  const deleteRoom = useDeleteRoom()

  if (isLoading) {
    return (
      <p className="py-16 text-center text-sm text-[var(--text-secondary)]">
        Memuat data ruangan…
      </p>
    )
  }

  if (!room) {
    return (
      <p className="py-16 text-center text-sm text-[var(--text-secondary)]">
        Ruangan tidak ditemukan.
      </p>
    )
  }

  const handleStatusChange = (status: ResourceStatus) =>
    updateStatus.mutate({ id: room.id, payload: { status } })

  const handleDelete = () => {
    if (!confirm(`Hapus ruangan "${room.name}"?`)) return
    deleteRoom.mutate(room.id, {
      onSuccess: () => router.push('/rooms'),
    })
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
      {/* ── Kolom kiri (60%) ── */}
      <div className="space-y-6 lg:col-span-3">
        {/* Foto */}
        <PhotoUploader
          currentPhotoUrl={room.photoUrl}
          canEdit={isAdmin}
          loading={updatePhoto.isPending}
          onUpload={(file) => updatePhoto.mutate({ id: room.id, file })}
        />

        {/* Info */}
        <Card>
          <CardHeader title="Informasi Ruangan" />
          <div className="grid grid-cols-2 gap-x-4 gap-y-5">
            <InfoItem label="Nama Ruangan" value={room.name} />
            <InfoItem label="Lokasi" value={room.location} />
            <InfoItem label="Kapasitas" value={`${room.capacity} Orang`} />
          </div>
        </Card>

        {/* Kalender ketersediaan */}
        <Card>
          <AvailabilityCalendar resourceId={room.resourceId} mode="view" />
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
              currentStatus={room.status}
              loading={updateStatus.isPending}
              onStatusChange={handleStatusChange}
            />
          </Card>
        </AdminOnly>

        {/* Aksi cepat */}
        <Card>
          <CardHeader title="Aksi" />
          <div className="space-y-3">
            <AppButton variant="primary" fullWidth asChild>
              <Link href={`/booking/new?resourceId=${room.resourceId}&type=ROOM`}>
                Booking Ruangan Ini
              </Link>
            </AppButton>

            <AdminOnly>
              <AppButton variant="secondary" fullWidth asChild>
                <Link href={`/rooms/${room.id}/edit`}>Edit Ruangan</Link>
              </AppButton>
              <AppButton
                variant="secondary"
                fullWidth
                loading={deleteRoom.isPending}
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
            <InfoItem label="Resource ID" value={`#${room.resourceId}`} />
            <CardDivider />
            <InfoItem
              label="Status Saat Ini"
              value={<ResourceStatusBadge status={room.status} />}
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

'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Card, CardHeader, CardSection, CardDivider, AdminOnly } from '@/components/common'
import {
  AvailabilityCalendar,
  ResourceStatusBadge,
  PhotoUploader,
  AttachmentList,
  StatusChanger,
} from '@/components/shared'
import { AppButton, InputSelect } from '@/components/ui-custom'
import { getErrorMessage } from '@/lib'
import { useAuthStore } from '@/store/auth.store'
import type { ResourceStatus, SelectOption } from '@/types'
import {
  useRoom,
  useRoomAttachments,
  useUpdateRoomStatus,
  useUpdateRoomPhoto,
  useUploadRoomAttachment,
  useDeleteRoom,
  useSetRoomKeeper,
} from '../hooks/useRooms'
import { useDeleteAttachment } from '@/hooks'
// Impor langsung dari file hook (bukan barrel) untuk menghindari siklus
// impor rooms ⇄ room-keepers.
import { useRoomKeepers } from '@/modules/room-keepers/hooks/useRoomKeepers'

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
  // isActive difilter di sisi FE, bukan lewat param query - endpoint
  // GET /room-keepers backend belum menerima filter isActive (sama seperti
  // GET /drivers), jadi cukup ambil semua lalu saring di sini.
  const { data: roomKeepers } = useRoomKeepers()

  const updateStatus = useUpdateRoomStatus()
  const updatePhoto = useUpdateRoomPhoto()
  const uploadAttachment = useUploadRoomAttachment(roomId)
  const deleteAttachment = useDeleteAttachment()
  const deleteRoom = useDeleteRoom()
  const setRoomKeeper = useSetRoomKeeper()

  // Pilihan room keeper - draft lokal, baru dikirim ke server saat tombol
  // "Simpan" ditekan (bukan langsung tersimpan begitu dropdown berubah).
  const [roomKeeperDraft, setRoomKeeperDraft] = useState<number | ''>('')
  useEffect(() => {
    setRoomKeeperDraft(room?.roomKeeper?.id ?? '')
  }, [room?.roomKeeper?.id])

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

  // Satu room keeper boleh bertanggung jawab atas lebih dari satu ruangan
  // (N:1) - jadi semua room keeper aktif muncul di pilihan, tidak difilter
  // seperti supir tetap kendaraan.
  const roomKeeperOptions: SelectOption[] = (roomKeepers ?? [])
    .filter((rk) => rk.isActive)
    .map((rk) => ({ value: rk.id, label: rk.name }))

  const roomKeeperDirty = roomKeeperDraft !== (room.roomKeeper?.id ?? '')

  const handleSaveRoomKeeper = () => {
    setRoomKeeper.mutate(
      { id: room.id, roomKeeperId: roomKeeperDraft ? Number(roomKeeperDraft) : null },
      {
        onSuccess: () => toast.success('Room keeper berhasil disimpan.'),
        onError: (err) => toast.error(getErrorMessage(err)),
      },
    )
  }

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

        {/* Room keeper (admin) */}
        <AdminOnly>
          <Card>
            <CardHeader
              title="Room Keeper"
              description="Penanggung jawab ruangan ini - satu room keeper boleh mengelola lebih dari satu ruangan. Rating dari pemesan masuk ke room keeper, bukan ruangannya."
            />
            <InputSelect
              placeholder="Belum ada room keeper"
              options={roomKeeperOptions}
              value={roomKeeperDraft}
              disabled={setRoomKeeper.isPending}
              onChange={(e) =>
                setRoomKeeperDraft(e.target.value ? Number(e.target.value) : '')
              }
            />
            <AppButton
              className="mt-3"
              size="sm"
              loading={setRoomKeeper.isPending}
              disabled={!roomKeeperDirty || setRoomKeeper.isPending}
              onClick={handleSaveRoomKeeper}
            >
              Simpan
            </AppButton>
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

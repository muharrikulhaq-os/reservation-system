'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { AlertTriangle, X } from 'lucide-react'
import { Card, CardHeader, CardSection, CardDivider, AdminOnly } from '@/components/common'
import {
  AvailabilityCalendar,
  ResourceStatusBadge,
  PhotoUploader,
  AttachmentList,
  StatusChanger,
  UserAvatar,
  roomKeeperOption,
} from '@/components/shared'
import { AppButton, SearchableSelect } from '@/components/ui-custom'
import { getErrorMessage } from '@/lib'
import { useAuthStore } from '@/store/auth.store'
import type { ResourceStatus } from '@/types'
import {
  useRoom,
  useRoomAttachments,
  useUpdateRoomStatus,
  useUpdateRoomPhoto,
  useUploadRoomAttachment,
  useDeleteRoom,
  useSetRoomKeepers,
} from '../hooks/useRooms'
import { useDeleteAttachment } from '@/hooks'
import { appConfirm } from '@/lib/dialog'
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
  const setRoomKeepers = useSetRoomKeepers()

  // Penjaga ruangan - draft lokal, baru dikirim ke server saat tombol
  // "Simpan" ditekan. Satu ruangan bisa dijaga beberapa orang.
  const savedKeeperIds = (room?.roomKeepers ?? []).map((k) => k.id)
  const savedKey = savedKeeperIds.join(',')
  const [keeperDraft, setKeeperDraft] = useState<number[]>([])
  useEffect(() => {
    setKeeperDraft(savedKey ? savedKey.split(',').map(Number) : [])
  }, [savedKey])

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

  // Satu penjaga boleh menjaga beberapa ruangan dan satu ruangan boleh
  // dijaga beberapa penjaga - pilihan hanya menyembunyikan yang sudah dipilih.
  const keeperById = new Map((roomKeepers ?? []).map((rk) => [rk.id, rk]))
  const roomKeeperOptions = (roomKeepers ?? [])
    .filter((rk) => !keeperDraft.includes(rk.id))
    .map((rk) => roomKeeperOption(rk))
  const draftKeepers = keeperDraft.map((id) => {
    const saved = room.roomKeepers.find((k) => k.id === id)
    const rk = keeperById.get(id)
    return { id, name: rk?.name ?? saved?.name ?? `#${id}`, isActive: rk?.isActive ?? saved?.isActive ?? true }
  })
  const draftHasActive = draftKeepers.some((k) => k.isActive)
  const keepersDirty = [...keeperDraft].sort().join(',') !== [...savedKeeperIds].sort().join(',')

  const handleSaveRoomKeepers = () => {
    setRoomKeepers.mutate(
      { id: room.id, roomKeeperIds: keeperDraft },
      {
        onSuccess: () => toast.success('Penjaga ruangan berhasil disimpan.'),
        onError: (err) => toast.error(getErrorMessage(err)),
      },
    )
  }

  const handleDelete = async () => {
    const ok = await appConfirm({
      title: 'Hapus ruangan?',
      description: `Ruangan "${room.name}" akan dihapus.`,
      tone: 'danger',
      confirmText: 'Ya, Hapus',
    })
    if (!ok) return
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

        {/* Penjaga ruangan */}
        <Card>
          <CardHeader
            title="Penjaga Ruangan"
            description={
              isAdmin
                ? 'Semua penjaga menerima booking, notifikasi, dan status yang sama, serta bisa dinilai pemesan. Ruangan tanpa penjaga aktif tidak bisa dibooking.'
                : 'Penanggung jawab ruangan ini.'
            }
          />
          {!room.hasActiveKeeper && (
            <div className="mb-3 flex items-start gap-2.5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>Ruangan ini belum bisa dibooking - pilih minimal satu penjaga aktif.</span>
            </div>
          )}
          {isAdmin ? (
            <>
              {draftKeepers.length > 0 && (
                <ul className="mb-3 space-y-2">
                  {draftKeepers.map((k) => (
                    <li
                      key={k.id}
                      className="flex items-center gap-2.5 rounded-lg border border-[var(--border-card)] bg-[var(--bg-subtle)] px-3 py-2"
                    >
                      <UserAvatar name={k.name} size="sm" />
                      <span className="min-w-0 flex-1 truncate text-sm font-medium text-[var(--text-primary)]">
                        {k.name}
                      </span>
                      {!k.isActive && (
                        <span className="rounded-full bg-[var(--bg-card)] px-2 py-0.5 text-[11px] font-semibold text-[var(--text-secondary)]">
                          Nonaktif
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => setKeeperDraft((d) => d.filter((id) => id !== k.id))}
                        disabled={setRoomKeepers.isPending}
                        className="rounded-full p-1 text-[var(--text-secondary)] hover:bg-red-50 hover:text-[var(--danger)]"
                        aria-label={`Hapus ${k.name}`}
                        title="Hapus dari ruangan ini"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
              <SearchableSelect
                placeholder="Tambah penjaga…"
                searchPlaceholder="Cari nama, NIP, atau ruangan yang dijaga…"
                emptyText="Penjaga ruangan tidak ditemukan"
                options={roomKeeperOptions}
                value=""
                disabled={setRoomKeepers.isPending}
                onChange={(v) => v && setKeeperDraft((d) => [...d, Number(v)])}
              />
              {keepersDirty && !draftHasActive && (
                <p className="mt-2 text-xs text-[var(--warning)]">
                  Tanpa penjaga aktif, ruangan ini tidak bisa dibooking. Booking yang sudah ada tetap berjalan.
                </p>
              )}
              <AppButton
                className="mt-3"
                size="sm"
                loading={setRoomKeepers.isPending}
                disabled={!keepersDirty || setRoomKeepers.isPending}
                onClick={handleSaveRoomKeepers}
              >
                Simpan
              </AppButton>
            </>
          ) : room.roomKeepers.length ? (
            <ul className="space-y-2">
              {room.roomKeepers.map((k) => (
                <li key={k.id} className="flex items-center gap-2.5">
                  <UserAvatar name={k.name} size="sm" />
                  <span className="truncate text-sm font-medium text-[var(--text-primary)]">{k.name}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-[var(--text-secondary)]">Belum ada penjaga.</p>
          )}
        </Card>

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

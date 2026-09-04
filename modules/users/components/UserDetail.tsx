'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { AlertCircle, KeyRound, MessageSquare, Star, Trash2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { Card, CardHeader, AdminOnly } from '@/components/common'
import { UserAvatar, Badge, BookingStatusBadge, BookingTypeBadge, StarRating } from '@/components/shared'
import { AppButton, InputText } from '@/components/ui-custom'
import { formatDate, formatDateTime, getErrorMessage, resolveFileUrl } from '@/lib'
import { ROLE, RESOURCE_TYPE } from '@/constants'
import type { RoleName } from '@/types'
import { useBookings, useRoomRatings } from '@/modules/booking'
// Impor langsung dari file hook (bukan barrel) untuk menghindari siklus impor.
import { useRoomKeepers, useRoomKeeper } from '@/modules/room-keepers/hooks/useRoomKeepers'
import {
  useUser,
  useToggleUserActive,
  useDeleteUser,
} from '../hooks/useUsers'
import { ResetPasswordModal } from './ResetPasswordModal'

// ─────────────────────────────────────────
// USER DETAIL
// ─────────────────────────────────────────

type BadgeVariant = 'default' | 'success' | 'warning' | 'info' | 'muted'

const ROLE_BADGE: Record<RoleName, BadgeVariant> = {
  [ROLE.ADMIN]:       'default',
  [ROLE.EMPLOYEE]:    'info',
  [ROLE.DRIVER]:      'success',
  [ROLE.ROOM_KEEPER]: 'warning',
}

interface UserDetailProps {
  userId: number
}

export const UserDetail = ({ userId }: UserDetailProps) => {
  const router = useRouter()
  const { data: user, isLoading } = useUser(userId)

  const toggle = useToggleUserActive()
  const remove = useDeleteUser()

  const [deleteOpen, setDeleteOpen] = useState(false)
  const [resetOpen, setResetOpen] = useState(false)
  const [confirmName, setConfirmName] = useState('')

  // Riwayat booking ringkas milik user ini
  const { data: bookings } = useBookings(
    user ? { userId: user.id, limit: 5 } : undefined,
    { enabled: !!user },
  )

  // Kalau user ini room keeper: cari ID room_keeper-nya dari daftar (tidak
  // ada endpoint by-userId), lalu ambil detail lengkapnya - baris daftar
  // tidak menyertakan "rooms" (cuma endpoint detail per-ID yang punya),
  // jadi tidak cukup dipakai langsung.
  const { data: roomKeepersList } = useRoomKeepers()
  const roomKeeperId = user
    ? roomKeepersList?.find((rk) => rk.userId === user.id)?.id
    : undefined
  const { data: roomKeeperRecord } = useRoomKeeper(roomKeeperId ?? 0)
  const { data: rkRatings, isLoading: rkRatingsLoading } = useRoomRatings(
    roomKeeperRecord?.id ?? 0,
  )

  if (isLoading) {
    return (
      <p className="py-16 text-center text-sm text-[var(--text-secondary)]">
        Memuat data pengguna…
      </p>
    )
  }

  if (!user) {
    return (
      <p className="py-16 text-center text-sm text-[var(--text-secondary)]">
        Pengguna tidak ditemukan.
      </p>
    )
  }

  const isDriver = user.role.name === ROLE.DRIVER
  const isRoomKeeper = user.role.name === ROLE.ROOM_KEEPER
  const bookingList = bookings?.data ?? []

  const handleDelete = () => {
    remove.mutate(user.id, {
      onSuccess: () => {
        setDeleteOpen(false)
        router.push('/users')
      },
    })
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
      {/* ── Kolom kiri (60%) ── */}
      <div className="space-y-6 lg:col-span-3">
        {/* Profil utama */}
        <Card>
          <div className="flex items-start gap-4">
            <UserAvatar
              name={user.name}
              photo={resolveFileUrl(user.profilePhoto)}
              size="lg"
            />
            <div className="min-w-0 flex-1">
              <h1
                className="truncate text-xl font-bold text-[var(--text-primary)]"
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
              >
                {user.name}
              </h1>
              <p className="truncate text-sm text-[var(--text-secondary)]">
                {user.email}
              </p>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <Badge variant="muted">{user.employeeId}</Badge>
                <Badge variant={ROLE_BADGE[user.role.name] ?? 'muted'}>
                  {user.role.name}
                </Badge>
              </div>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-x-4 gap-y-5 border-t border-[var(--border-divider)] pt-5">
            <InfoItem label="Departemen" value={user.department.name} />
            <InfoItem
              label="Status"
              value={
                <span className="inline-flex items-center gap-1.5 text-sm text-[var(--text-primary)]">
                  <span
                    className="h-1.5 w-1.5 shrink-0 rounded-full"
                    style={{
                      backgroundColor: user.isActive
                        ? 'var(--success)'
                        : 'var(--text-disabled)',
                    }}
                  />
                  {user.isActive ? 'Aktif' : 'Nonaktif'}
                </span>
              }
            />
            <InfoItem label="Bergabung" value={formatDate(user.createdAt)} />
          </div>
        </Card>

        {/* Riwayat booking */}
        <Card>
          <CardHeader title="Riwayat Booking" />
          {bookingList.length === 0 ? (
            <p className="py-4 text-center text-sm text-[var(--text-disabled)]">
              Belum ada booking.
            </p>
          ) : (
            <ul className="divide-y divide-[var(--border-divider)]">
              {bookingList.map((b) => (
                <li
                  key={b.id}
                  className="flex items-center justify-between gap-3 py-2.5 first:pt-0"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-[var(--text-primary)]">
                      {b.resource.name}
                    </p>
                    <p className="text-xs text-[var(--text-secondary)]">
                      {formatDate(b.startDate)}
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1">
                    <BookingStatusBadge status={b.status} />
                    {b.resource.type === RESOURCE_TYPE.VEHICLE && (
                      <BookingTypeBadge bookingType={b.bookingType} status={b.status} />
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
          <div className="mt-4">
            <AppButton variant="link" size="sm" asChild>
              <Link href={`/booking?userId=${user.id}`}>Lihat semua booking</Link>
            </AppButton>
          </div>
        </Card>
      </div>

      {/* ── Kolom kanan (40%) ── */}
      <div className="space-y-6 lg:col-span-2">
        {/* Aksi admin */}
        <AdminOnly>
          <Card>
            <CardHeader title="Aksi" />
            <div className="space-y-4">
              <AppButton variant="secondary" fullWidth asChild>
                <Link href={`/users/${user.id}/edit`}>Edit Pengguna</Link>
              </AppButton>

              <Separator className="bg-[var(--border-divider)]" />

              {/* Toggle aktif */}
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-[var(--text-primary)]">
                    Status Akun
                  </p>
                  <p className="text-xs text-[var(--text-secondary)]">
                    {user.isActive
                      ? 'Akun aktif, dapat login'
                      : 'Akun nonaktif, tidak dapat login'}
                  </p>
                </div>
                <Switch
                  checked={user.isActive}
                  onCheckedChange={() => toggle.mutate(user.id)}
                  disabled={toggle.isPending}
                />
              </div>

              <Separator className="bg-[var(--border-divider)]" />

              {/* Reset password - langsung, tanpa OTP (hak admin) */}
              <div>
                <AppButton
                  variant="secondary"
                  fullWidth
                  leftIcon={<KeyRound className="h-4 w-4" />}
                  onClick={() => setResetOpen(true)}
                >
                  Reset Password
                </AppButton>
                <p className="mt-1.5 text-xs text-[var(--text-secondary)]">
                  Setel password baru tanpa verifikasi OTP.
                </p>
              </div>

              <Separator className="bg-[var(--border-divider)]" />

              {/* Hapus */}
              <AppButton
                variant="secondary"
                fullWidth
                leftIcon={<Trash2 className="h-4 w-4" />}
                className="border-[var(--danger)] text-[var(--danger)] hover:bg-red-50"
                onClick={() => {
                  setConfirmName('')
                  setDeleteOpen(true)
                }}
              >
                Hapus Pengguna
              </AppButton>
            </div>
          </Card>
        </AdminOnly>

        {/* Info role-specific */}
        {isDriver && (
          <Card>
            <CardHeader title="Informasi Driver" />
            <div className="flex items-center justify-between gap-3">
              <Badge variant="success">Driver</Badge>
              <AppButton variant="link" size="sm" asChild>
                <Link href="/drivers">Lihat data driver</Link>
              </AppButton>
            </div>
          </Card>
        )}

        {isRoomKeeper && roomKeeperRecord && (
          <Card>
            <CardHeader title="Informasi Room Keeper" />

            {/* Ruangan yang dikelola */}
            <div className="mb-4">
              <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-[0.07em] text-[var(--text-secondary)]">
                Ruangan Dikelola
              </p>
              {roomKeeperRecord.rooms.length === 0 ? (
                <p className="text-sm text-[var(--text-disabled)]">
                  Belum ada ruangan yang ditugaskan.
                </p>
              ) : (
                <div className="flex flex-wrap gap-1.5">
                  {roomKeeperRecord.rooms.map((rm) => (
                    <span
                      key={rm.id}
                      className="rounded-full bg-[var(--bg-subtle)] px-2.5 py-0.5 text-xs font-medium text-[var(--text-primary)]"
                    >
                      {rm.name}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Ringkasan rating - rating dari pemesan ruangan masuk ke sini,
                bukan ke ruangannya. */}
            <div className="flex items-center gap-3 rounded-xl border border-[var(--border-card)] bg-[var(--bg-subtle)] px-4 py-3">
              <Star className="h-5 w-5 fill-[#F59E0B] text-[#F59E0B]" />
              <div>
                <p className="text-lg font-bold leading-none text-[var(--text-primary)]">
                  {rkRatings?.averageRating != null
                    ? rkRatings.averageRating.toFixed(1)
                    : '-'}
                </p>
                <p className="mt-1 text-xs text-[var(--text-secondary)]">
                  {rkRatings?.totalRatings ?? 0} ulasan
                </p>
              </div>
            </div>

            {/* Daftar ulasan */}
            <div className="mt-4">
              <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.06em] text-[var(--text-secondary)]">
                <MessageSquare className="h-3.5 w-3.5" /> Ulasan
              </p>
              {rkRatingsLoading ? (
                <p className="py-4 text-center text-sm text-[var(--text-disabled)]">
                  Memuat…
                </p>
              ) : (rkRatings?.ratings.length ?? 0) === 0 ? (
                <p className="rounded-xl border border-dashed border-[var(--border-card)] bg-[var(--bg-subtle)] px-4 py-6 text-center text-sm text-[var(--text-disabled)]">
                  Belum ada ulasan.
                </p>
              ) : (
                <ul className="space-y-3">
                  {rkRatings!.ratings.map((r) => (
                    <li key={r.id} className="rounded-xl border border-[var(--border-card)] p-3">
                      <div className="flex items-center justify-between gap-2">
                        <StarRating value={r.rating} />
                        <span className="text-xs text-[var(--text-disabled)]">
                          {formatDateTime(r.createdAt)}
                        </span>
                      </div>
                      <p className="mt-1.5 text-xs font-medium text-[var(--text-secondary)]">
                        {r.ratedBy?.name ?? 'Anonim'}
                      </p>
                      {r.review && (
                        <p className="mt-1 text-sm text-[var(--text-primary)]">“{r.review}”</p>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </Card>
        )}
      </div>

      {/* ── Reset password (admin, tanpa OTP) ── */}
      <ResetPasswordModal
        userId={user.id}
        userName={user.name}
        open={resetOpen}
        onOpenChange={setResetOpen}
      />

      {/* ── Dialog hapus (ketik nama untuk konfirmasi) ── */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="rounded-2xl p-6 shadow-[var(--shadow-modal)] sm:max-w-md">
          <DialogHeader>
            <DialogTitle
              className="text-lg font-bold text-[var(--text-primary)]"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            >
              Hapus {user.name}?
            </DialogTitle>
          </DialogHeader>

          <div className="mt-2 space-y-4">
            <p className="text-sm text-[var(--text-secondary)]">
              Tindakan ini tidak dapat dibatalkan. Semua data terkait akan dihapus.
            </p>

            {remove.error && (
              <div className="flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{getErrorMessage(remove.error)}</span>
              </div>
            )}

            <InputText
              label={`Ketik "${user.name}" untuk konfirmasi`}
              placeholder={user.name}
              value={confirmName}
              onChange={(e) => setConfirmName(e.target.value)}
            />

            <div className="flex gap-3 pt-1">
              <AppButton
                variant="secondary"
                fullWidth
                disabled={remove.isPending}
                onClick={() => setDeleteOpen(false)}
              >
                Batal
              </AppButton>
              <AppButton
                variant="danger"
                fullWidth
                loading={remove.isPending}
                disabled={remove.isPending || confirmName !== user.name}
                onClick={handleDelete}
              >
                Hapus Permanen
              </AppButton>
            </div>
          </div>
        </DialogContent>
      </Dialog>
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

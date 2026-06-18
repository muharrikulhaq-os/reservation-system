'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { AlertCircle, Trash2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { Card, CardHeader, AdminOnly } from '@/components/common'
import { UserAvatar, Badge, BookingStatusBadge } from '@/components/shared'
import { AppButton, InputText } from '@/components/ui-custom'
import { formatDate, getErrorMessage, resolveFileUrl } from '@/lib'
import { ROLE } from '@/constants'
import type { RoleName } from '@/types'
import { useBookings } from '@/modules/booking'
import {
  useUser,
  useToggleUserActive,
  useDeleteUser,
} from '../hooks/useUsers'

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
  const [confirmName, setConfirmName] = useState('')

  // Riwayat booking ringkas milik user ini
  const { data: bookings } = useBookings(
    user ? { userId: user.id, limit: 5 } : undefined,
    { enabled: !!user },
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
                  <BookingStatusBadge status={b.status} />
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
      </div>

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

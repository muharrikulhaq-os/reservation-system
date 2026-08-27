'use client'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { UserAvatar } from '../avatar/Avatar'
import { Badge } from '../badge/StatusBadge'
import { resolveFileUrl, formatDate } from '@/lib'
import { ROLE } from '@/constants'
// Impor langsung dari file hook (bukan barrel @/modules/users) - hindari
// modules/users menarik balik komponen yang mungkin belum tentu aman
// dipakai lintas modul, sama seperti pola di DriverDetailModal.tsx.
import { useUser } from '@/modules/users/hooks/useUsers'
import type { RoleName } from '@/types'

// ─────────────────────────────────────────
// USER PROFILE MODAL
// Preview ringkas & read-only profil pengguna lain (nama, foto, role,
// departemen, kontak) - dipicu dari mana pun nama/avatar user ditampilkan
// di seluruh app (lihat <UserProfileButton/>). BUKAN halaman kelola user
// admin (itu tetap di /users/:id, dengan aksi edit/hapus/reset password).
// ─────────────────────────────────────────

type BadgeVariant = 'default' | 'success' | 'warning' | 'info' | 'muted'

const ROLE_BADGE: Record<RoleName, BadgeVariant> = {
  [ROLE.ADMIN]: 'default',
  [ROLE.EMPLOYEE]: 'info',
  [ROLE.DRIVER]: 'success',
  [ROLE.ROOM_KEEPER]: 'warning',
}

const Row = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <div className="flex items-start justify-between gap-4 py-2">
    <span className="text-xs font-semibold uppercase tracking-[0.06em] text-[var(--text-secondary)]">
      {label}
    </span>
    <span className="text-right text-sm text-[var(--text-primary)]">{value}</span>
  </div>
)

interface UserProfileModalProps {
  userId: number
  open: boolean
  onOpenChange: (open: boolean) => void
}

export const UserProfileModal = ({ userId, open, onOpenChange }: UserProfileModalProps) => {
  // enabled: open - jangan fetch sampai modal benar-benar dibuka (banyak
  // baris tabel bisa punya tombol ini sekaligus).
  const { data: user, isLoading } = useUser(userId, { enabled: open })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-2xl p-6 shadow-[var(--shadow-modal)] sm:max-w-md">
        <DialogHeader>
          <DialogTitle
            className="text-lg font-bold text-[var(--text-primary)]"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            Profil Pengguna
          </DialogTitle>
        </DialogHeader>

        {isLoading || !user ? (
          <p className="py-10 text-center text-sm text-[var(--text-disabled)]">Memuat…</p>
        ) : (
          <div className="mt-2">
            <div className="mb-2 flex items-center gap-3">
              <UserAvatar name={user.name} photo={resolveFileUrl(user.profilePhoto)} size="md" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-base font-semibold text-[var(--text-primary)]">
                  {user.name}
                </p>
                <p className="truncate text-xs text-[var(--text-secondary)]">
                  {user.employeeId} · {user.email}
                </p>
              </div>
              <div className="ml-auto shrink-0">
                <Badge variant={ROLE_BADGE[user.role.name] ?? 'muted'}>{user.role.name}</Badge>
              </div>
            </div>

            <div className="divide-y divide-[var(--border-divider)]">
              <Row label="Departemen" value={user.department.name} />
              {user.phoneNumber && <Row label="Telepon" value={user.phoneNumber} />}
              {user.licenseNumber && <Row label="No. SIM" value={user.licenseNumber} />}
              <Row
                label="Status"
                value={
                  <span className="inline-flex items-center gap-1.5">
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
              <Row label="Bergabung" value={formatDate(user.createdAt)} />
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

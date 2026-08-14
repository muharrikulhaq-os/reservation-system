'use client'

import Link from 'next/link'
import { ExternalLink, Power } from 'lucide-react'
import { UserAvatar } from '@/components/shared/avatar/Avatar'
import { Badge } from '@/components/shared/badge/StatusBadge'
import { createColumnHelper, type ColumnDef } from '@/components/shared/table/DataTable'
import { AppButton } from '@/components/ui-custom'
import { AdminOnly } from '@/components/common'
import { formatDate, resolveFileUrl } from '@/lib'
import { ROLE } from '@/constants'
import type { User, RoleName } from '@/types'

// ─────────────────────────────────────────
// USER COLUMNS
// Factory - terima handler toggle agar baris
// bisa memicu dialog konfirmasi di halaman list.
// ─────────────────────────────────────────

type BadgeVariant = 'default' | 'success' | 'warning' | 'info' | 'muted'

const ROLE_BADGE: Record<RoleName, BadgeVariant> = {
  [ROLE.ADMIN]:       'default',
  [ROLE.EMPLOYEE]:    'info',
  [ROLE.DRIVER]:      'success',
  [ROLE.ROOM_KEEPER]: 'warning',
}

interface UserColumnHandlers {
  onToggleActive: (user: User) => void
}

const ch = createColumnHelper<User>()

export const userColumns = ({
  onToggleActive,
}: UserColumnHandlers): ColumnDef<User, unknown>[] =>
  [
    ch.accessor('name', {
      header: 'Pengguna',
      size: 260,
      cell: ({ row }) => (
        <div className="flex items-center gap-2.5">
          <UserAvatar
            name={row.original.name}
            photo={resolveFileUrl(row.original.profilePhoto)}
            size="sm"
          />
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-[var(--text-primary)]">
              {row.original.name}
            </span>
            <span className="text-xs text-[var(--text-secondary)]">
              {row.original.employeeId}
            </span>
          </div>
        </div>
      ),
    }),

    ch.accessor('email', {
      header: 'Email',
      size: 220,
      enableSorting: false,
      cell: ({ getValue }) => (
        <span className="block max-w-[200px] truncate text-sm text-[var(--text-secondary)]">
          {getValue()}
        </span>
      ),
    }),

    ch.accessor((row) => row.department.name, {
      id: 'department',
      header: 'Departemen',
      size: 160,
      enableSorting: false,
      cell: ({ getValue }) => (
        <span className="text-sm text-[var(--text-secondary)]">
          {getValue() as string}
        </span>
      ),
    }),

    ch.accessor((row) => row.role.name, {
      id: 'role',
      header: 'Role',
      size: 120,
      enableSorting: false,
      cell: ({ getValue }) => {
        const role = getValue() as RoleName
        return <Badge variant={ROLE_BADGE[role] ?? 'muted'}>{role}</Badge>
      },
    }),

    ch.accessor('isActive', {
      header: 'Status',
      size: 120,
      enableSorting: false,
      cell: ({ getValue }) => {
        const active = getValue()
        return (
          <span className="inline-flex items-center gap-1.5 text-sm text-[var(--text-primary)]">
            <span
              className="h-1.5 w-1.5 shrink-0 rounded-full"
              style={{ backgroundColor: active ? 'var(--success)' : 'var(--text-disabled)' }}
            />
            {active ? 'Aktif' : 'Nonaktif'}
          </span>
        )
      },
    }),

    ch.accessor('createdAt', {
      header: 'Bergabung',
      size: 130,
      cell: ({ getValue }) => (
        <span className="text-sm text-[var(--text-secondary)]">
          {formatDate(getValue())}
        </span>
      ),
    }),

    ch.display({
      id: 'actions',
      header: '',
      size: 130,
      cell: ({ row }) => (
        <div className="flex items-center justify-end gap-1">
          <AppButton variant="link" size="sm" asChild>
            <Link href={`/users/${row.original.id}`}>
              <ExternalLink className="h-3.5 w-3.5" /> Detail
            </Link>
          </AppButton>
          <AdminOnly>
            <AppButton
              variant="ghost"
              size="icon-sm"
              aria-label={row.original.isActive ? 'Nonaktifkan' : 'Aktifkan'}
              onClick={() => onToggleActive(row.original)}
              className={
                row.original.isActive
                  ? 'text-[var(--danger)] hover:bg-red-50'
                  : 'text-[var(--success)] hover:bg-green-50'
              }
            >
              <Power className="h-4 w-4" />
            </AppButton>
          </AdminOnly>
        </div>
      ),
    }),
  ] as ColumnDef<User, unknown>[]

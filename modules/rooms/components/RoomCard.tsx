'use client'

import Link from 'next/link'
import { Building2, MapPin, Users } from 'lucide-react'
import { AdminOnly } from '@/components/common'
import { ResourceStatusBadge } from '@/components/shared'
import { AppButton } from '@/components/ui-custom'
import { resolveFileUrl } from '@/lib'
import type { Room } from '@/types'

// ─────────────────────────────────────────
// ROOM CARD
// Mode kartu katalog ruangan — memuat
// seluruh info yang ada di mode baris,
// dengan foto sebagai fokus utama.
// ─────────────────────────────────────────

export const RoomCard = ({ room }: { room: Room }) => {
  const photo = resolveFileUrl(room.photoUrl)

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-[var(--border-card)] bg-[var(--bg-card)] p-3 shadow-[0_1px_4px_rgba(0,0,0,0.06)] transition-all duration-150 hover:shadow-[0_4px_16px_rgba(0,0,0,0.10)]">

      {/* Foto */}
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-[var(--bg-subtle)]">
        {photo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={photo}
            alt={room.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-[var(--text-disabled)]">
            <Building2 className="h-10 w-10" />
          </div>
        )}

        <div className="absolute left-2.5 top-2.5">
          <ResourceStatusBadge status={room.status} />
        </div>
      </div>

      {/* Info */}
      <div className="flex flex-1 flex-col px-2 pb-1 pt-4">
        <h3
          className="truncate text-base font-bold text-[var(--text-primary)]"
          style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          title={room.name}
        >
          {room.name}
        </h3>

        <p className="mt-1 inline-flex items-center gap-1.5 truncate text-sm text-[var(--text-secondary)]">
          <MapPin className="h-3.5 w-3.5 shrink-0 text-[var(--text-disabled)]" />
          {room.location}
        </p>

        {/* Meta */}
        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-[var(--text-secondary)]">
          <span className="inline-flex items-center gap-1.5">
            <Users className="h-3.5 w-3.5 text-[var(--text-disabled)]" />
            {room.capacity} Orang
          </span>
        </div>

        {/* Aksi */}
        <div className="mt-auto flex items-center gap-2 border-t border-[var(--border-divider)] pt-3 [&>*]:flex-1">
          <Link href={`/rooms/${room.id}`}>
            <AppButton variant="secondary" size="sm" fullWidth>
              Detail
            </AppButton>
          </Link>
          <AdminOnly>
            <Link href={`/rooms/${room.id}/edit`}>
              <AppButton variant="ghost" size="sm" fullWidth>
                Edit
              </AppButton>
            </Link>
          </AdminOnly>
        </div>
      </div>
    </div>
  )
}

'use client'

import { PageHeader } from '@/components/shared'
import { Card } from '@/components/common'
import { Skeleton } from '@/components/ui/skeleton'
import { RoomForm } from './RoomForm'
import { useRoom } from '../hooks/useRooms'

// Skeleton form saat data dimuat
const EditSkeleton = () => (
  <Card>
    <Skeleton className="h-5 w-40 rounded-md bg-[var(--bg-subtle)]" />
    <div className="mt-6 space-y-5">
      {Array.from({ length: 3 }).map((_, i) => (
        <Skeleton key={i} className="h-10 w-full rounded-lg bg-[var(--bg-subtle)]" />
      ))}
    </div>
  </Card>
)

// ─────────────────────────────────────────
// ROOM EDIT
// ─────────────────────────────────────────

interface RoomEditProps {
  roomId: number
}

export const RoomEdit = ({ roomId }: RoomEditProps) => {
  const { data: room, isLoading } = useRoom(roomId)

  return (
    <div className="space-y-6">
      <PageHeader
        title="Edit Ruangan"
        description="Perbarui informasi ruangan"
        backHref={`/rooms/${roomId}`}
      />

      {isLoading ? (
        <EditSkeleton />
      ) : !room ? (
        <p className="py-16 text-center text-sm text-[var(--text-secondary)]">
          Ruangan tidak ditemukan.
        </p>
      ) : (
        <RoomForm initialData={room} />
      )}
    </div>
  )
}

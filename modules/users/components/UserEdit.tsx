'use client'

import { PageHeader } from '@/components/shared'
import { Card } from '@/components/common'
import { Skeleton } from '@/components/ui/skeleton'
import { UserForm } from './UserForm'
import { useUser } from '../hooks/useUsers'

// Skeleton form saat data dimuat
const EditSkeleton = () => (
  <Card>
    <Skeleton className="h-5 w-40 rounded-md bg-[var(--bg-subtle)]" />
    <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2">
      {Array.from({ length: 6 }).map((_, i) => (
        <Skeleton key={i} className="h-10 w-full rounded-lg bg-[var(--bg-subtle)]" />
      ))}
    </div>
  </Card>
)

// ─────────────────────────────────────────
// USER EDIT
// ─────────────────────────────────────────

interface UserEditProps {
  userId: number
}

export const UserEdit = ({ userId }: UserEditProps) => {
  const { data: user, isLoading } = useUser(userId)

  return (
    <div className="space-y-6">
      <PageHeader
        title="Edit Pengguna"
        description="Perbarui informasi pengguna"
        backHref={`/users/${userId}`}
      />

      {isLoading ? (
        <EditSkeleton />
      ) : !user ? (
        <p className="py-16 text-center text-sm text-[var(--text-secondary)]">
          Pengguna tidak ditemukan.
        </p>
      ) : (
        <UserForm initialData={user} />
      )}
    </div>
  )
}

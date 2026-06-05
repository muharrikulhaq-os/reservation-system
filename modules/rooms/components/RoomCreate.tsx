'use client'

import { PageHeader } from '@/components/shared'
import { RoomForm } from './RoomForm'

// ─────────────────────────────────────────
// ROOM CREATE
// ─────────────────────────────────────────

export const RoomCreate = () => (
  <div className="space-y-6">
    <PageHeader
      title="Tambah Ruangan"
      description="Daftarkan ruangan baru ke dalam sistem"
      backHref="/rooms"
    />
    <RoomForm />
  </div>
)

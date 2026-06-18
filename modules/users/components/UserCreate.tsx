'use client'

import { PageHeader } from '@/components/shared'
import { UserForm } from './UserForm'

// ─────────────────────────────────────────
// USER CREATE
// ─────────────────────────────────────────

export const UserCreate = () => (
  <div className="space-y-6">
    <PageHeader
      title="Tambah Pengguna"
      description="Daftarkan pengguna baru ke dalam sistem"
      backHref="/users"
    />
    <UserForm />
  </div>
)

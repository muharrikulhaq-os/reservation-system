'use client'

import { PageHeader } from '@/components/shared'
import { VehicleForm } from './VehicleForm'

// ─────────────────────────────────────────
// VEHICLE CREATE
// ─────────────────────────────────────────

export const VehicleCreate = () => (
  <div className="space-y-6">
    <PageHeader
      title="Tambah Kendaraan"
      description="Daftarkan kendaraan baru ke dalam sistem"
      backHref="/vehicles"
    />
    <VehicleForm />
  </div>
)

'use client'

import { PageHeader } from '@/components/shared'
import { Card } from '@/components/common'
import { Skeleton } from '@/components/ui/skeleton'
import { VehicleForm } from './VehicleForm'
import { useVehicle } from '../hooks/useVehicles'

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
// VEHICLE EDIT
// ─────────────────────────────────────────

interface VehicleEditProps {
  vehicleId: number
}

export const VehicleEdit = ({ vehicleId }: VehicleEditProps) => {
  const { data: vehicle, isLoading } = useVehicle(vehicleId)

  return (
    <div className="space-y-6">
      <PageHeader
        title="Edit Kendaraan"
        description="Perbarui informasi kendaraan"
        backHref={`/vehicles/${vehicleId}`}
      />

      {isLoading ? (
        <EditSkeleton />
      ) : !vehicle ? (
        <p className="py-16 text-center text-sm text-[var(--text-secondary)]">
          Kendaraan tidak ditemukan.
        </p>
      ) : (
        <VehicleForm initialData={vehicle} />
      )}
    </div>
  )
}

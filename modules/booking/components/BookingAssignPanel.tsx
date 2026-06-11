'use client'

import { useState } from 'react'
import { AlertCircle } from 'lucide-react'
import { Card } from '@/components/common'
import { AppButton, InputSelect } from '@/components/ui-custom'
import { getErrorMessage } from '@/lib'
import { BOOKING_STATUS, RESOURCE_STATUS, RESOURCE_TYPE } from '@/constants'
import type { Booking, SelectOption } from '@/types'
import { useDrivers } from '@/modules/drivers/hooks/useDrivers'
import { useVehicles } from '@/modules/vehicles/hooks/useVehicles'
import { useAssignVehicle } from '../hooks/useBookings'

// ─────────────────────────────────────────
// BOOKING ASSIGN PANEL (admin, APPROVED + VEHICLE + belum ada driver)
// Assign driver + kendaraan. Merge dipindahkan ke BookingMergePanel.
// ─────────────────────────────────────────

interface Props {
  booking: Booking
  onActionComplete?: () => void
}

export const BookingAssignPanel = ({ booking, onActionComplete }: Props) => {
  const [driverId, setDriverId] = useState('')
  const [vehicleId, setVehicleId] = useState('')

  const assign = useAssignVehicle()

  const { data: drivers } = useDrivers({ limit: 100 })
  const { data: vehicles } = useVehicles({ status: RESOURCE_STATUS.AVAILABLE, limit: 100 })

  const driverOptions: SelectOption[] = (drivers ?? [])
    .filter((d) => d.isActive)
    .map((d) => ({ value: d.id, label: d.name }))
  const vehicleOptions: SelectOption[] = (vehicles ?? []).map((v) => ({
    value: v.id,
    label: `${v.name} (${v.plateNumber})`,
  }))

  const canAssign = !!driverId && !!vehicleId

  const handleAssign = () => {
    assign.mutate(
      { id: booking.id, payload: { driverId: Number(driverId), vehicleId: Number(vehicleId) } },
      { onSuccess: () => onActionComplete?.() },
    )
  }

  if (
    booking.status !== BOOKING_STATUS.APPROVED ||
    booking.resource.type !== RESOURCE_TYPE.VEHICLE ||
    booking.assignedDriver
  ) {
    return null
  }

  return (
    <Card>
      <h3
        className="mb-4 text-base font-bold text-[var(--text-primary)]"
        style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
      >
        Tugaskan Driver & Kendaraan
      </h3>

      {assign.error && (
        <div className="mb-4 flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{getErrorMessage(assign.error)}</span>
        </div>
      )}

      <div className="space-y-3">
        <InputSelect
          label="Pilih Driver"
          required
          placeholder="Pilih driver"
          options={driverOptions}
          value={driverId}
          onChange={(e) => setDriverId(e.target.value)}
        />
        <InputSelect
          label="Pilih Kendaraan"
          required
          placeholder="Pilih kendaraan"
          options={vehicleOptions}
          value={vehicleId}
          onChange={(e) => setVehicleId(e.target.value)}
        />
        <AppButton
          fullWidth
          loading={assign.isPending}
          disabled={!canAssign || assign.isPending}
          onClick={handleAssign}
        >
          Tugaskan
        </AppButton>
      </div>
    </Card>
  )
}

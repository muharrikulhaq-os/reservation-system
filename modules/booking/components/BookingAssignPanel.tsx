'use client'

import { useState } from 'react'
import { AlertCircle } from 'lucide-react'
import { Card } from '@/components/common'
import { AppButton } from '@/components/ui-custom'
import { getErrorMessage } from '@/lib'
import { BOOKING_STATUS, RESOURCE_TYPE } from '@/constants'
import type { Booking } from '@/types'
import { useAssignVehicle } from '../hooks/useBookings'
import { DriverVehiclePicker } from './DriverVehiclePicker'

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
        <DriverVehiclePicker
          bookingId={booking.id}
          driverId={driverId}
          vehicleId={vehicleId}
          onDriverChange={setDriverId}
          onVehicleChange={setVehicleId}
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

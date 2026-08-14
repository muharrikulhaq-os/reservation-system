'use client'

import { useState } from 'react'
import { AlertCircle, ArrowRightLeft, Car, Check, DoorOpen, X } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import { Card, CardSection } from '@/components/common'
import { AppButton, InputSelect, InputTextArea } from '@/components/ui-custom'
import { getErrorMessage } from '@/lib'
import { BOOKING_STATUS, RESOURCE_STATUS, RESOURCE_TYPE } from '@/constants'
import type { Booking, SelectOption } from '@/types'
import { useDrivers } from '@/modules/drivers/hooks/useDrivers'
import { useVehicles } from '@/modules/vehicles/hooks/useVehicles'
import { useRooms } from '@/modules/rooms/hooks/useRooms'
import {
  useApproveBooking,
  useRejectBooking,
  useSubstituteResource,
  useAssignVehicle,
} from '../hooks/useBookings'

// ─────────────────────────────────────────
// BOOKING APPROVAL PANEL (admin, status PENDING)
// Aksi: Setujui · Alihkan & Setujui · Tolak
// - VEHICLE: Alihkan = ganti Driver + Kendaraan (approve lalu assign-vehicle)
// - ROOM:    Alihkan = ganti resource (substitute lalu approve)
// ─────────────────────────────────────────

interface Props {
  booking: Booking
  onActionComplete?: () => void
}

export const BookingApprovalPanel = ({ booking, onActionComplete }: Props) => {
  const isVehicle = booking.resource.type === RESOURCE_TYPE.VEHICLE
  const ResourceIcon = isVehicle ? Car : DoorOpen

  const [substituteOpen, setSubstituteOpen] = useState(false)
  const [approveNote, setApproveNote] = useState('')
  const [rejectNote, setRejectNote] = useState('')
  const [reason, setReason] = useState('')
  // ROOM: resource pengganti
  const [substituteId, setSubstituteId] = useState('')
  // VEHICLE: driver + kendaraan pengganti
  const [alihkanDriverId, setAlihkanDriverId] = useState('')
  const [alihkanVehicleId, setAlihkanVehicleId] = useState('')

  const approve = useApproveBooking()
  const reject = useRejectBooking()
  const substitute = useSubstituteResource()
  const assign = useAssignVehicle()

  const { data: drivers } = useDrivers({ limit: 100 })
  const { data: vehicles } = useVehicles({ status: RESOURCE_STATUS.AVAILABLE, limit: 100 })
  const { data: rooms } = useRooms({ status: RESOURCE_STATUS.AVAILABLE, limit: 100 })

  // ROOM: resource pengganti (value = resourceId, exclude resource saat ini)
  const roomOptions: SelectOption[] = (rooms ?? [])
    .map((r) => ({ value: r.resourceId, label: r.name }))
    .filter((opt) => opt.value !== booking.resource.id)

  // VEHICLE: opsi driver + kendaraan (value = id entitas, bukan resourceId)
  const driverOptions: SelectOption[] = (drivers ?? [])
    .filter((d) => d.isActive)
    .map((d) => ({ value: d.id, label: d.name }))
  const vehicleOptions: SelectOption[] = (vehicles ?? []).map((v) => ({
    value: v.id,
    label: `${v.name} (${v.plateNumber})`,
  }))

  const error = approve.error || reject.error || substitute.error || assign.error
  const isBusy =
    approve.isPending || reject.isPending || substitute.isPending || assign.isPending

  if (booking.status !== BOOKING_STATUS.PENDING) return null

  // Approve biasa: cukup klik "Setujui" - driver + kendaraan yang sudah
  // ter-attach saat create tetap dipakai (booking siap digunakan).
  const handleApprove = () => {
    approve.mutate(
      {
        id: booking.id,
        payload: approveNote.trim() ? { note: approveNote.trim() } : undefined,
      },
      { onSuccess: () => onActionComplete?.() },
    )
  }

  const openAlihkan = () => {
    setReason('')
    setSubstituteId('')
    // Pre-fill dengan driver/kendaraan saat ini (jika ada)
    setAlihkanDriverId(booking.assignedDriver ? String(booking.assignedDriver.id) : '')
    setAlihkanVehicleId(booking.assignedVehicle ? String(booking.assignedVehicle.id) : '')
    setSubstituteOpen(true)
  }

  // Alihkan & Setujui - kondisional per tipe resource.
  const handleAlihkanApprove = async () => {
    try {
      const note = reason.trim() || undefined
      if (isVehicle) {
        // approve dulu (assign-vehicle butuh status APPROVED), lalu ganti driver+kendaraan
        await approve.mutateAsync({ id: booking.id, payload: note ? { note } : undefined })
        await assign.mutateAsync({
          id: booking.id,
          payload: {
            driverId: Number(alihkanDriverId),
            vehicleId: Number(alihkanVehicleId),
          },
        })
      } else {
        // ROOM: ganti resource lalu approve
        await substitute.mutateAsync({
          id: booking.id,
          payload: { resourceId: Number(substituteId), note },
        })
        await approve.mutateAsync({ id: booking.id, payload: note ? { note } : undefined })
      }
      setSubstituteOpen(false)
      onActionComplete?.()
    } catch {
      // error ditampilkan via `error`
    }
  }

  const handleReject = () => {
    reject.mutate(
      { id: booking.id, payload: { note: rejectNote } },
      { onSuccess: () => onActionComplete?.() },
    )
  }

  const canAlihkan = isVehicle
    ? !!alihkanDriverId && !!alihkanVehicleId
    : !!substituteId

  return (
    <Card>
      <h3
        className="mb-4 text-base font-bold text-[var(--text-primary)]"
        style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
      >
        Persetujuan Booking
      </h3>

      {error && (
        <div className="mb-4 flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{getErrorMessage(error)}</span>
        </div>
      )}

      {/* 1. Setujui (dengan catatan opsional) */}
      <div className="space-y-3">
        <InputTextArea
          label="Catatan (Opsional)"
          rows={2}
          placeholder="Tambahkan catatan untuk peminjam…"
          value={approveNote}
          onChange={(e) => setApproveNote(e.target.value)}
        />
        <AppButton
          fullWidth
          loading={approve.isPending && !substitute.isPending && !assign.isPending}
          disabled={isBusy}
          leftIcon={<Check className="h-4 w-4" />}
          className="bg-[#16A34A] text-white hover:bg-green-700"
          onClick={handleApprove}
        >
          Setujui
        </AppButton>
      </div>

      {/* 2. Alihkan & Setujui */}
      <AppButton
        variant="secondary"
        fullWidth
        disabled={isBusy}
        leftIcon={<ArrowRightLeft className="h-4 w-4" />}
        className="mt-2"
        onClick={openAlihkan}
      >
        Alihkan & Setujui
      </AppButton>
      <p className="mt-2 text-xs text-[var(--text-disabled)]">
        {isVehicle
          ? 'Ganti driver &/atau kendaraan lalu setujui. Peminjam menerima notifikasi pengalihan.'
          : 'Ganti ruangan lalu setujui. Peminjam menerima notifikasi pengalihan.'}
      </p>

      {/* 3. Separator */}
      <div className="my-5 flex items-center gap-3">
        <Separator className="flex-1 bg-[var(--border-divider)]" />
        <span className="text-xs text-[var(--text-disabled)]">atau</span>
        <Separator className="flex-1 bg-[var(--border-divider)]" />
      </div>

      {/* 4. Tolak */}
      <InputTextArea
        label="Catatan Penolakan"
        required
        rows={3}
        placeholder="Alasan penolakan (wajib)…"
        value={rejectNote}
        onChange={(e) => setRejectNote(e.target.value)}
      />
      <AppButton
        variant="danger"
        fullWidth
        loading={reject.isPending}
        disabled={isBusy || !rejectNote.trim()}
        leftIcon={<X className="h-4 w-4" />}
        className="mt-3 border border-[var(--danger)] bg-transparent text-[var(--danger)] hover:bg-red-50"
        onClick={handleReject}
      >
        Tolak Booking
      </AppButton>

      {/* ── Dialog: Alihkan & Setujui ── */}
      <Dialog open={substituteOpen} onOpenChange={setSubstituteOpen}>
        <DialogContent className="rounded-2xl p-6 shadow-[var(--shadow-modal)] sm:max-w-md">
          <DialogHeader>
            <DialogTitle
              className="text-lg font-bold text-[var(--text-primary)]"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            >
              {isVehicle ? 'Alihkan Driver & Kendaraan' : 'Alihkan Ruangan'} & Setujui
            </DialogTitle>
          </DialogHeader>

          <div className="mt-2 space-y-4">
            {/* Resource saat ini */}
            <div>
              <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-[0.07em] text-[var(--text-secondary)]">
                Booking Saat Ini
              </p>
              <CardSection className="flex items-center gap-2.5">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--bg-card)] text-[var(--text-secondary)]">
                  <ResourceIcon className="h-4 w-4" />
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-[var(--text-primary)]">
                    {booking.resource.name}
                  </p>
                  {isVehicle && booking.assignedDriver && (
                    <p className="truncate text-xs text-[var(--text-secondary)]">
                      Driver: {booking.assignedDriver.name}
                    </p>
                  )}
                </div>
              </CardSection>
            </div>

            {isVehicle ? (
              <>
                <InputSelect
                  label="Driver"
                  required
                  placeholder="Pilih driver"
                  options={driverOptions}
                  value={alihkanDriverId}
                  onChange={(e) => setAlihkanDriverId(e.target.value)}
                />
                <InputSelect
                  label="Kendaraan"
                  required
                  placeholder="Pilih kendaraan"
                  options={vehicleOptions}
                  value={alihkanVehicleId}
                  onChange={(e) => setAlihkanVehicleId(e.target.value)}
                />
              </>
            ) : (
              <InputSelect
                label="Ruangan Pengganti"
                required
                placeholder="Pilih ruangan pengganti"
                options={roomOptions}
                value={substituteId}
                onChange={(e) => setSubstituteId(e.target.value)}
              />
            )}

            <InputTextArea
              label="Alasan Pengalihan"
              rows={3}
              placeholder="Alasan booking dialihkan…"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />

            <div className="flex gap-3 pt-1">
              <AppButton
                variant="secondary"
                fullWidth
                disabled={isBusy}
                onClick={() => setSubstituteOpen(false)}
              >
                Batal
              </AppButton>
              <AppButton
                fullWidth
                loading={isBusy}
                disabled={isBusy || !canAlihkan}
                onClick={handleAlihkanApprove}
              >
                Alihkan & Setujui
              </AppButton>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  )
}

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
import { useVehicles } from '@/modules/vehicles/hooks/useVehicles'
import { useRooms } from '@/modules/rooms/hooks/useRooms'
import {
  useApproveBooking,
  useRejectBooking,
  useSubstituteResource,
} from '../hooks/useBookings'

// ─────────────────────────────────────────
// BOOKING APPROVAL PANEL (admin, status PENDING)
// 3 aksi: Setujui · Alihkan & Setujui · Tolak
// ─────────────────────────────────────────

interface Props {
  booking: Booking
  onActionComplete?: () => void
}

export const BookingApprovalPanel = ({ booking, onActionComplete }: Props) => {
  const [substituteOpen, setSubstituteOpen] = useState(false)
  const [substituteId, setSubstituteId] = useState('')
  const [substituteReason, setSubstituteReason] = useState('')
  const [approveNote, setApproveNote] = useState('')
  const [rejectNote, setRejectNote] = useState('')

  const approve = useApproveBooking()
  const reject = useRejectBooking()
  const substitute = useSubstituteResource()

  const isVehicle = booking.resource.type === RESOURCE_TYPE.VEHICLE
  const ResourceIcon = isVehicle ? Car : DoorOpen

  // Opsi resource pengganti (status AVAILABLE, exclude resource saat ini).
  // value = resourceId (bukan vehicle/room id) sesuai payload substitute.
  const { data: vehicles } = useVehicles({ status: RESOURCE_STATUS.AVAILABLE, limit: 100 })
  const { data: rooms } = useRooms({ status: RESOURCE_STATUS.AVAILABLE, limit: 100 })

  const substituteOptions: SelectOption[] = (
    isVehicle
      ? (vehicles ?? []).map((v) => ({ value: v.resourceId, label: `${v.name} (${v.plateNumber})` }))
      : (rooms ?? []).map((r) => ({ value: r.resourceId, label: r.name }))
  ).filter((opt) => opt.value !== booking.resource.id)

  const error = approve.error || reject.error || substitute.error
  const isBusy = approve.isPending || reject.isPending || substitute.isPending

  if (booking.status !== BOOKING_STATUS.PENDING) return null

  // Approve biasa: cukup klik "Setujui", TANPA pilih kendaraan.
  // Assignment driver + kendaraan dilakukan terpisah di BookingAssignPanel
  // setelah status APPROVED. Catatan bersifat opsional.
  const handleApprove = () => {
    approve.mutate(
      {
        id: booking.id,
        payload: approveNote.trim() ? { note: approveNote.trim() } : undefined,
      },
      { onSuccess: () => onActionComplete?.() },
    )
  }

  const handleSubstituteApprove = async () => {
    try {
      await substitute.mutateAsync({
        id: booking.id,
        payload: {
          resourceId: Number(substituteId),
          note: substituteReason.trim() || undefined,
        },
      })
      await approve.mutateAsync({
        id: booking.id,
        payload: substituteReason.trim() ? { note: substituteReason.trim() } : undefined,
      })
      setSubstituteOpen(false)
      setSubstituteId('')
      setSubstituteReason('')
      onActionComplete?.()
    } catch {
      // error ditampilkan via `error` di bawah
    }
  }

  const handleReject = () => {
    reject.mutate(
      { id: booking.id, payload: { note: rejectNote } },
      { onSuccess: () => onActionComplete?.() },
    )
  }

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
          loading={approve.isPending && !substitute.isPending}
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
        onClick={() => setSubstituteOpen(true)}
      >
        Alihkan & Setujui
      </AppButton>
      <p className="mt-2 text-xs text-[var(--text-disabled)]">
        Catatan: Employee akan menerima notifikasi pengalihan dan dapat
        membatalkan booking jika tidak setuju.
      </p>

      {/* 3. Separator */}
      <div className="my-5 flex items-center gap-3">
        <Separator className="flex-1 bg-[var(--border-divider)]" />
        <span className="text-xs text-[var(--text-disabled)]">atau</span>
        <Separator className="flex-1 bg-[var(--border-divider)]" />
      </div>

      {/* 4 + 5. Tolak */}
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
              Alihkan Resource & Setujui
            </DialogTitle>
          </DialogHeader>

          <div className="mt-2 space-y-4">
            {/* Resource saat ini */}
            <div>
              <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-[0.07em] text-[var(--text-secondary)]">
                Resource Saat Ini
              </p>
              <CardSection className="flex items-center gap-2.5">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--bg-card)] text-[var(--text-secondary)]">
                  <ResourceIcon className="h-4 w-4" />
                </span>
                <span className="text-sm font-semibold text-[var(--text-primary)]">
                  {booking.resource.name}
                </span>
              </CardSection>
            </div>

            <InputSelect
              label="Resource Pengganti"
              required
              placeholder="Pilih resource pengganti"
              options={substituteOptions}
              value={substituteId}
              onChange={(e) => setSubstituteId(e.target.value)}
            />

            <InputTextArea
              label="Alasan Penggantian"
              rows={3}
              placeholder="Alasan resource dialihkan…"
              value={substituteReason}
              onChange={(e) => setSubstituteReason(e.target.value)}
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
                loading={substitute.isPending || approve.isPending}
                disabled={isBusy || !substituteId}
                onClick={handleSubstituteApprove}
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

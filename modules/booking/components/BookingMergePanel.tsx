'use client'

import { useState } from 'react'
import Link from 'next/link'
import { AlertCircle, ExternalLink, GitMerge } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Card } from '@/components/common'
import { BookingStatusBadge, UserAvatar } from '@/components/shared'
import {
  AppButton,
  InputDate,
  InputTextArea,
  TimePicker,
} from '@/components/ui-custom'
import { getErrorMessage } from '@/lib'
import { BOOKING_STATUS, RESOURCE_TYPE } from '@/constants'
import type { Booking } from '@/types'
import { useBookings, useMergeBooking } from '../hooks/useBookings'

// ─────────────────────────────────────────
// BOOKING MERGE PANEL (admin, VEHICLE, PENDING/APPROVED)
// Menampilkan booking kendaraan lain di tanggal yang sama,
// lalu admin memilih satu untuk digabungkan.
// ─────────────────────────────────────────

interface BookingMergePanelProps {
  booking: Booking
  onMergeComplete?: () => void
}

const pad = (n: number) => String(n).padStart(2, '0')
const formatYMD = (d: Date) =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
const formatTime = (iso: string) => {
  const d = new Date(iso)
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`
}
const startOfDayIso = (iso: string) => {
  const d = new Date(iso)
  return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0).toISOString()
}
const endOfDayIso = (iso: string) => {
  const d = new Date(iso)
  return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59).toISOString()
}

const MERGEABLE_STATUSES: Booking['status'][] = [
  BOOKING_STATUS.PENDING,
  BOOKING_STATUS.APPROVED,
]

export const BookingMergePanel = ({
  booking,
  onMergeComplete,
}: BookingMergePanelProps) => {
  // Semua booking VEHICLE pada tanggal yang sama dengan booking ini
  const { data } = useBookings({
    resourceType: RESOURCE_TYPE.VEHICLE,
    startDate: startOfDayIso(booking.startDate),
    endDate: endOfDayIso(booking.startDate),
    limit: 20,
  })

  const candidates = (data?.data ?? []).filter(
    (b) => b.id !== booking.id && MERGEABLE_STATUSES.includes(b.status),
  )

  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)
  const [mergeDate, setMergeDate] = useState('')
  const [mergeStartTime, setMergeStartTime] = useState('')
  const [mergeEndTime, setMergeEndTime] = useState('')
  const [reason, setReason] = useState('')

  const merge = useMergeBooking()

  const openMergeForm = (candidate: Booking) => {
    setSelectedBooking(candidate)
    setMergeDate(formatYMD(new Date(booking.startDate)))
    setMergeStartTime(
      formatTime(booking.startDate) < formatTime(candidate.startDate)
        ? formatTime(booking.startDate)
        : formatTime(candidate.startDate),
    )
    setMergeEndTime(
      formatTime(booking.endDate) > formatTime(candidate.endDate)
        ? formatTime(booking.endDate)
        : formatTime(candidate.endDate),
    )
    setReason('')
  }

  const handleMerge = async () => {
    if (!selectedBooking || !reason.trim()) return
    const startDate = new Date(`${mergeDate}T${mergeStartTime}:00`).toISOString()
    const endDate = new Date(`${mergeDate}T${mergeEndTime}:00`).toISOString()
    try {
      await merge.mutateAsync({
        id: booking.id,
        payload: {
          targetBookingId: selectedBooking.id,
          reason: reason.trim(),
          startDate,
          endDate,
        },
      })
      setSelectedBooking(null)
      onMergeComplete?.()
    } catch {
      // ditampilkan via merge.error di dalam dialog
    }
  }

  return (
    <Card>
      <div className="mb-4 flex items-center justify-between">
        <h3
          className="flex items-center gap-2 text-base font-bold text-[var(--text-primary)]"
          style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
        >
          <GitMerge className="h-4 w-4 text-[#0284C7]" />
          Booking Kendaraan Hari Ini
        </h3>
        <span className="rounded-full bg-[var(--bg-subtle)] px-2.5 py-0.5 text-xs font-semibold text-[var(--text-secondary)]">
          {candidates.length}
        </span>
      </div>

      {candidates.length === 0 ? (
        <p className="text-sm text-[var(--text-secondary)]">
          Tidak ada booking kendaraan lain di tanggal yang sama.
        </p>
      ) : (
        <div className="space-y-3">
          {candidates.map((c) => (
            <div
              key={c.id}
              className="rounded-xl border border-[var(--border-card)] p-4"
            >
              <div className="flex items-center gap-2.5">
                <UserAvatar name={c.user.name} size="md" />
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-[var(--text-primary)]">
                    #{c.id} · {c.user.name}
                  </p>
                  <p className="truncate text-xs text-[var(--text-secondary)]">
                    {c.user.department}
                  </p>
                </div>
              </div>

              <p className="mt-2 truncate text-xs text-[var(--text-secondary)]">
                {c.resource.name}
                {c.assignedVehicle?.plateNumber
                  ? ` · ${c.assignedVehicle.plateNumber}`
                  : ''}
              </p>
              <p className="mt-1 text-xs text-[var(--text-secondary)]">
                {formatTime(c.startDate)} - {formatTime(c.endDate)}
                {c.purpose ? ` · ${c.purpose}` : ''}
              </p>

              <div className="mt-2.5">
                <BookingStatusBadge status={c.status} />
              </div>

              <div className="mt-3 flex items-center justify-between">
                <AppButton variant="link" size="sm" asChild>
                  <Link href={`/booking/${c.id}`} target="_blank">
                    <ExternalLink className="h-3.5 w-3.5" /> Lihat Detail
                  </Link>
                </AppButton>
                <AppButton size="sm" onClick={() => openMergeForm(c)}>
                  Gabungkan
                </AppButton>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Dialog form merge ── */}
      <Dialog
        open={!!selectedBooking}
        onOpenChange={(open) => !open && setSelectedBooking(null)}
      >
        <DialogContent className="rounded-2xl p-6 shadow-[var(--shadow-modal)] sm:max-w-lg">
          <DialogHeader>
            <DialogTitle
              className="flex items-center gap-2 text-lg font-bold text-[var(--text-primary)]"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            >
              <GitMerge className="h-5 w-5 text-[#0284C7]" /> Gabungkan Booking
            </DialogTitle>
          </DialogHeader>

          {selectedBooking && (
            <div className="mt-2 space-y-4">
              {merge.error && (
                <div className="flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>{getErrorMessage(merge.error)}</span>
                </div>
              )}

              <MergeBookingInfo title="Booking Utama" booking={booking} />
              <MergeBookingInfo
                title="Digabungkan Dengan"
                booking={selectedBooking}
              />

              <InputDate
                label="Tanggal Perjalanan Gabungan"
                value={mergeDate}
                onChange={(e) => setMergeDate(e.target.value)}
              />

              <div className="grid grid-cols-2 gap-3">
                <TimePicker
                  label="JAM MULAI"
                  value={mergeStartTime}
                  onChange={setMergeStartTime}
                />
                <TimePicker
                  label="JAM SELESAI"
                  value={mergeEndTime}
                  onChange={setMergeEndTime}
                />
              </div>

              <InputTextArea
                label="Alasan Penggabungan"
                required
                rows={3}
                placeholder="Alasan booking digabungkan…"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />

              <div className="flex gap-3 pt-1">
                <AppButton
                  variant="secondary"
                  fullWidth
                  disabled={merge.isPending}
                  onClick={() => setSelectedBooking(null)}
                >
                  Batal
                </AppButton>
                <AppButton
                  fullWidth
                  loading={merge.isPending}
                  disabled={merge.isPending || !reason.trim()}
                  onClick={handleMerge}
                >
                  Gabungkan Booking
                </AppButton>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  )
}

// ── Info ringkas satu booking di form merge ──
const MergeBookingInfo = ({
  title,
  booking,
}: {
  title: string
  booking: Booking
}) => (
  <div className="rounded-xl bg-[var(--bg-subtle)] p-3">
    <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-[0.07em] text-[var(--text-secondary)]">
      {title}
    </p>
    <p className="text-sm font-semibold text-[var(--text-primary)]">
      #{booking.id} · {booking.user.name} · {formatTime(booking.startDate)}-
      {formatTime(booking.endDate)}
    </p>
    {booking.purpose && (
      <p className="mt-1 truncate text-xs text-[var(--text-secondary)]">
        Tujuan: {booking.purpose}
      </p>
    )}
  </div>
)

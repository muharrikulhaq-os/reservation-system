'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  AlertCircle,
  Car,
  ExternalLink,
  GitMerge,
  UserRound,
  Zap,
} from 'lucide-react'
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
import { cn, getErrorMessage } from '@/lib'
import { BOOKING_STATUS, RESOURCE_TYPE } from '@/constants'
import type { Booking } from '@/types'
import {
  useApproveBooking,
  useBookings,
  useMergeBooking,
} from '../hooks/useBookings'

// ─────────────────────────────────────────
// BOOKING MERGE PANEL (admin, VEHICLE, PENDING)
// Menampilkan booking kendaraan yang sudah APPROVED di tanggal yang sama
// (siapa pun pemiliknya). Admin memilih satu sebagai PRIMARY/utama, lalu
// booking ini (target) otomatis ikut disetujui + driver/resource primary.
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
// Dua ISO string di hari kalender LOKAL yang sama?
const sameLocalDay = (a: string, b: string) => {
  const x = new Date(a)
  const y = new Date(b)
  return (
    x.getFullYear() === y.getFullYear() &&
    x.getMonth() === y.getMonth() &&
    x.getDate() === y.getDate()
  )
}

export const BookingMergePanel = ({
  booking,
  onMergeComplete,
}: BookingMergePanelProps) => {
  // Semua booking kendaraan yang sudah APPROVED (kandidat "booking utama").
  // Sengaja TIDAK memfilter tanggal di server - backend memfilter dengan
  // containment (startDate>=X AND endDate<=Y) yang rapuh terhadap timezone;
  // penyaringan per-hari dilakukan di klien di bawah.
  const { data } = useBookings({
    resourceType: RESOURCE_TYPE.VEHICLE,
    status: BOOKING_STATUS.APPROVED,
    limit: 100,
  })

  // Driver yang dipilih karyawan saat create (pemicu "kandidat merge")
  const requestedDriverId = booking.assignedDriver?.id ?? null
  const isRequested = (c: Booking) =>
    requestedDriverId != null && c.assignedDriver?.id === requestedDriverId

  // Kandidat = booking APPROVED lain di hari yang sama (boleh user yang sama),
  // dengan kandidat "permintaan merge" (driver sama) di paling atas.
  const candidates = (data?.data ?? [])
    .filter(
      (b) =>
        b.id !== booking.id &&
        b.status === BOOKING_STATUS.APPROVED &&
        sameLocalDay(b.startDate, booking.startDate),
    )
    .sort((a, b) => Number(isRequested(b)) - Number(isRequested(a)))

  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)
  const [mergeDate, setMergeDate] = useState('')
  const [mergeStartTime, setMergeStartTime] = useState('')
  const [mergeEndTime, setMergeEndTime] = useState('')
  const [reason, setReason] = useState('')

  const merge = useMergeBooking()
  const approve = useApproveBooking()

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

  // Merge lalu otomatis approve booking ini (target).
  // - id (path)       = PRIMARY = candidate yang sudah APPROVED
  // - targetBookingId = booking ini (PENDING) yang ikut digabungkan
  // Setelah merge sukses, booking ini di-approve dengan catatan
  // "telah dilakukan merge" → status berubah ke APPROVED.
  const handleMerge = async () => {
    if (!selectedBooking || !reason.trim()) return
    const startDate = new Date(`${mergeDate}T${mergeStartTime}:00`).toISOString()
    const endDate = new Date(`${mergeDate}T${mergeEndTime}:00`).toISOString()
    try {
      await merge.mutateAsync({
        id: selectedBooking.id,
        payload: {
          targetBookingId: booking.id,
          reason: reason.trim(),
          startDate,
          endDate,
        },
      })
      // Auto-approve booking ini (target) setelah merge
      await approve.mutateAsync({
        id: booking.id,
        payload: { note: 'telah dilakukan merge' },
      })
      setSelectedBooking(null)
      onMergeComplete?.()
    } catch {
      // ditampilkan via error di dalam dialog
    }
  }

  return (
    <Card>
      <div className="mb-1 flex items-center justify-between">
        <h3
          className="flex items-center gap-2 text-base font-bold text-[var(--text-primary)]"
          style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
        >
          <GitMerge className="h-4 w-4 text-[#0284C7]" />
          Gabungkan dengan Booking Lain
        </h3>
        <span className="rounded-full bg-[var(--bg-subtle)] px-2.5 py-0.5 text-xs font-semibold text-[var(--text-secondary)]">
          {candidates.length}
        </span>
      </div>
      <p className="mb-4 text-xs text-[var(--text-secondary)]">
        Booking kendaraan yang sudah disetujui di tanggal yang sama
      </p>

      {candidates.length === 0 ? (
        <p className="py-4 text-center text-sm text-[var(--text-disabled)]">
          Tidak ada booking kendaraan lain yang sudah disetujui di tanggal ini.
        </p>
      ) : (
        <div className="space-y-3">
          {candidates.map((c) => (
            <div
              key={c.id}
              className={cn(
                'rounded-xl border p-4',
                isRequested(c)
                  ? 'border-[1.5px] border-amber-300 bg-amber-50/40'
                  : 'border-[var(--border-card)]',
              )}
            >
              {/* Badge: request merge dari karyawan */}
              {isRequested(c) && (
                <div className="mb-2 inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-700">
                  <Zap className="h-2.5 w-2.5" /> Permintaan merge dari karyawan
                </div>
              )}

              {/* User info */}
              <div className="mb-2 flex items-center gap-2.5">
                <UserAvatar name={c.user.name} size="sm" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-[var(--text-primary)]">
                    {c.user.name}
                  </p>
                  <p className="truncate text-xs text-[var(--text-secondary)]">
                    {c.user.department}
                  </p>
                </div>
                <BookingStatusBadge status={c.status} />
              </div>

              {/* Resource + Driver - dari booking yang sudah approved */}
              <div className="mb-2 rounded-lg bg-[var(--bg-subtle)] p-2.5 text-xs">
                <div className="flex items-center gap-2 text-[var(--text-primary)]">
                  <Car className="h-3.5 w-3.5 text-[var(--text-secondary)]" />
                  <span className="font-medium">
                    {c.resource.name}
                    {c.assignedVehicle?.plateNumber
                      ? ` · ${c.assignedVehicle.plateNumber}`
                      : ''}
                  </span>
                </div>
                {c.assignedDriver && (
                  <div className="mt-1 flex items-center gap-2 text-[var(--text-secondary)]">
                    <UserRound className="h-3.5 w-3.5" />
                    <span>Driver: {c.assignedDriver.name}</span>
                  </div>
                )}
              </div>

              {/* Waktu + Tujuan */}
              <p className="text-xs text-[var(--text-secondary)]">
                {formatTime(c.startDate)} - {formatTime(c.endDate)}
                {c.purpose ? ` · ${c.purpose}` : ''}
              </p>

              {/* Action */}
              <div className="mt-3 flex items-center justify-between">
                <AppButton variant="link" size="sm" asChild>
                  <Link href={`/booking/${c.id}`} target="_blank">
                    <ExternalLink className="h-3.5 w-3.5" /> Detail
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
              {(merge.error || approve.error) && (
                <div className="flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>{getErrorMessage(merge.error || approve.error)}</span>
                </div>
              )}

              <MergeBookingInfo
                title="Booking Utama (sudah disetujui)"
                booking={selectedBooking}
              />
              <MergeBookingInfo
                title="Digabungkan (booking ini)"
                booking={booking}
              />

              <p className="rounded-lg bg-[var(--bg-subtle)] px-3 py-2 text-xs text-[var(--text-secondary)]">
                Setelah digabung, booking ini langsung disetujui dan otomatis
                mengikuti driver &amp; kendaraan dari booking utama.
              </p>

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
                  disabled={merge.isPending || approve.isPending}
                  onClick={() => setSelectedBooking(null)}
                >
                  Batal
                </AppButton>
                <AppButton
                  fullWidth
                  loading={merge.isPending || approve.isPending}
                  disabled={merge.isPending || approve.isPending || !reason.trim()}
                  onClick={handleMerge}
                >
                  Gabungkan &amp; Setujui
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

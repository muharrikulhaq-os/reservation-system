'use client'

import { useState } from 'react'
import { AlertCircle, Pencil, Phone, Users } from 'lucide-react'
import { Card, CardHeader } from '@/components/common'
import { Badge, PhoneContact, UserAvatar } from '@/components/shared'
import { AppButton } from '@/components/ui-custom'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { getErrorMessage } from '@/lib'
import { BOOKING_STATUS } from '@/constants'
import type { Booking, UserLookup } from '@/types'
import { useSetPassengers } from '../hooks/useBookings'
import { PassengerPicker } from './PassengerPicker'

// ─────────────────────────────────────────
// PENUMPANG (detail booking kendaraan)
// Karyawan yang ikut + nomor HP (telepon / WhatsApp). Booking digabung:
// pemesan & penumpang booking pasangannya ikut tampil (satu perjalanan).
// Ubah daftar: pemesan & admin, selama PENDING/APPROVED.
// ─────────────────────────────────────────

interface Props {
  booking: Booking
  currentUserId?: number
  isAdmin: boolean
  capacity?: number | null
}

export const BookingPassengersCard = ({ booking, currentUserId, isAdmin, capacity }: Props) => {
  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState<UserLookup[]>([])
  const save = useSetPassengers(booking.id)
  const list = booking.passengers ?? []
  const mine = list.filter((p) => p.role === 'PASSENGER' && p.bookingId === booking.id)
  const others = list.filter((p) => !(p.role === 'PASSENGER' && p.bookingId === booking.id))
  const editable =
    (isAdmin || currentUserId === booking.user.id) &&
    (booking.status === BOOKING_STATUS.PENDING || booking.status === BOOKING_STATUS.APPROVED)

  const startEdit = () => {
    setDraft(mine.map((p) => ({ id: p.userId, name: p.name, employeeId: p.employeeId, department: p.department })))
    save.reset()
    setOpen(true)
  }

  const submit = async () => {
    try {
      await save.mutateAsync(draft.map((d) => d.id))
      setOpen(false)
    } catch {
      // ditampilkan via save.error
    }
  }

  return (
    <Card>
      <CardHeader
        title="Penumpang"
        description={`${booking.passengerCount ?? 1 + mine.length} orang · ${mine.length} karyawan ikut`}
        action={
          editable ? (
            <AppButton size="sm" variant="secondary" leftIcon={<Pencil className="h-3.5 w-3.5" />} onClick={startEdit}>
              Ubah
            </AppButton>
          ) : undefined
        }
      />
      {list.length === 0 ? (
        <p className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
          <Users className="h-4 w-4" /> Hanya pemesan, tidak ada karyawan lain yang ikut
        </p>
      ) : (
        <ul className="divide-y divide-[var(--border-divider)]">
          {[...mine, ...others].map((p) => (
            <li key={`${p.bookingId}-${p.userId}`} className="flex items-start gap-3 py-2.5 first:pt-0">
              <UserAvatar name={p.name} size="md" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-[var(--text-primary)]">{p.name}</p>
                <p className="truncate text-xs text-[var(--text-secondary)]">
                  {p.department}
                  {p.bookingId !== booking.id && ` · booking gabungan #${p.bookingId}`}
                </p>
                <PhoneContact
                  phone={p.phoneNumber}
                  className="mt-1"
                  fallback={
                    <span className="mt-1 inline-flex items-center gap-1 text-xs text-[var(--text-disabled)]">
                      <Phone className="h-3 w-3" /> No. telepon belum diisi
                    </span>
                  }
                />
              </div>
              {p.role === 'REQUESTER' && <Badge variant="muted">Pemesan</Badge>}
            </li>
          ))}
        </ul>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="rounded-2xl p-6 shadow-[var(--shadow-modal)] sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-[var(--text-primary)]">Ubah Karyawan yang Ikut</DialogTitle>
          </DialogHeader>
          <div className="mt-2 space-y-4">
            {save.error && (
              <div className="flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{getErrorMessage(save.error)}</span>
              </div>
            )}
            <PassengerPicker
              value={draft}
              onChange={setDraft}
              max={capacity ? Math.max(0, capacity - 1) : undefined}
              excludeIds={[booking.user.id]}
            />
            <p className="text-xs text-[var(--text-secondary)]">
              Karyawan yang baru ditambahkan mendapat notifikasi. Jumlah penumpang otomatis disesuaikan bila kurang.
            </p>
            <div className="flex gap-3 pt-1">
              <AppButton variant="secondary" fullWidth onClick={() => setOpen(false)}>
                Batal
              </AppButton>
              <AppButton fullWidth loading={save.isPending} onClick={submit}>
                Simpan
              </AppButton>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  )
}

'use client'

import { useEffect, useState } from 'react'
import { AlertCircle, Star } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { AppButton, InputTextArea } from '@/components/ui-custom'
import { UserAvatar } from '@/components/shared'
import { cn, getErrorMessage } from '@/lib'
import { useRateRoom } from '../hooks/useBookings'

// ─────────────────────────────────────────
// RATING PENJAGA RUANGAN
// Tiap penjaga dinilai terpisah (bintang + ulasan). Tidak wajib: penjaga
// yang bintangnya dibiarkan kosong dilewati dan bisa dinilai nanti.
// ─────────────────────────────────────────

interface KeeperToRate {
  roomKeeperId: number
  name: string
}

interface RateRoomModalProps {
  bookingId: number
  roomName?: string
  /** Penjaga yang belum dinilai. */
  keepers: KeeperToRate[]
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

type Draft = Record<number, { rating: number; review: string }>

export const RateRoomModal = ({
  bookingId,
  roomName,
  keepers,
  open,
  onOpenChange,
  onSuccess,
}: RateRoomModalProps) => {
  const [draft, setDraft] = useState<Draft>({})
  const rate = useRateRoom()

  useEffect(() => {
    if (open) setDraft({})
  }, [open])

  const set = (id: number, patch: Partial<Draft[number]>) =>
    setDraft((d) => ({ ...d, [id]: { ...(d[id] ?? { rating: 0, review: '' }), ...patch } }))

  const chosen = keepers.filter((k) => (draft[k.roomKeeperId]?.rating ?? 0) > 0)
  const canSubmit = chosen.length > 0

  const handleSubmit = async () => {
    if (!canSubmit) return
    try {
      await rate.mutateAsync({
        bookingId,
        payload: {
          ratings: chosen.map((k) => ({
            roomKeeperId: k.roomKeeperId,
            rating: draft[k.roomKeeperId].rating as 1 | 2 | 3 | 4 | 5,
            review: draft[k.roomKeeperId].review.trim() || undefined,
          })),
        },
      })
      onOpenChange(false)
      onSuccess?.()
    } catch {
      // ditampilkan via rate.error
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto rounded-2xl p-6 shadow-[var(--shadow-modal)] sm:max-w-md">
        <DialogHeader>
          <DialogTitle
            className="text-lg font-bold text-[var(--text-primary)]"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            Beri Rating Penjaga Ruangan
          </DialogTitle>
        </DialogHeader>

        <div className="mt-2 space-y-4">
          {rate.error && (
            <div className="flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{getErrorMessage(rate.error)}</span>
            </div>
          )}

          <p className="text-sm text-[var(--text-secondary)]">
            Bagaimana pelayanan penjaga
            {roomName && (
              <>
                {' '}
                <span className="font-semibold text-[var(--text-primary)]">{roomName}</span>
              </>
            )}
            ? Penjaga yang tidak diberi bintang dilewati.
          </p>

          <ul className="space-y-3">
            {keepers.map((k) => {
              const d = draft[k.roomKeeperId]
              const value = d?.rating ?? 0
              return (
                <li
                  key={k.roomKeeperId}
                  className="rounded-xl border border-[var(--border-card)] bg-[var(--bg-subtle)] p-3"
                >
                  <div className="flex items-center gap-2.5">
                    <UserAvatar name={k.name} size="sm" />
                    <span className="min-w-0 flex-1 truncate text-sm font-semibold text-[var(--text-primary)]">
                      {k.name}
                    </span>
                  </div>
                  <div className="mt-2 flex items-center gap-1.5">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <button
                        key={n}
                        type="button"
                        onClick={() => set(k.roomKeeperId, { rating: value === n ? 0 : n })}
                        aria-label={`${k.name}: ${n} bintang`}
                        className="transition-transform hover:scale-110"
                      >
                        <Star
                          className={cn(
                            'h-7 w-7',
                            value >= n ? 'fill-[#F59E0B] text-[#F59E0B]' : 'text-[var(--border-input)]',
                          )}
                        />
                      </button>
                    ))}
                  </div>
                  {value > 0 && (
                    <div className="mt-2">
                      <InputTextArea
                        label="Ulasan (opsional)"
                        rows={2}
                        placeholder="Ceritakan pelayanannya…"
                        value={d?.review ?? ''}
                        onChange={(e) => set(k.roomKeeperId, { review: e.target.value })}
                      />
                    </div>
                  )}
                </li>
              )
            })}
          </ul>

          <div className="flex gap-3 pt-1">
            <AppButton
              variant="secondary"
              fullWidth
              disabled={rate.isPending}
              onClick={() => onOpenChange(false)}
            >
              Nanti
            </AppButton>
            <AppButton
              fullWidth
              loading={rate.isPending}
              disabled={!canSubmit || rate.isPending}
              onClick={handleSubmit}
            >
              Kirim Rating
            </AppButton>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

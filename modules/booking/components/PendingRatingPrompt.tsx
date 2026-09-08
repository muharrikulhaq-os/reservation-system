'use client'

import { useState } from 'react'
import { Star } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { AppButton } from '@/components/ui-custom'
import { formatDate } from '@/lib'
import { usePendingDriverRatings } from '../hooks/useBookings'
import { RateDriverModal } from './RateDriverModal'

// ─────────────────────────────────────────
// PENDING RATING PROMPT
// Pemantik rating driver untuk booking KENDARAAN - beda dari ruangan,
// pemilik booking kendaraan tidak punya action untuk menyelesaikan
// booking-nya sendiri (hanya ADMIN yang bisa), jadi dia tidak otomatis
// balik ke halaman detail saat booking selesai. Modal ini menutup celah
// itu: begitu user login dan punya booking selesai yang belum dinilai,
// modal langsung muncul.
//
// Dismissible, BUKAN localStorage - sengaja pakai React state biasa supaya
// resetnya alami mengikuti siklus login: layout (main) di-unmount saat
// logout (pindah ke /login di luar route group) dan mount ulang fresh saat
// login berikutnya, jadi "Nanti Saja" cuma berlaku untuk sesi berjalan,
// muncul lagi di login berikutnya - tanpa perlu bersih-bersih storage
// manual. Kalau di-dismiss, notifikasi RATE_DRIVER_PROMPT di lonceng
// notifikasi (dikirim dari Complete() saat booking selesai) tetap ada
// sebagai pengingat persisten yang bisa diklik kapan saja.
// ─────────────────────────────────────────

export const PendingRatingPrompt = () => {
  const { data: pending, isLoading } = usePendingDriverRatings()
  const [dismissed, setDismissed] = useState(false)
  const [rateTarget, setRateTarget] = useState<{ bookingId: number; driverName: string } | null>(null)

  const items = pending ?? []
  const showList = !isLoading && !dismissed && items.length > 0 && !rateTarget

  return (
    <>
      <Dialog open={showList} onOpenChange={(open) => !open && setDismissed(true)}>
        <DialogContent className="rounded-2xl p-6 shadow-[var(--shadow-modal)] sm:max-w-md">
          <DialogHeader>
            <DialogTitle
              className="flex items-center gap-2 text-lg font-bold text-[var(--text-primary)]"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            >
              <Star className="h-5 w-5 fill-[#F59E0B] text-[#F59E0B]" />
              Beri Rating Driver
            </DialogTitle>
            <DialogDescription className="text-sm text-[var(--text-secondary)]">
              {items.length === 1
                ? 'Ada 1 perjalanan yang sudah selesai dan belum Anda nilai.'
                : `Ada ${items.length} perjalanan yang sudah selesai dan belum Anda nilai.`}
            </DialogDescription>
          </DialogHeader>

          <div className="mt-2 max-h-72 space-y-2 overflow-y-auto">
            {items.map((p) => (
              <div
                key={p.bookingId}
                className="flex items-center justify-between gap-3 rounded-lg border border-[var(--border-card)] px-3 py-2.5"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-[var(--text-primary)]">
                    {p.driverName}
                  </p>
                  <p className="truncate text-xs text-[var(--text-secondary)]">
                    {p.resourceName} · {formatDate(p.startDate)}
                  </p>
                </div>
                <AppButton
                  size="sm"
                  leftIcon={<Star className="h-3.5 w-3.5" />}
                  onClick={() => setRateTarget({ bookingId: p.bookingId, driverName: p.driverName })}
                >
                  Nilai
                </AppButton>
              </div>
            ))}
          </div>

          <div className="pt-2">
            <AppButton variant="secondary" fullWidth onClick={() => setDismissed(true)}>
              Nanti Saja
            </AppButton>
          </div>
        </DialogContent>
      </Dialog>

      {rateTarget && (
        <RateDriverModal
          bookingId={rateTarget.bookingId}
          driverName={rateTarget.driverName}
          open={!!rateTarget}
          onOpenChange={(open) => !open && setRateTarget(null)}
          onSuccess={() => setRateTarget(null)}
        />
      )}
    </>
  )
}

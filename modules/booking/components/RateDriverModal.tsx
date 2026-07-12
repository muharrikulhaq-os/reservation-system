'use client'

import { useState } from 'react'
import { AlertCircle, Star } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { AppButton, InputTextArea } from '@/components/ui-custom'
import { cn, getErrorMessage } from '@/lib'
import { useRateDriver } from '../hooks/useBookings'

interface RateDriverModalProps {
  bookingId: number
  driverName?: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export const RateDriverModal = ({
  bookingId,
  driverName,
  open,
  onOpenChange,
  onSuccess,
}: RateDriverModalProps) => {
  const [rating, setRating] = useState(0)
  const [hover, setHover] = useState(0)
  const [review, setReview] = useState('')

  const rate = useRateDriver()

  const canSubmit = rating >= 1 && rating <= 5

  const handleSubmit = async () => {
    if (!canSubmit) return
    try {
      await rate.mutateAsync({
        bookingId,
        payload: {
          rating: rating as 1 | 2 | 3 | 4 | 5,
          review: review.trim() || undefined,
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
      <DialogContent className="rounded-2xl p-6 shadow-[var(--shadow-modal)] sm:max-w-md">
        <DialogHeader>
          <DialogTitle
            className="text-lg font-bold text-[var(--text-primary)]"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            Beri Rating Driver
          </DialogTitle>
        </DialogHeader>

        <div className="mt-2 space-y-4">
          {rate.error && (
            <div className="flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{getErrorMessage(rate.error)}</span>
            </div>
          )}

          {driverName && (
            <p className="text-sm text-[var(--text-secondary)]">
              Bagaimana perjalanan bersama{' '}
              <span className="font-semibold text-[var(--text-primary)]">
                {driverName}
              </span>
              ?
            </p>
          )}

          {/* Bintang */}
          <div className="flex items-center justify-center gap-2 py-2">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setRating(n)}
                onMouseEnter={() => setHover(n)}
                onMouseLeave={() => setHover(0)}
                aria-label={`${n} bintang`}
                className="transition-transform hover:scale-110"
              >
                <Star
                  className={cn(
                    'h-9 w-9',
                    (hover || rating) >= n
                      ? 'fill-[#F59E0B] text-[#F59E0B]'
                      : 'text-[var(--border-input)]',
                  )}
                />
              </button>
            ))}
          </div>

          <InputTextArea
            label="Ulasan (opsional)"
            rows={3}
            placeholder="Ceritakan pengalaman Anda…"
            value={review}
            onChange={(e) => setReview(e.target.value)}
          />

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

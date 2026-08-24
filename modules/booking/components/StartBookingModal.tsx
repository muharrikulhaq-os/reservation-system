'use client'

import { useState, type ReactNode } from 'react'
import { AlertCircle, AlertTriangle, Play } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { AppButton, InputNumber, InputFile } from '@/components/ui-custom'
import { getErrorMessage } from '@/lib'
import { useStartBooking } from '../hooks/useBookings'

interface StartBookingModalProps {
  bookingId: number
  currentOdometer?: number
  onSuccess?: () => void
  trigger?: ReactNode
}

export const StartBookingModal = ({
  bookingId,
  currentOdometer,
  onSuccess,
  trigger,
}: StartBookingModalProps) => {
  const [open, setOpen] = useState(false)
  const [odometer, setOdometer] = useState<number | undefined>(currentOdometer)
  const [photo, setPhoto] = useState<File | null>(null)

  const start = useStartBooking()

  const canSubmit = odometer != null && !!photo

  const handleSubmit = async () => {
    if (!canSubmit || !photo) return
    try {
      await start.mutateAsync({
        id: bookingId,
        payload: { odometerStart: odometer, startPhoto: photo },
      })
      setOpen(false)
      onSuccess?.()
    } catch {
      // ditampilkan via start.error
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <AppButton fullWidth leftIcon={<Play className="h-4 w-4" />}>
            Mulai Perjalanan
          </AppButton>
        )}
      </DialogTrigger>
      <DialogContent className="rounded-2xl p-6 shadow-[var(--shadow-modal)] sm:max-w-md">
        <DialogHeader>
          <DialogTitle
            className="flex items-center gap-2 text-lg font-bold text-[var(--text-primary)]"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            <Play className="h-5 w-5 text-[var(--primary)]" /> Mulai Perjalanan
          </DialogTitle>
        </DialogHeader>

        <div className="mt-2 space-y-4">
          {start.error && (
            <div className="flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{getErrorMessage(start.error)}</span>
            </div>
          )}

          <InputNumber
            label="Odometer Sekarang"
            required
            min={0}
            value={odometer ?? ''}
            onChange={setOdometer}
          />

          <InputFile
            label="Foto Odometer"
            required
            accept="image/jpeg,image/png"
            maxSizeMb={5}
            onChange={(files) => setPhoto(files[0] ?? null)}
          />

          <p className="flex items-start gap-1.5 text-xs text-[var(--text-secondary)]">
            <AlertTriangle className="mt-0.5 h-3 w-3 shrink-0" />
            Pastikan odometer & foto sesuai kondisi kendaraan saat berangkat.
          </p>

          <div className="flex gap-3 pt-1">
            <AppButton
              variant="secondary"
              fullWidth
              disabled={start.isPending}
              onClick={() => setOpen(false)}
            >
              Batal
            </AppButton>
            <AppButton
              fullWidth
              loading={start.isPending}
              disabled={!canSubmit || start.isPending}
              onClick={handleSubmit}
            >
              Mulai
            </AppButton>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

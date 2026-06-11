'use client'

import { useState } from 'react'
import { AlertCircle, FileCheck } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { AppButton, InputText, InputTextArea, InputFile } from '@/components/ui-custom'
import { getErrorMessage } from '@/lib'
import { useSubmitReturnReport } from '../hooks/useBookings'

// ─────────────────────────────────────────
// RETURN REPORT MODAL (driver, ONGOING + VEHICLE)
// Driver melaporkan kondisi pengembalian kendaraan.
// ─────────────────────────────────────────

interface ReturnReportModalProps {
  bookingId: number
  onSuccess?: () => void
}

export const ReturnReportModal = ({ bookingId, onSuccess }: ReturnReportModalProps) => {
  const [open, setOpen] = useState(false)
  const [note, setNote] = useState('')
  const [location, setLocation] = useState('')
  const [photos, setPhotos] = useState<File[]>([])

  const submit = useSubmitReturnReport()

  const canSubmit = note.trim().length > 0 && location.trim().length > 0

  const handleSubmit = async () => {
    if (!canSubmit) return
    try {
      await submit.mutateAsync({
        bookingId,
        payload: { note: note.trim(), location: location.trim(), photos },
      })
      setOpen(false)
      setNote('')
      setLocation('')
      setPhotos([])
      onSuccess?.()
    } catch {
      // ditampilkan via submit.error
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <AppButton fullWidth leftIcon={<FileCheck className="h-4 w-4" />}>
          Laporkan Pengembalian
        </AppButton>
      </DialogTrigger>
      <DialogContent className="rounded-2xl p-6 shadow-[var(--shadow-modal)] sm:max-w-lg">
        <DialogHeader>
          <DialogTitle
            className="text-lg font-bold text-[var(--text-primary)]"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            Laporan Pengembalian Kendaraan
          </DialogTitle>
        </DialogHeader>

        <div className="mt-2 space-y-4">
          {submit.error && (
            <div className="flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{getErrorMessage(submit.error)}</span>
            </div>
          )}

          <InputTextArea
            label="Catatan Perjalanan"
            required
            rows={4}
            placeholder="Deskripsikan kondisi kendaraan, kendala, dll…"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />

          <InputText
            label="Lokasi Saat Ini"
            required
            placeholder="Kantor Pusat, Jl. Sudirman No. 1"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />

          <InputFile
            label="Foto Kondisi Kendaraan"
            accept="image/jpeg,image/png"
            multiple
            maxSizeMb={5}
            onChange={setPhotos}
          />

          <div className="flex gap-3 pt-1">
            <AppButton
              variant="secondary"
              fullWidth
              disabled={submit.isPending}
              onClick={() => setOpen(false)}
            >
              Batal
            </AppButton>
            <AppButton
              fullWidth
              loading={submit.isPending}
              disabled={!canSubmit || submit.isPending}
              onClick={handleSubmit}
            >
              Kirim Laporan
            </AppButton>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

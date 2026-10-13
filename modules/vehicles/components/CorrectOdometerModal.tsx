'use client'

import { useEffect, useState } from 'react'
import { AlertCircle, Gauge } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { AppButton, InputNumber, InputTextArea } from '@/components/ui-custom'
import { formatOdometer, getErrorMessage } from '@/lib'
import type { Vehicle } from '@/types'
import { useCorrectOdometer, useOdometerFloor } from '../hooks/useVehicles'

// ─────────────────────────────────────────
// KOREKSI ODOMETER (admin)
// Boleh naik atau turun - tapi tidak di bawah bacaan sah yang sudah
// tercatat (BBM, voucher, perjalanan, maintenance, buku saldo), karena
// hak BBM berikutnya dihitung dari selisih odometer. Salah ketik pada
// catatan BBM itu sendiri dikoreksi lewat "Batalkan" catatan BBM.
// ─────────────────────────────────────────

interface Props {
  vehicle: Vehicle
  open: boolean
  onOpenChange: (open: boolean) => void
}

export const CorrectOdometerModal = ({ vehicle, open, onOpenChange }: Props) => {
  const correct = useCorrectOdometer(vehicle.id)
  const { data: floor, isLoading: floorLoading } = useOdometerFloor(vehicle.id, open)
  const [odometer, setOdometer] = useState<number | undefined>()
  const [reason, setReason] = useState('')

  useEffect(() => {
    if (open) {
      setOdometer(undefined)
      setReason('')
      correct.reset()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  const min = floor?.minOdometer ?? 0
  const current = floor?.currentOdometer ?? vehicle.currentOdometer

  let odometerError: string | undefined
  if (odometer !== undefined) {
    if (odometer < min) odometerError = `Tidak boleh kurang dari ${formatOdometer(min)}`
    else if (odometer === current) odometerError = 'Sama dengan odometer saat ini'
  }
  const canSubmit =
    odometer !== undefined && !odometerError && reason.trim().length >= 3 && !correct.isPending

  const submit = async () => {
    if (!canSubmit || odometer === undefined) return
    try {
      await correct.mutateAsync({ odometer, reason: reason.trim() })
      onOpenChange(false)
    } catch {
      // ditampilkan via correct.error
    }
  }

  const delta = odometer !== undefined && !odometerError ? odometer - current : null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-2xl p-6 shadow-[var(--shadow-modal)] sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg font-bold text-[var(--text-primary)]">
            <Gauge className="h-5 w-5 text-[var(--primary)]" /> Koreksi Odometer
          </DialogTitle>
        </DialogHeader>

        <div className="mt-2 space-y-4">
          <div className="grid grid-cols-2 gap-3 rounded-xl bg-[var(--bg-subtle)] p-3 text-sm">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.06em] text-[var(--text-secondary)]">
                Saat ini
              </p>
              <p className="mt-0.5 font-semibold text-[var(--text-primary)]">{formatOdometer(current)}</p>
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.06em] text-[var(--text-secondary)]">
                Paling rendah
              </p>
              <p className="mt-0.5 font-semibold text-[var(--text-primary)]">
                {floorLoading ? '…' : formatOdometer(min)}
              </p>
            </div>
          </div>
          <p className="text-xs leading-relaxed text-[var(--text-secondary)]">
            Batas terendah adalah bacaan sah terakhir yang tercatat (BBM, voucher, perjalanan,
            atau maintenance). Salah ketik pada catatan BBM dikoreksi lewat <b>Batalkan</b> catatan
            BBM tersebut.
          </p>

          {correct.error && (
            <div className="flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{getErrorMessage(correct.error)}</span>
            </div>
          )}

          <InputNumber
            label="Odometer Baru (km)"
            required
            min={min}
            placeholder={`min. ${min}`}
            value={odometer ?? ''}
            onChange={setOdometer}
            error={odometerError}
            hint={
              delta !== null
                ? `${delta > 0 ? 'Naik' : 'Turun'} ${formatOdometer(Math.abs(delta))} dari catatan saat ini`
                : undefined
            }
          />
          <InputTextArea
            label="Alasan Koreksi"
            required
            rows={3}
            placeholder="mis. salah input saat pendataan awal, odometer dicek fisik di pool"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            hint="Tercatat di log aktivitas"
          />

          <div className="flex gap-3 pt-1">
            <AppButton variant="secondary" fullWidth onClick={() => onOpenChange(false)}>
              Batal
            </AppButton>
            <AppButton fullWidth loading={correct.isPending} disabled={!canSubmit} onClick={submit}>
              Simpan Koreksi
            </AppButton>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

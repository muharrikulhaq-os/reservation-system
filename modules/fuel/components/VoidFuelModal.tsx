'use client'

import { useEffect, useState } from 'react'
import { AlertCircle, Ban } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { AppButton, InputTextArea } from '@/components/ui-custom'
import { getErrorMessage, formatNumber } from '@/lib'
import type { FuelExpense } from '@/types'
import { useVoidFuel } from '../hooks/useFuel'

// ─────────────────────────────────────────
// BATALKAN CATATAN PENGISIAN (pengganti hapus - FL-06)
// Data tetap ada (dicoret), liter kembali ke saldo. Opsi "odometer salah
// ketik" hanya berlaku untuk catatan terakhir kendaraan (backend memeriksa).
// ─────────────────────────────────────────

interface Props {
  fuel: FuelExpense
  open: boolean
  onOpenChange: (open: boolean) => void
}

export const VoidFuelModal = ({ fuel, open, onOpenChange }: Props) => {
  const voidFuel = useVoidFuel()
  const [reason, setReason] = useState('')
  const [odometerTypo, setOdometerTypo] = useState(false)

  useEffect(() => {
    if (open) {
      setReason('')
      setOdometerTypo(false)
      voidFuel.reset()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  const submit = async () => {
    try {
      await voidFuel.mutateAsync({ id: fuel.id, reason: reason.trim(), odometerTypo })
      onOpenChange(false)
    } catch {
      // ditampilkan via voidFuel.error
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-2xl p-6 shadow-[var(--shadow-modal)] sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg font-bold text-[var(--text-primary)]">
            <Ban className="h-5 w-5 text-[var(--danger)]" /> Batalkan Catatan Pengisian
          </DialogTitle>
        </DialogHeader>
        <div className="mt-2 space-y-4">
          <p className="text-sm text-[var(--text-secondary)]">
            Catatan tidak dihapus - tetap tampil dengan status <b>Dibatalkan</b>, tidak dihitung di
            laporan biaya, dan liternya dikembalikan ke saldo kendaraan.
          </p>
          {voidFuel.error && (
            <div className="flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{getErrorMessage(voidFuel.error)}</span>
            </div>
          )}
          <InputTextArea
            label="Alasan pembatalan"
            required
            rows={2}
            placeholder="mis. input ganda, salah kendaraan…"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
          <label className="flex items-start gap-2 text-sm text-[var(--text-primary)]">
            <input
              type="checkbox"
              checked={odometerTypo}
              onChange={(e) => setOdometerTypo(e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-[var(--border-input)]"
            />
            <span>
              Odometer di catatan ini salah ketik ({formatNumber(fuel.odometerAfter ?? 0)} km)
              <span className="block text-xs text-[var(--text-secondary)]">
                Odometer kendaraan dikembalikan ke bacaan sah sebelumnya. Hanya bisa untuk catatan
                terakhir kendaraan.
              </span>
            </span>
          </label>
          <div className="flex gap-3 pt-1">
            <AppButton variant="secondary" fullWidth onClick={() => onOpenChange(false)}>
              Kembali
            </AppButton>
            <AppButton
              variant="danger"
              fullWidth
              loading={voidFuel.isPending}
              disabled={!reason.trim() || voidFuel.isPending}
              onClick={submit}
            >
              Batalkan Catatan
            </AppButton>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

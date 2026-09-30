'use client'

import { useEffect, useState } from 'react'
import { AlertCircle, History, Scale } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { AppButton, InputNumber, InputSelect, InputTextArea } from '@/components/ui-custom'
import { cn, formatDateTime, formatNumber, getErrorMessage } from '@/lib'
import type { EnergyType, VehicleFuelBalance } from '@/types'
import { useAdjustFuelBalance, useFuelLedger } from '../hooks/useFuelVoucher'
import { LEDGER_TYPE_LABEL, formatQty } from '../utils/format'

// ─────────────────────────────────────────
// MUTASI SALDO (read-only) + PENYESUAIAN SALDO MANUAL
// ─────────────────────────────────────────

interface Props {
  vehicle: VehicleFuelBalance
  open: boolean
  onOpenChange: (open: boolean) => void
}

export const FuelLedgerModal = ({ vehicle, open, onOpenChange }: Props) => {
  const [page, setPage] = useState(1)
  const { data, isLoading } = useFuelLedger(open ? vehicle.vehicleId : undefined, page, 15)
  const items = data?.data ?? []
  const totalPages = data?.pagination?.totalPages ?? 1

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto rounded-2xl p-6 shadow-[var(--shadow-modal)] sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg font-bold text-[var(--text-primary)]">
            <History className="h-5 w-5 text-[var(--primary)]" /> Mutasi Saldo · {vehicle.vehicleName} ({vehicle.plateNumber})
          </DialogTitle>
        </DialogHeader>
        {isLoading ? (
          <p className="py-8 text-center text-sm text-[var(--text-secondary)]">Memuat…</p>
        ) : items.length === 0 ? (
          <p className="py-8 text-center text-sm text-[var(--text-secondary)]">Belum ada mutasi saldo.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--border-divider)] text-left text-[10px] uppercase tracking-[0.06em] text-[var(--text-secondary)]">
                  <th className="py-2 pr-3">Waktu</th>
                  <th className="py-2 pr-3">Kejadian</th>
                  <th className="py-2 pr-3 text-right">Odometer</th>
                  <th className="py-2 pr-3 text-right">Hak</th>
                  <th className="py-2 pr-3 text-right">Keluar</th>
                  <th className="py-2 text-right">Saldo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-divider)]">
                {items.map((e) => {
                  const unit = e.energy === 'LISTRIK' ? 'kWh' : 'L'
                  return (
                    <tr key={e.id} className="align-top">
                      <td className="py-2 pr-3 text-xs text-[var(--text-secondary)]">{formatDateTime(e.createdAt)}</td>
                      <td className="py-2 pr-3">
                        <p className="font-medium text-[var(--text-primary)]">
                          {LEDGER_TYPE_LABEL[e.entryType] ?? e.entryType}
                          {vehicle.energyType === 'HYBRID' && (
                            <span className="ml-1 text-[10px] text-[var(--text-secondary)]">({e.energy})</span>
                          )}
                        </p>
                        {e.note && <p className="text-xs text-[var(--text-secondary)]">{e.note}</p>}
                        {e.createdByName && <p className="text-[10px] text-[var(--text-disabled)]">oleh {e.createdByName}</p>}
                      </td>
                      <td className="py-2 pr-3 text-right text-xs">
                        {e.odometer != null ? `${formatNumber(e.odometer)} km` : '-'}
                        {e.distanceKm ? <p className="text-[10px] text-[var(--text-secondary)]">+{formatNumber(e.distanceKm)} km</p> : null}
                      </td>
                      <td className="py-2 pr-3 text-right text-xs text-green-700">{e.accrued ? `+${formatQty(e.accrued)}` : '-'}</td>
                      <td className={cn('py-2 pr-3 text-right text-xs', e.debit < 0 ? 'text-green-700' : 'text-red-600')}>
                        {e.debit ? (e.debit < 0 ? `+${formatQty(-e.debit)}` : `−${formatQty(e.debit)}`) : '-'}
                      </td>
                      <td className="py-2 text-right font-semibold">{formatQty(e.balanceAfter)} {unit}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
        {totalPages > 1 && (
          <div className="mt-3 flex items-center justify-end gap-2">
            <AppButton size="sm" variant="secondary" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
              Sebelumnya
            </AppButton>
            <span className="text-xs text-[var(--text-secondary)]">{page} / {totalPages}</span>
            <AppButton size="sm" variant="secondary" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
              Berikutnya
            </AppButton>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

export const FuelAdjustModal = ({ vehicle, open, onOpenChange }: Props) => {
  const adjust = useAdjustFuelBalance()
  const energies = Object.keys(vehicle.balances) as EnergyType[]
  const [energy, setEnergy] = useState<EnergyType>(energies[0] ?? 'BBM')
  const [direction, setDirection] = useState<'plus' | 'minus'>('plus')
  const [amount, setAmount] = useState<number | undefined>()
  const [note, setNote] = useState('')

  useEffect(() => {
    if (!open) return
    setEnergy(energies[0] ?? 'BBM')
    setDirection('plus')
    setAmount(undefined)
    setNote('')
    adjust.reset()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  const unit = energy === 'LISTRIK' ? 'kWh' : 'L'
  const current = vehicle.balances[energy]

  const submit = async () => {
    if (!amount) return
    try {
      await adjust.mutateAsync({
        vehicleId: vehicle.vehicleId,
        payload: { energy, amount: direction === 'plus' ? amount : -amount, note: note.trim() },
      })
      onOpenChange(false)
    } catch {
      // ditampilkan via adjust.error
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-2xl p-6 shadow-[var(--shadow-modal)] sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg font-bold text-[var(--text-primary)]">
            <Scale className="h-5 w-5 text-[var(--primary)]" /> Penyesuaian Saldo · {vehicle.plateNumber}
          </DialogTitle>
        </DialogHeader>
        <div className="mt-2 space-y-4">
          {adjust.error && (
            <div className="flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{getErrorMessage(adjust.error)}</span>
            </div>
          )}
          <p className="text-xs text-[var(--text-secondary)]">
            Saldo tercatat saat ini: <b>{formatQty(current?.recordedBalance ?? 0)} {unit}</b>. Gunakan untuk
            isi tangki awal, koreksi, atau kejadian yang tidak tercatat. Tercatat di mutasi & audit.
          </p>
          <div className="grid grid-cols-2 gap-3">
            {energies.length > 1 && (
              <InputSelect
                label="Saldo"
                options={energies.map((e) => ({ value: e, label: e === 'BBM' ? 'BBM (L)' : 'Listrik (kWh)' }))}
                value={energy}
                onChange={(e) => setEnergy(e.target.value as EnergyType)}
              />
            )}
            <InputSelect
              label="Arah"
              options={[
                { value: 'plus', label: 'Tambah saldo' },
                { value: 'minus', label: 'Kurangi saldo' },
              ]}
              value={direction}
              onChange={(e) => setDirection(e.target.value as 'plus' | 'minus')}
            />
            <InputNumber label={`Jumlah (${unit})`} required min={0} step={0.01} value={amount ?? ''} onChange={setAmount} />
          </div>
          <InputTextArea
            label="Alasan"
            required
            rows={2}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="mis. isi tangki awal sebelum sistem dipakai"
          />
          <div className="flex gap-3 pt-1">
            <AppButton variant="secondary" fullWidth onClick={() => onOpenChange(false)}>
              Batal
            </AppButton>
            <AppButton
              fullWidth
              loading={adjust.isPending}
              disabled={!amount || !note.trim() || adjust.isPending}
              onClick={submit}
            >
              Simpan
            </AppButton>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

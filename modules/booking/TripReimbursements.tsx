'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { AlertCircle, CheckCircle2, ImageOff, Wallet } from 'lucide-react'
import { Card, CardHeader } from '@/components/common'
import { PageHeader, SafeImage } from '@/components/shared'
import { AppButton, AppCheckbox, InputDate, InputText } from '@/components/ui-custom'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { formatCurrency, formatDate, formatDateTime, getErrorMessage, resolveFileUrl, wibToISO, wibYMD } from '@/lib'
import type { PendingTripReimbursement, TripExpense } from '@/types'
import {
  usePayTripReimbursement,
  usePendingTripReimbursements,
  useTripExpenseMode,
  useTripReimbursements,
} from './hooks/useTripExpenses'

// ─────────────────────────────────────────
// REIMBURSE SUPIR (mode lengkap biaya perjalanan)
// Transaksi tol/parkir yang dibayar uang pribadi supir → admin menandai
// sudah dibayar per supir (beberapa transaksi sekaligus).
// ─────────────────────────────────────────

const itemTitle = (e: TripExpense) => {
  if (e.category === 'PARKING') return 'Parkir'
  if (e.category === 'OTHER') return e.note ?? 'Lainnya'
  const route = [e.entryGate, e.exitGate].filter(Boolean).join(' → ')
  return route ? `Tol · ${route}` : 'Tol'
}

const DriverGroup = ({ group, onPreview }: { group: PendingTripReimbursement; onPreview: (url: string) => void }) => {
  const [selected, setSelected] = useState<Set<number>>(() => new Set(group.items.map((i) => i.id)))
  const [open, setOpen] = useState(false)
  const [paidAt, setPaidAt] = useState(wibYMD(new Date()))
  const [note, setNote] = useState('')
  const pay = usePayTripReimbursement()
  const total = group.items.filter((i) => selected.has(i.id)).reduce((s, i) => s + i.amount, 0)

  const toggle = (id: number, on: boolean) =>
    setSelected((s) => {
      const next = new Set(s)
      if (on) next.add(id)
      else next.delete(id)
      return next
    })

  const submit = async () => {
    try {
      await pay.mutateAsync({
        driverId: group.driver.id,
        expenseIds: [...selected],
        paidAt: paidAt ? wibToISO(paidAt, '12:00') : undefined,
        note: note.trim() || undefined,
      })
      setOpen(false)
    } catch {
      // ditampilkan via pay.error
    }
  }

  return (
    <Card>
      <CardHeader
        title={group.driver.name}
        description={`${group.count} transaksi menunggu · ${formatCurrency(group.total)}`}
        action={
          <AppButton size="sm" disabled={selected.size === 0} onClick={() => setOpen(true)}>
            Tandai Dibayar ({formatCurrency(total)})
          </AppButton>
        }
      />
      <ul className="divide-y divide-[var(--border-divider)]">
        {group.items.map((e) => {
          const photo = resolveFileUrl(e.proofPhotoUrl)
          return (
            <li key={e.id} className="flex items-center gap-3 py-2.5">
              <AppCheckbox
                checked={selected.has(e.id)}
                onCheckedChange={(c) => toggle(e.id, c)}
                aria-label={`Pilih ${itemTitle(e)}`}
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-[var(--text-primary)]">
                  {itemTitle(e)} · {formatCurrency(e.amount)}
                </p>
                <p className="truncate text-xs text-[var(--text-secondary)]">
                  {formatDateTime(e.occurredAt)} ·{' '}
                  <Link href={`/booking/${e.bookingId}`} className="text-[var(--primary)] hover:underline">
                    Booking #{e.bookingId}
                  </Link>
                  {e.vehicle.plateNumber ? ` · ${e.vehicle.plateNumber}` : ''}
                </p>
              </div>
              {photo && (
                <button
                  type="button"
                  onClick={() => onPreview(photo)}
                  className="h-10 w-10 shrink-0 overflow-hidden rounded-lg border border-[var(--border-card)]"
                  title="Lihat foto struk"
                >
                  <SafeImage src={photo} alt="Struk" className="h-full w-full object-cover" fallback={<ImageOff className="h-4 w-4" />} />
                </button>
              )}
            </li>
          )
        })}
      </ul>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="rounded-2xl p-6 shadow-[var(--shadow-modal)] sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-[var(--text-primary)]">Tandai Reimburse Dibayar</DialogTitle>
          </DialogHeader>
          <div className="mt-2 space-y-4">
            <p className="text-sm text-[var(--text-secondary)]">
              {selected.size} transaksi untuk <b className="text-[var(--text-primary)]">{group.driver.name}</b> sebesar{' '}
              <b className="text-[var(--text-primary)]">{formatCurrency(total)}</b>.
            </p>
            {pay.error && (
              <div className="flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{getErrorMessage(pay.error)}</span>
              </div>
            )}
            <InputDate label="Tanggal Dibayar" required value={paidAt} max={wibYMD(new Date())} onChange={(e) => setPaidAt(e.target.value)} />
            <InputText label="Catatan (opsional)" placeholder="mis. transfer BCA" value={note} onChange={(e) => setNote(e.target.value)} />
            <div className="flex gap-3 pt-1">
              <AppButton variant="secondary" fullWidth onClick={() => setOpen(false)}>
                Batal
              </AppButton>
              <AppButton fullWidth loading={pay.isPending} disabled={!paidAt} onClick={submit}>
                Simpan
              </AppButton>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  )
}

export const TripReimbursements = () => {
  const mode = useTripExpenseMode()
  const { data: pending, isLoading } = usePendingTripReimbursements()
  const { data: history } = useTripReimbursements()
  const [preview, setPreview] = useState<string | null>(null)
  const totalPending = useMemo(() => (pending ?? []).reduce((s, g) => s + g.total, 0), [pending])

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reimburse Supir"
        description="Biaya tol & parkir yang dibayar dengan uang pribadi supir"
      />

      {mode !== 'FULL' && (
        <div className="rounded-xl border border-[var(--border-card)] bg-[var(--bg-subtle)] px-4 py-3 text-sm text-[var(--text-secondary)]">
          Biaya perjalanan sedang memakai mode sederhana - cara bayar belum dicatat, jadi daftar reimburse kosong.
        </div>
      )}

      <Card>
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-[var(--warning)]">
            <Wallet className="h-5 w-5" />
          </span>
          <div>
            <p className="text-xs text-[var(--text-secondary)]">Total menunggu reimburse</p>
            <p className="text-xl font-bold text-[var(--text-primary)]">{formatCurrency(totalPending)}</p>
          </div>
        </div>
      </Card>

      {isLoading ? (
        <p className="text-sm text-[var(--text-disabled)]">Memuat…</p>
      ) : (pending ?? []).length === 0 ? (
        <Card>
          <p className="flex items-center justify-center gap-2 py-6 text-sm text-[var(--text-secondary)]">
            <CheckCircle2 className="h-4 w-4 text-[var(--success)]" /> Tidak ada reimburse yang menunggu
          </p>
        </Card>
      ) : (
        (pending ?? []).map((g) => <DriverGroup key={g.driver.id} group={g} onPreview={setPreview} />)
      )}

      <Card>
        <CardHeader title="Riwayat Pembayaran" />
        {(history ?? []).length === 0 ? (
          <p className="py-4 text-center text-sm text-[var(--text-disabled)]">Belum ada pembayaran reimburse</p>
        ) : (
          <ul className="divide-y divide-[var(--border-divider)]">
            {(history ?? []).map((r) => (
              <li key={r.id} className="flex items-center justify-between gap-3 py-2.5 text-sm">
                <div className="min-w-0">
                  <p className="truncate font-medium text-[var(--text-primary)]">{r.driver.name}</p>
                  <p className="truncate text-xs text-[var(--text-secondary)]">
                    {formatDate(r.paidAt)} · {r.expenseCount} transaksi · oleh {r.createdBy}
                    {r.note ? ` · ${r.note}` : ''}
                  </p>
                </div>
                <span className="shrink-0 font-semibold text-[var(--text-primary)]">{formatCurrency(r.amount)}</span>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Dialog open={!!preview} onOpenChange={(o) => !o && setPreview(null)}>
        <DialogContent className="max-w-2xl rounded-2xl p-2 shadow-[var(--shadow-modal)]">
          {preview && <SafeImage src={preview} alt="Struk" className="max-h-[80vh] w-full rounded-xl object-contain" fallback={<ImageOff className="h-10 w-10" />} />}
        </DialogContent>
      </Dialog>
    </div>
  )
}

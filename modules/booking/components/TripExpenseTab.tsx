'use client'

import { useState } from 'react'
import { Car, ImageOff, ParkingCircle, Pencil, Plus, Receipt, Ban } from 'lucide-react'
import { Badge, SafeImage } from '@/components/shared'
import { AppButton, InputRupiah } from '@/components/ui-custom'
import { cn, formatCurrency, formatDateTime, getErrorMessage, resolveFileUrl } from '@/lib'
import { appPrompt } from '@/lib/dialog'
import { BOOKING_STATUS } from '@/constants'
import { useAuthStore } from '@/store/auth.store'
import type { Booking, TripExpense, TripExpenseList } from '@/types'
import { useSetTollBudget, useVoidTripExpense } from '../hooks/useTripExpenses'
import { TripExpenseModal } from './TripExpenseModal'

// ─────────────────────────────────────────
// TAB BIAYA PERJALANAN (Catatan Perjalanan)
// SIMPLE: "Tol" - daftar tol masuk/keluar + foto.
// FULL  : "Biaya" - + anggaran tol, cara bayar, status reimburse.
// ─────────────────────────────────────────

const CATEGORY_LABEL = { TOLL: 'Tol', PARKING: 'Parkir', OTHER: 'Lainnya' } as const

const expenseTitle = (e: TripExpense, full: boolean) => {
  if (!full || e.category !== 'TOLL') {
    if (e.category === 'TOLL') return e.tollPoint === 'EXIT' ? 'Tol Keluar' : e.tollPoint === 'ENTRY' ? 'Tol Masuk' : 'Tol'
    return CATEGORY_LABEL[e.category]
  }
  const route = [e.entryGate, e.exitGate].filter(Boolean).join(' → ')
  return route ? `Tol · ${route}` : e.tollPoint === 'EXIT' ? 'Tol Keluar' : 'Tol Masuk'
}

/** Status booking yang boleh dicatati (backend memeriksa ulang). */
const canRecord = (booking: Booking, isAdmin: boolean, isDriver: boolean) => {
  const running = booking.status === BOOKING_STATUS.ONGOING || booking.status === BOOKING_STATUS.OVERDUE
  if (isDriver) return running
  if (isAdmin)
    return running || booking.status === BOOKING_STATUS.RETURNED || booking.status === BOOKING_STATUS.COMPLETED
  return false
}

const BudgetCard = ({ bookingId, data, isAdmin }: { bookingId: number; data: TripExpenseList; isAdmin: boolean }) => {
  const s = data.summary
  const setBudget = useSetTollBudget(bookingId)
  const [editing, setEditing] = useState(false)
  const [value, setValue] = useState<number | undefined>(s.tollBudget ?? undefined)
  const used = s.companyPaid
  const pct = s.tollBudget ? Math.min(100, (used / s.tollBudget) * 100) : 0
  const over = s.budgetRemaining != null && s.budgetRemaining < 0

  return (
    <div className="mb-4 rounded-xl bg-[var(--bg-subtle)] p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.06em] text-[var(--text-secondary)]">
            Anggaran Tol (E-money Kantor)
          </p>
          <p className="mt-0.5 text-base font-bold text-[var(--text-primary)]">
            {s.tollBudget != null ? formatCurrency(s.tollBudget) : 'Belum diatur'}
          </p>
        </div>
        {isAdmin && !editing && (
          <button
            type="button"
            onClick={() => {
              setValue(s.tollBudget ?? undefined)
              setEditing(true)
            }}
            className="inline-flex items-center gap-1 text-xs font-medium text-[var(--primary)] hover:underline"
          >
            <Pencil className="h-3 w-3" /> Atur
          </button>
        )}
      </div>

      {editing && (
        <div className="mt-3 flex items-end gap-2">
          <div className="flex-1">
            <InputRupiah value={value} onChange={setValue} placeholder="mis. 300.000" />
          </div>
          <AppButton
            size="sm"
            loading={setBudget.isPending}
            onClick={() =>
              setBudget.mutate(value ?? null, { onSuccess: () => setEditing(false) })
            }
          >
            Simpan
          </AppButton>
          <AppButton size="sm" variant="ghost" onClick={() => setEditing(false)}>
            Batal
          </AppButton>
        </div>
      )}
      {setBudget.error && (
        <p className="mt-1.5 text-xs text-[var(--danger)]">{getErrorMessage(setBudget.error)}</p>
      )}

      {s.tollBudget != null && (
        <>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-[var(--border-card)]">
            <div
              className={cn('h-full rounded-full', over ? 'bg-[var(--danger)]' : 'bg-[var(--primary)]')}
              style={{ width: `${pct}%` }}
            />
          </div>
          <div className="mt-1.5 flex justify-between text-xs text-[var(--text-secondary)]">
            <span>Terpakai {formatCurrency(used)}</span>
            <span className={cn(over && 'font-semibold text-[var(--danger)]')}>
              {over ? `Lebih ${formatCurrency(-(s.budgetRemaining ?? 0))}` : `Sisa ${formatCurrency(s.budgetRemaining ?? 0)}`}
            </span>
          </div>
        </>
      )}
      {s.personalPaid > 0 && (
        <p className="mt-2 text-xs text-[var(--text-secondary)]">
          Dibayar uang pribadi supir: <b className="text-[var(--text-primary)]">{formatCurrency(s.personalPaid)}</b>
          {s.reimbursePending > 0 && (
            <> · menunggu reimburse <b className="text-[var(--warning)]">{formatCurrency(s.reimbursePending)}</b></>
          )}
        </p>
      )}
    </div>
  )
}

interface Props {
  booking: Booking
  data: TripExpenseList | undefined
  isLoading: boolean
  onPreview: (url: string) => void
}

export const TripExpenseTab = ({ booking, data, isLoading, onPreview }: Props) => {
  const isAdmin = useAuthStore((s) => s.isAdmin())
  const isDriver = useAuthStore((s) => s.isDriver())
  const [open, setOpen] = useState(false)
  const voidExpense = useVoidTripExpense(booking.id)
  const full = data?.mode === 'FULL'
  const allowed = canRecord(booking, isAdmin, isDriver)

  const handleVoid = async (e: TripExpense) => {
    const reason = await appPrompt({
      title: 'Batalkan catatan biaya?',
      description: `${expenseTitle(e, full)} · ${formatCurrency(e.amount)}. Catatan tetap tersimpan sebagai dibatalkan dan tidak dihitung di laporan.`,
      label: 'Alasan',
      tone: 'danger',
      icon: <Ban className="h-6 w-6 text-[var(--danger)]" />,
      confirmText: 'Batalkan Catatan',
    })
    if (reason) voidExpense.mutate({ id: e.id, reason })
  }

  if (isLoading) return <p className="py-6 text-center text-sm text-[var(--text-disabled)]">Memuat…</p>

  return (
    <div>
      {full && data && <BudgetCard bookingId={booking.id} data={data} isAdmin={isAdmin} />}

      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.06em] text-[var(--text-secondary)]">
            {full ? 'Total Biaya Perjalanan' : 'Total Tol'}
          </p>
          <p className="text-lg font-bold text-[var(--text-primary)]">{formatCurrency(data?.summary.total ?? 0)}</p>
        </div>
        {allowed && (
          <AppButton size="sm" leftIcon={<Plus className="h-4 w-4" />} onClick={() => setOpen(true)}>
            {full ? 'Catat Biaya' : 'Catat Tol'}
          </AppButton>
        )}
      </div>

      {voidExpense.error && (
        <p className="mb-2 text-xs text-[var(--danger)]">{getErrorMessage(voidExpense.error)}</p>
      )}

      {data && data.items.length > 0 ? (
        <ul className="divide-y divide-[var(--border-divider)]">
          {data.items.map((e) => {
            const photo = resolveFileUrl(e.proofPhotoUrl)
            const Icon = e.category === 'PARKING' ? ParkingCircle : e.category === 'OTHER' ? Receipt : Car
            return (
              <li key={e.id} className={cn('flex items-center gap-3 py-3', e.isVoided && 'opacity-60')}>
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--primary-light)] text-[var(--primary)]">
                  <Icon className="h-4 w-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className={cn('truncate text-sm font-medium text-[var(--text-primary)]', e.isVoided && 'line-through')}>
                    {expenseTitle(e, full)} · {formatCurrency(e.amount)}
                  </p>
                  <p className="truncate text-xs text-[var(--text-secondary)]">
                    {e.recordedBy.name} · {formatDateTime(e.occurredAt)}
                    {e.note ? ` · ${e.note}` : ''}
                  </p>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {full && e.paymentMethod === 'COMPANY_EMONEY' && <Badge variant="muted">E-money kantor</Badge>}
                    {full && e.paymentMethod === 'PERSONAL' && (
                      <Badge variant={e.reimburseStatus === 'PAID' ? 'success' : 'warning'}>
                        {e.reimburseStatus === 'PAID' ? 'Sudah direimburse' : 'Uang pribadi · perlu diganti'}
                      </Badge>
                    )}
                    {e.isVoided && (
                      <Badge variant="danger">Dibatalkan{e.voidReason ? `: ${e.voidReason}` : ''}</Badge>
                    )}
                  </div>
                </div>
                {photo && (
                  <button
                    type="button"
                    onClick={() => onPreview(photo)}
                    className="h-12 w-12 shrink-0 overflow-hidden rounded-lg border border-[var(--border-card)]"
                    title="Lihat foto struk"
                  >
                    <SafeImage
                      src={photo}
                      alt="Struk"
                      className="h-full w-full object-cover"
                      fallbackClassName="bg-[var(--bg-subtle)] text-[var(--text-disabled)]"
                      fallback={<ImageOff className="h-4 w-4" />}
                    />
                  </button>
                )}
                {isAdmin && !e.isVoided && e.reimburseStatus !== 'PAID' && (
                  <button
                    type="button"
                    onClick={() => handleVoid(e)}
                    className="shrink-0 rounded-lg p-1.5 text-[var(--text-disabled)] hover:bg-red-50 hover:text-[var(--danger)]"
                    title="Batalkan catatan"
                    aria-label="Batalkan catatan"
                  >
                    <Ban className="h-4 w-4" />
                  </button>
                )}
              </li>
            )
          })}
        </ul>
      ) : (
        <p className="py-6 text-center text-sm text-[var(--text-disabled)]">
          {full ? 'Belum ada biaya perjalanan' : 'Belum ada catatan tol'}
        </p>
      )}

      {allowed && data && (
        <TripExpenseModal bookingId={booking.id} mode={data.mode} open={open} onOpenChange={setOpen} />
      )}
    </div>
  )
}

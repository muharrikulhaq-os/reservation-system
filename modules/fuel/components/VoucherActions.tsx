'use client'

import { useEffect, useState } from 'react'
import { AlertCircle, Ban, CheckCircle2, FileCheck2, ImageOff, Ticket } from 'lucide-react'
import { toast } from 'sonner'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { AppButton, InputFile, InputNumber, InputText, InputTextArea } from '@/components/ui-custom'
import { SafeImage } from '@/components/shared/media/SafeImage'
import { formatDateTime, formatNumber, getErrorMessage, kmHint, resolveFileUrl } from '@/lib'
import type { FuelVoucher } from '@/types'
import { useCancelFuelVoucher, useFuelBalance, useReconcileFuelVouchers, useUseFuelVoucher } from '../hooks/useFuelVoucher'
import { VOUCHER_STATUS_CONFIG, formatQty, formatRupiahExact } from '../utils/format'

// ─────────────────────────────────────────
// AKSI VOUCHER: detail, sudah diisi, batalkan, rekonsiliasi
// ─────────────────────────────────────────

const ErrorBox = ({ error }: { error: unknown }) =>
  error ? (
    <div className="flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
      <span>{getErrorMessage(error)}</span>
    </div>
  ) : null

export const VoucherStatusBadge = ({ v }: { v: Pick<FuelVoucher, 'status' | 'reconciledAt'> }) => {
  const cfg = VOUCHER_STATUS_CONFIG[v.status]
  return (
    <span className="inline-flex items-center gap-1">
      <span
        className="inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold"
        style={{ backgroundColor: `${cfg.color}1A`, color: cfg.color }}
      >
        {cfg.label}
      </span>
      {v.reconciledAt && (
        <span className="inline-flex rounded-full bg-green-50 px-2 py-0.5 text-[10px] font-semibold text-green-700">
          Rekonsiliasi
        </span>
      )}
    </span>
  )
}

interface ModalProps {
  voucher: FuelVoucher
  open: boolean
  onOpenChange: (open: boolean) => void
}

/** Driver/admin: tandai voucher sudah diisi (foto struk wajib untuk driver). */
export const VoucherUseModal = ({ voucher, open, onOpenChange, isAdmin }: ModalProps & { isAdmin: boolean }) => {
  const use = useUseFuelVoucher()
  // Km terakhir kendaraan (dari saldo BBM) - info di bawah input odometer.
  const { data: balance } = useFuelBalance(open ? voucher.vehicleId : undefined)
  const [odometer, setOdometer] = useState<number | undefined>()
  const [photo, setPhoto] = useState<File | null>(null)
  const [note, setNote] = useState('')

  useEffect(() => {
    if (!open) return
    setOdometer(voucher.odometer)
    setPhoto(null)
    setNote('')
    use.reset()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  const expired = voucher.status === 'EXPIRED'
  const odoInvalid = odometer != null && odometer < voucher.odometer
  const canSubmit = !odoInvalid && (isAdmin || !!photo)

  const submit = async () => {
    try {
      await use.mutateAsync({ id: voucher.id, odometer, note: note.trim() || undefined, receiptPhoto: photo })
      toast.success(`Voucher ${voucher.code} ditandai terpakai`)
      onOpenChange(false)
    } catch {
      // ditampilkan via use.error
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-2xl p-6 shadow-[var(--shadow-modal)] sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg font-bold text-[var(--text-primary)]">
            <CheckCircle2 className="h-5 w-5 text-[var(--success)]" /> {expired ? 'Tandai Terpakai' : 'Sudah Diisi'}
          </DialogTitle>
        </DialogHeader>
        <div className="mt-2 space-y-4">
          <p className="text-sm text-[var(--text-secondary)]">
            {voucher.code} · {voucher.plateNumber} · {formatQty(voucher.liter)} L ({formatRupiahExact(voucher.amount)}) di{' '}
            {voucher.stationName}
          </p>
          {expired && (
            <p className="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800">
              Voucher sudah kedaluwarsa dan liternya sudah kembali ke saldo. Tandai terpakai hanya bila
              tagihan mitra membuktikan voucher ini dipakai - saldo akan dipotong lagi.
            </p>
          )}
          <ErrorBox error={use.error} />
          <InputNumber
            label="Odometer Saat Isi (km)"
            min={voucher.odometer}
            value={odometer ?? ''}
            onChange={setOdometer}
            error={odoInvalid ? `Tidak boleh kurang dari ${formatNumber(voucher.odometer)} km` : undefined}
            hint={kmHint(['Km terakhir kendaraan', balance?.currentOdometer], ['Km saat voucher terbit', voucher.odometer])}
          />
          <InputFile
            label="Foto Struk / Nota"
            required={!isAdmin}
            accept="image/jpeg,image/png"
            maxSizeMb={5}
            onChange={(files) => setPhoto(files[0] ?? null)}
          />
          <InputTextArea label="Catatan" rows={2} value={note} onChange={(e) => setNote(e.target.value)} />
          <div className="flex gap-3 pt-1">
            <AppButton variant="secondary" fullWidth onClick={() => onOpenChange(false)}>
              Batal
            </AppButton>
            <AppButton fullWidth loading={use.isPending} disabled={!canSubmit || use.isPending} onClick={submit}>
              Simpan
            </AppButton>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

/** Admin: batalkan voucher - liter kembali ke saldo. */
export const VoucherCancelModal = ({ voucher, open, onOpenChange }: ModalProps) => {
  const cancel = useCancelFuelVoucher()
  const [reason, setReason] = useState('')
  useEffect(() => {
    if (open) {
      setReason('')
      cancel.reset()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  const submit = async () => {
    try {
      await cancel.mutateAsync({ id: voucher.id, reason: reason.trim() })
      toast.success(`Voucher ${voucher.code} dibatalkan`)
      onOpenChange(false)
    } catch {
      // ditampilkan via cancel.error
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-2xl p-6 shadow-[var(--shadow-modal)] sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg font-bold text-[var(--text-primary)]">
            <Ban className="h-5 w-5 text-[var(--danger)]" /> Batalkan Voucher {voucher.code}
          </DialogTitle>
        </DialogHeader>
        <div className="mt-2 space-y-4">
          <p className="text-sm text-[var(--text-secondary)]">
            {voucher.status === 'EXPIRED'
              ? 'Voucher sudah kedaluwarsa (liter sudah kembali ke saldo) - pembatalan hanya menandai statusnya.'
              : `${formatQty(voucher.liter)} L dikembalikan ke saldo ${voucher.plateNumber}.`}
          </p>
          <ErrorBox error={cancel.error} />
          <InputTextArea label="Alasan" required rows={2} value={reason} onChange={(e) => setReason(e.target.value)} />
          <div className="flex gap-3 pt-1">
            <AppButton variant="secondary" fullWidth onClick={() => onOpenChange(false)}>
              Kembali
            </AppButton>
            <AppButton
              variant="danger"
              fullWidth
              loading={cancel.isPending}
              disabled={!reason.trim() || cancel.isPending}
              onClick={submit}
            >
              Batalkan Voucher
            </AppButton>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

/** Admin: rekonsiliasi voucher terpakai dengan nomor tagihan mitra. */
export const ReconcileModal = ({
  vouchers,
  open,
  onOpenChange,
  onDone,
}: {
  vouchers: FuelVoucher[]
  open: boolean
  onOpenChange: (open: boolean) => void
  onDone?: () => void
}) => {
  const reconcile = useReconcileFuelVouchers()
  const [invoice, setInvoice] = useState('')
  useEffect(() => {
    if (open) {
      setInvoice('')
      reconcile.reset()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  const totalLiter = vouchers.reduce((s, v) => s + v.liter, 0)
  const totalAmount = vouchers.reduce((s, v) => s + v.amount, 0)

  const submit = async () => {
    try {
      const r = await reconcile.mutateAsync({ ids: vouchers.map((v) => v.id), invoiceNumber: invoice.trim() })
      toast.success(`${r.data.reconciled} voucher direkonsiliasi`)
      onOpenChange(false)
      onDone?.()
    } catch {
      // ditampilkan via reconcile.error
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-2xl p-6 shadow-[var(--shadow-modal)] sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg font-bold text-[var(--text-primary)]">
            <FileCheck2 className="h-5 w-5 text-[var(--primary)]" /> Rekonsiliasi Tagihan Mitra
          </DialogTitle>
        </DialogHeader>
        <div className="mt-2 space-y-4">
          <div className="rounded-xl bg-[var(--bg-subtle)] px-4 py-3 text-sm">
            <p>
              <b>{vouchers.length}</b> voucher terpakai · <b>{formatQty(totalLiter)} L</b> ·{' '}
              <b>{formatRupiahExact(totalAmount)}</b>
            </p>
            <p className="mt-1 text-xs text-[var(--text-secondary)]">Cocokkan dengan total pada tagihan SPBU.</p>
          </div>
          <ErrorBox error={reconcile.error} />
          <InputText
            label="Nomor Tagihan Mitra"
            required
            placeholder="mis. INV/SPBU/2026/10/001"
            value={invoice}
            onChange={(e) => setInvoice(e.target.value)}
          />
          <div className="flex gap-3 pt-1">
            <AppButton variant="secondary" fullWidth onClick={() => onOpenChange(false)}>
              Batal
            </AppButton>
            <AppButton
              fullWidth
              loading={reconcile.isPending}
              disabled={!invoice.trim() || vouchers.length === 0 || reconcile.isPending}
              onClick={submit}
            >
              Rekonsiliasi
            </AppButton>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

const Line = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <div className="flex items-start justify-between gap-4 py-2">
    <span className="text-xs font-semibold uppercase tracking-[0.06em] text-[var(--text-secondary)]">{label}</span>
    <span className="text-right text-sm text-[var(--text-primary)]">{value}</span>
  </div>
)

export const VoucherDetailModal = ({ voucher: v, open, onOpenChange }: ModalProps) => {
  const receipt = resolveFileUrl(v.receiptPhotoUrl)
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[88vh] overflow-y-auto rounded-2xl p-6 shadow-[var(--shadow-modal)] sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg font-bold text-[var(--text-primary)]">
            <Ticket className="h-5 w-5 text-[var(--primary)]" /> Voucher {v.code}
          </DialogTitle>
        </DialogHeader>
        <div className="mt-1">
          <VoucherStatusBadge v={v} />
          <div className="mt-2 divide-y divide-[var(--border-divider)]">
            <Line label="Kendaraan" value={`${v.vehicleName} · ${v.plateNumber}`} />
            <Line label="SPBU" value={v.stationName} />
            <Line label="Driver" value={v.driverName ?? '-'} />
            <Line label="Jenis" value={`${v.fuelTypeName} · ${formatRupiahExact(v.pricePerLiter)}/L`} />
            <Line label="Liter" value={`${formatQty(v.liter)} L`} />
            <Line label="Nominal" value={<b>{formatRupiahExact(v.amount)}</b>} />
            <Line
              label="Perhitungan"
              value={`${formatNumber(v.distanceKm)} km ÷ ${formatQty(v.kmPerLiter)} = ${formatQty(v.accruedLiter)} L + saldo ${formatQty(v.carriedLiter)} L${v.tankCapacityLiter ? ` (tangki ${formatQty(v.tankCapacityLiter)} L)` : ''}`}
            />
            <Line label="Odometer terbit" value={`${formatNumber(v.odometer)} km`} />
            <Line label="Diterbitkan" value={`${formatDateTime(v.createdAt)} · ${v.issuedByName}`} />
            <Line label="Berlaku s.d." value={`${formatDateTime(v.validUntil)} WIB`} />
            {v.usedAt && (
              <Line
                label="Diisi"
                value={`${formatDateTime(v.usedAt)}${v.usedByName ? ` · ${v.usedByName}` : ''}${v.usedOdometer ? ` · ${formatNumber(v.usedOdometer)} km` : ''}`}
              />
            )}
            {v.cancelledAt && (
              <Line label="Dibatalkan" value={`${formatDateTime(v.cancelledAt)} · ${v.cancelledByName ?? ''} - ${v.cancelReason ?? ''}`} />
            )}
            {v.reconciledAt && (
              <Line label="Rekonsiliasi" value={`${v.invoiceNumber} · ${formatDateTime(v.reconciledAt)}`} />
            )}
            {v.note && <Line label="Catatan" value={v.note} />}
          </div>
          {v.status === 'USED' && (
            <div className="mt-4">
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.06em] text-[var(--text-secondary)]">Struk</p>
              {receipt ? (
                <a href={receipt} target="_blank" rel="noopener noreferrer" className="block overflow-hidden rounded-xl border border-[var(--border-card)]">
                  <SafeImage
                    src={receipt}
                    alt="Struk pengisian"
                    className="max-h-72 w-full bg-[var(--bg-subtle)] object-contain"
                    fallbackClassName="gap-2 bg-[var(--bg-subtle)] px-4 py-6 text-sm text-[var(--text-disabled)]"
                    fallback={<><ImageOff className="h-4 w-4" /> Foto tidak tersedia.</>}
                  />
                </a>
              ) : (
                <p className="text-sm text-[var(--text-disabled)]">Tidak ada foto struk.</p>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

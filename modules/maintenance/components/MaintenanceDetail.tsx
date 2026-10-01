'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  CalendarClock,
  Car,
  Check,
  Coins,
  FileDown,
  KeyRound,
  PackageCheck,
  Pencil,
  Send,
  Trash2,
  XCircle,
} from 'lucide-react'
import { Card, CardHeader } from '@/components/common'
import { PageHeader } from '@/components/shared'
import { SafeImage } from '@/components/shared/media/SafeImage'
import { AppButton } from '@/components/ui-custom'
import { cn } from '@/lib/utils'
import { formatCurrency, formatDate, formatDateTime, formatNumber, getErrorMessage, resolveFileUrl } from '@/lib'
import {
  COST_BEARER_OPTIONS,
  HANDOVER_CHECKLIST,
  MAINTENANCE_PDF_LABEL,
  MAINTENANCE_STATUS,
  MAINTENANCE_STATUS_CONFIG,
  MAINTENANCE_STEPS,
  PICKUP_METHOD_OPTIONS,
  isMaintenanceEditable,
} from '@/constants'
import type { HandoverChecklist, MaintenancePdfKind, MaintenanceRecord } from '@/types'
import { useDeleteMaintenance, useMaintenanceRecord, useSubmitMaintenance } from '../hooks/useMaintenance'
import { openMaintenancePdf } from '../utils/helpers'
import { CancelDialog, CostDialog, HandoverDialog, ReturnDialog, ScheduleDialog } from './MaintenanceDialogs'
import { MaintenanceDocuments } from './MaintenanceDocuments'
import { ErrorAlert, InfoRow, MaintenanceStatusBadge, WarningAlert } from './shared'

type DialogKind = 'schedule' | 'handover' | 'return' | 'cancel' | 'cost' | null

const labelOf = <T extends string>(opts: { value: T; label: string }[], v?: T | null) =>
  (v && opts.find((o) => o.value === v)?.label) || '—'

const money = (v: number | null) => (v != null ? formatCurrency(v) : '—')

// ─────────────────────────────────────────
// Stepper status
// ─────────────────────────────────────────

const StatusStepper = ({ m }: { m: MaintenanceRecord }) => {
  if (m.status === MAINTENANCE_STATUS.CANCELLED) {
    return (
      <WarningAlert>
        Pengajuan dibatalkan{m.cancelledAt ? ` ${formatDateTime(m.cancelledAt)}` : ''}
        {m.cancelReason ? ` - ${m.cancelReason}` : ''}.
      </WarningAlert>
    )
  }
  const current = MAINTENANCE_STEPS.indexOf(m.status)
  return (
    <ol className="flex flex-wrap items-center gap-y-2">
      {MAINTENANCE_STEPS.map((s, i) => {
        const done = i < current || m.status === MAINTENANCE_STATUS.COMPLETED
        const active = i === current && m.status !== MAINTENANCE_STATUS.COMPLETED
        return (
          <li key={s} className="flex items-center">
            <span
              className={cn(
                'flex h-7 items-center gap-1.5 rounded-full px-3 text-xs font-semibold',
                done && 'bg-[#DCFCE7] text-[#166534]',
                active && 'bg-[var(--primary)] text-white',
                !done && !active && 'bg-[var(--bg-subtle)] text-[var(--text-disabled)]',
              )}
            >
              {done && <Check className="h-3.5 w-3.5" />}
              {MAINTENANCE_STATUS_CONFIG[s].label}
            </span>
            {i < MAINTENANCE_STEPS.length - 1 && (
              <span className={cn('mx-1.5 h-px w-5', i < current ? 'bg-[#16A34A]' : 'bg-[var(--border-card)]')} />
            )}
          </li>
        )
      })}
    </ol>
  )
}

const ChecklistView = ({ list }: { list: HandoverChecklist }) => (
  <div className="mt-2 grid grid-cols-1 gap-1.5 sm:grid-cols-2">
    {HANDOVER_CHECKLIST.map((it) => (
      <div key={it.key} className="flex items-center justify-between rounded-lg bg-[var(--bg-subtle)] px-3 py-1.5 text-sm">
        <span className="text-[var(--text-primary)]">{it.label}</span>
        <span className={cn('text-xs font-semibold', list[it.key] ? 'text-[var(--success)]' : 'text-[var(--text-disabled)]')}>
          {list[it.key] ? 'Ada' : 'Tidak ada'}
        </span>
      </div>
    ))}
  </div>
)

// ─────────────────────────────────────────
// DETAIL
// ─────────────────────────────────────────

export const MaintenanceDetail = ({ id }: { id: number }) => {
  const router = useRouter()
  const { data: m, isLoading } = useMaintenanceRecord(id)
  const submit = useSubmitMaintenance()
  const del = useDeleteMaintenance()
  const [dialog, setDialog] = useState<DialogKind>(null)
  const [warning, setWarning] = useState<string | null>(null)
  const [pdfError, setPdfError] = useState<string | null>(null)
  const [pdfLoading, setPdfLoading] = useState<MaintenancePdfKind | null>(null)

  if (isLoading) return <p className="py-16 text-center text-sm text-[var(--text-secondary)]">Memuat…</p>
  if (!m) return <p className="py-16 text-center text-sm text-[var(--text-secondary)]">Data maintenance tidak ditemukan.</p>

  const editable = isMaintenanceEditable(m.status)
  const canSchedule = m.status === 'SUBMITTED' || m.status === 'SCHEDULED'
  const canHandover = canSchedule
  const pdfs: MaintenancePdfKind[] = [
    ...(m.requestNo ? (['request'] as const) : []),
    ...(m.handover ? (['handover'] as const) : []),
    ...(m.return ? (['return'] as const) : []),
  ]

  const openPdf = async (kind: MaintenancePdfKind, download = false) => {
    setPdfError(null)
    setPdfLoading(kind)
    try {
      await openMaintenancePdf(m.id, kind, download)
    } catch (e) {
      setPdfError(getErrorMessage(e, 'Gagal membuat PDF'))
    } finally {
      setPdfLoading(null)
    }
  }

  const close = (open: boolean) => !open && setDialog(null)
  const vehiclePhoto = resolveFileUrl(m.vehicle.photoUrl)

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={m.requestNo ? `Maintenance ${m.requestNo}` : 'Draf Maintenance'}
        description={`${m.vehicle.plateNumber} · ${m.vehicle.name}`}
        backHref="/maintenance"
        actions={
          <div className="flex flex-wrap justify-end gap-2">
            {editable && (
              <Link href={`/maintenance/${m.id}/edit`}>
                <AppButton variant="secondary" leftIcon={<Pencil className="h-4 w-4" />}>Ubah</AppButton>
              </Link>
            )}
            {m.status === 'DRAFT' && (
              <AppButton
                leftIcon={<Send className="h-4 w-4" />}
                loading={submit.isPending}
                onClick={() =>
                  submit.mutate(m.id, {
                    onSuccess: (r) => {
                      const w = (r as { warning?: string }).warning
                      if (w) setWarning(w)
                    },
                  })
                }
              >
                Ajukan & Buat Surat
              </AppButton>
            )}
            {canSchedule && (
              <AppButton variant="secondary" leftIcon={<CalendarClock className="h-4 w-4" />} onClick={() => setDialog('schedule')}>
                Catat Jadwal Vendor
              </AppButton>
            )}
            {canHandover && (
              <AppButton leftIcon={<KeyRound className="h-4 w-4" />} onClick={() => setDialog('handover')}>
                Serah Terima
              </AppButton>
            )}
            {m.status === 'IN_PROGRESS' && (
              <AppButton leftIcon={<PackageCheck className="h-4 w-4" />} onClick={() => setDialog('return')}>
                Terima Kembali
              </AppButton>
            )}
          </div>
        }
      />

      <Card>
        <StatusStepper m={m} />
      </Card>

      {warning && <WarningAlert>{warning}</WarningAlert>}
      <ErrorAlert error={submit.error ?? del.error ?? pdfError} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[3fr_2fr]">
        <div className="flex flex-col gap-6">
          {/* Kendaraan & vendor */}
          <Card>
            <CardHeader title="Kendaraan & Vendor" action={<MaintenanceStatusBadge status={m.status} />} />
            <div className="mb-3 flex items-center gap-3">
              <span className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[var(--bg-subtle)] text-[var(--text-secondary)]">
                <SafeImage src={vehiclePhoto} alt={m.vehicle.name} className="h-full w-full object-cover" fallback={<Car className="h-5 w-5" />} />
              </span>
              <div className="min-w-0">
                <Link href={`/vehicles/${m.vehicle.id}`} className="font-semibold text-[var(--text-primary)] hover:underline">
                  {m.vehicle.plateNumber}
                </Link>
                <p className="text-sm text-[var(--text-secondary)]">
                  {m.vehicle.name} · {m.vehicle.brand} {m.vehicle.model} {m.vehicle.year}
                </p>
              </div>
            </div>
            <div className="divide-y divide-[var(--border-divider)]">
              <InfoRow
                label="Kepemilikan"
                value={
                  m.vehicle.ownership === 'VENDOR'
                    ? `Sewa - ${m.vehicle.ownerVendorName ?? '-'}${m.vehicle.rentalContractNo ? ` (kontrak ${m.vehicle.rentalContractNo})` : ''}`
                    : 'Milik perusahaan'
                }
              />
              <InfoRow label="Vendor tujuan" value={m.vendorName ?? '—'} />
              {m.vendor?.picName && <InfoRow label="PIC vendor" value={`${m.vendor.picName}${m.vendor.phone ? ` · ${m.vendor.phone}` : ''}`} />}
              {m.vendor?.address && <InfoRow label="Alamat vendor" value={m.vendor.address} />}
            </div>
          </Card>

          {/* Pekerjaan & rencana */}
          <Card>
            <CardHeader title="Pekerjaan & Jadwal" />
            <div className="divide-y divide-[var(--border-divider)]">
              <InfoRow label="Jenis" value={m.categoryLabel} />
              <InfoRow label="Uraian" value={m.description} />
              {m.complaint && <InfoRow label="Keluhan" value={m.complaint} />}
              <InfoRow label="Rencana" value={m.plannedDate ? formatDateTime(m.plannedDate) : '—'} />
              {m.scheduledDate && (
                <InfoRow
                  label="Jadwal vendor"
                  value={`${formatDateTime(m.scheduledDate)}${m.scheduleNote ? ` - ${m.scheduleNote}` : ''}`}
                />
              )}
              <InfoRow label="Estimasi lama" value={m.estimatedDays ? `${m.estimatedDays} hari` : '—'} />
              <InfoRow label="Cara serah" value={labelOf(PICKUP_METHOD_OPTIONS, m.pickupMethod)} />
              {m.location && <InfoRow label="Lokasi" value={m.location} />}
              {m.blockStart && (
                <InfoRow
                  label="Blokir booking"
                  value={`${formatDate(m.blockStart)} – ${m.blockEnd ? formatDate(m.blockEnd) : 'sampai kendaraan kembali'}`}
                />
              )}
              {m.sourceIssueId && <InfoRow label="Asal" value={`Laporan kendala supir #${m.sourceIssueId}`} />}
              <InfoRow label="Dibuat" value={`${m.createdBy} · ${formatDateTime(m.createdAt)}`} />
            </div>
          </Card>

          {m.handover && (
            <Card>
              <CardHeader title="Serah Terima ke Vendor" />
              <div className="divide-y divide-[var(--border-divider)]">
                <InfoRow label="Waktu" value={formatDateTime(m.handover.at)} />
                <InfoRow label="Diterima oleh" value={m.handover.receiverName ?? '—'} />
                <InfoRow label="Odometer" value={m.handover.odometer != null ? `${formatNumber(m.handover.odometer)} km` : '—'} />
                <InfoRow label="Level BBM" value={m.handover.fuelLevel ?? '—'} />
                {m.handover.note && <InfoRow label="Catatan" value={m.handover.note} />}
              </div>
              <ChecklistView list={m.handover.checklist} />
            </Card>
          )}

          {m.return && (
            <Card>
              <CardHeader title="Kembali dari Vendor" />
              <div className="divide-y divide-[var(--border-divider)]">
                <InfoRow label="Waktu" value={formatDateTime(m.return.at)} />
                <InfoRow label="Diserahkan oleh" value={m.return.handlerName ?? '—'} />
                <InfoRow label="Odometer" value={m.return.odometer != null ? `${formatNumber(m.return.odometer)} km` : '—'} />
                <InfoRow label="Level BBM" value={m.return.fuelLevel ?? '—'} />
                <InfoRow label="Pekerjaan" value={m.return.workDone ?? '—'} />
                <InfoRow label="Part diganti" value={m.return.partsReplaced ?? '—'} />
                {m.return.note && <InfoRow label="Catatan" value={m.return.note} />}
              </div>
              <ChecklistView list={m.return.checklist} />
            </Card>
          )}
        </div>

        <div className="flex flex-col gap-6">
          {/* Dokumen cetak */}
          <Card>
            <CardHeader title="Cetak Dokumen" description="PDF dibuat dari data terbaru" />
            {pdfs.length === 0 ? (
              <p className="text-sm text-[var(--text-secondary)]">
                Surat pengajuan tersedia setelah draf diajukan.
              </p>
            ) : (
              <ul className="space-y-2">
                {pdfs.map((k) => (
                  <li key={k} className="flex items-center gap-2 rounded-xl bg-[var(--bg-subtle)] px-3 py-2">
                    <FileDown className="h-4 w-4 shrink-0 text-[var(--primary)]" />
                    <span className="flex-1 text-sm font-medium text-[var(--text-primary)]">{MAINTENANCE_PDF_LABEL[k]}</span>
                    <AppButton size="sm" variant="secondary" loading={pdfLoading === k} onClick={() => openPdf(k)}>
                      Buka
                    </AppButton>
                    <AppButton size="sm" variant="ghost" onClick={() => openPdf(k, true)}>
                      Unduh
                    </AppButton>
                  </li>
                ))}
              </ul>
            )}
            <p className="mt-3 text-xs text-[var(--text-disabled)]">
              Kop surat & penandatangan diatur di menu Pengaturan.
            </p>
          </Card>

          {/* Biaya */}
          <Card>
            <CardHeader
              title="Biaya"
              action={
                <AppButton size="sm" variant="ghost" leftIcon={<Coins className="h-4 w-4" />} onClick={() => setDialog('cost')}>
                  Ubah
                </AppButton>
              }
            />
            <div className="divide-y divide-[var(--border-divider)]">
              <InfoRow label="Estimasi" value={money(m.estimatedCost)} />
              <InfoRow label="Aktual" value={money(m.actualCost)} />
              <InfoRow label="Ditanggung" value={labelOf(COST_BEARER_OPTIONS, m.costBearer)} />
            </div>
          </Card>

          <MaintenanceDocuments m={m} />

          {(editable || m.status === 'CANCELLED') && (
            <Card>
              <CardHeader title="Tindakan Lain" />
              <div className="flex flex-wrap gap-2">
                {editable && (
                  <AppButton variant="secondary" leftIcon={<XCircle className="h-4 w-4" />} onClick={() => setDialog('cancel')}>
                    Batalkan Pengajuan
                  </AppButton>
                )}
                {(m.status === 'DRAFT' || m.status === 'CANCELLED') && (
                  <AppButton
                    variant="danger"
                    leftIcon={<Trash2 className="h-4 w-4" />}
                    loading={del.isPending}
                    onClick={() => {
                      if (window.confirm('Hapus maintenance ini permanen?'))
                        del.mutate(m.id, { onSuccess: () => router.push('/maintenance') })
                    }}
                  >
                    Hapus
                  </AppButton>
                )}
              </div>
            </Card>
          )}
        </div>
      </div>

      <ScheduleDialog m={m} open={dialog === 'schedule'} onOpenChange={close} onWarning={setWarning} />
      <HandoverDialog m={m} open={dialog === 'handover'} onOpenChange={close} onWarning={setWarning} />
      <ReturnDialog m={m} open={dialog === 'return'} onOpenChange={close} />
      <CancelDialog m={m} open={dialog === 'cancel'} onOpenChange={close} />
      <CostDialog m={m} open={dialog === 'cost'} onOpenChange={close} />
    </div>
  )
}

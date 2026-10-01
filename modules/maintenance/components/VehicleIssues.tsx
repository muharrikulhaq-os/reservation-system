'use client'

import { useState } from 'react'
import Link from 'next/link'
import { AlertOctagon, ArrowRight, Ban, ImageOff, MapPin, Wrench } from 'lucide-react'
import { Card } from '@/components/common'
import { PageHeader, Pagination } from '@/components/shared'
import { SafeImage } from '@/components/shared/media/SafeImage'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { AppButton, InputSelect, InputTextArea } from '@/components/ui-custom'
import { formatDateTime, resolveFileUrl } from '@/lib'
import { VEHICLE_ISSUE_STATUS_CONFIG } from '@/constants'
import type { VehicleIssue, VehicleIssueStatus } from '@/types'
import { useConvertVehicleIssue, useDismissVehicleIssue, useVehicleIssues } from '../hooks/useMaintenance'
import { MaintenanceNav } from './MaintenanceNav'
import { ErrorAlert, FormDialog, VehicleIssueStatusBadge } from './shared'

const statusOptions = (Object.keys(VEHICLE_ISSUE_STATUS_CONFIG) as VehicleIssueStatus[]).map((s) => ({
  value: s,
  label: VEHICLE_ISSUE_STATUS_CONFIG[s].label,
}))

// Laporan kendala kendaraan dari supir (termasuk masalah di jalan).
export const VehicleIssues = () => {
  const [status, setStatus] = useState<VehicleIssueStatus | ''>('OPEN')
  const [page, setPage] = useState(1)
  const { data, isLoading } = useVehicleIssues({ status: status || undefined, page, limit: 20 })
  const convert = useConvertVehicleIssue()
  const [dismissing, setDismissing] = useState<VehicleIssue | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const items = data?.data ?? []

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Pemeliharaan" description="Laporan kendala kendaraan dari supir" />
      <MaintenanceNav />

      <div className="w-full max-w-[220px]">
        <InputSelect
          placeholder="Semua status"
          options={statusOptions}
          value={status}
          onChange={(e) => {
            setStatus(e.target.value as VehicleIssueStatus | '')
            setPage(1)
          }}
        />
      </div>

      <ErrorAlert error={convert.error} />

      {isLoading ? (
        <p className="py-10 text-center text-sm text-[var(--text-secondary)]">Memuat…</p>
      ) : items.length === 0 ? (
        <Card>
          <p className="py-8 text-center text-sm text-[var(--text-secondary)]">Tidak ada laporan kendala.</p>
        </Card>
      ) : (
        <div className="flex flex-col gap-4">
          {items.map((it) => (
            <Card key={it.id}>
              <div className="flex flex-wrap items-start gap-4">
                <span
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${it.canContinue ? 'bg-[#FEF9C3] text-[#854D0E]' : 'bg-[#FEE2E2] text-[#991B1B]'}`}
                >
                  <AlertOctagon className="h-5 w-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold text-[var(--text-primary)]">{it.vehicle.plateNumber}</span>
                    <span className="text-sm text-[var(--text-secondary)]">{it.vehicle.name}</span>
                    <VehicleIssueStatusBadge status={it.status} />
                    {!it.canContinue && (
                      <span className="rounded-full bg-[#FEE2E2] px-2 py-0.5 text-xs font-semibold text-[#991B1B]">
                        Tidak bisa jalan
                      </span>
                    )}
                  </div>
                  <p className="mt-1.5 whitespace-pre-line text-sm text-[var(--text-primary)]">{it.description}</p>
                  <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[var(--text-secondary)]">
                    <span>{it.reportedBy.name} · {formatDateTime(it.createdAt)}</span>
                    {it.location && (
                      <span className="inline-flex items-center gap-1"><MapPin className="h-3 w-3" />{it.location}</span>
                    )}
                    {it.bookingId && (
                      <Link href={`/booking/${it.bookingId}`} className="text-[var(--primary)] hover:underline">
                        Booking #{it.bookingId}
                      </Link>
                    )}
                  </p>
                  {it.photos.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {it.photos.map((p, i) => {
                        const url = resolveFileUrl(p)
                        return (
                          <button
                            key={i}
                            type="button"
                            onClick={() => url && setPreview(url)}
                            className="h-16 w-16 overflow-hidden rounded-lg border border-[var(--border-card)]"
                          >
                            <SafeImage src={url} alt={`Foto ${i + 1}`} className="h-full w-full object-cover" fallback={<ImageOff className="h-4 w-4" />} />
                          </button>
                        )
                      })}
                    </div>
                  )}
                  {it.status !== 'OPEN' && (
                    <p className="mt-2 text-xs text-[var(--text-secondary)]">
                      {it.handledBy} · {it.handledAt ? formatDateTime(it.handledAt) : ''}
                      {it.handledNote ? ` - ${it.handledNote}` : ''}
                    </p>
                  )}
                </div>
                <div className="flex shrink-0 flex-wrap gap-2">
                  {it.status === 'OPEN' ? (
                    <>
                      <AppButton
                        size="sm"
                        leftIcon={<Wrench className="h-4 w-4" />}
                        loading={convert.isPending && convert.variables === it.id}
                        onClick={() => convert.mutate(it.id)}
                      >
                        Buat Pengajuan
                      </AppButton>
                      <AppButton size="sm" variant="secondary" leftIcon={<Ban className="h-4 w-4" />} onClick={() => setDismissing(it)}>
                        Tutup
                      </AppButton>
                    </>
                  ) : (
                    it.maintenanceId && (
                      <Link href={`/maintenance/${it.maintenanceId}`}>
                        <AppButton size="sm" variant="secondary" rightIcon={<ArrowRight className="h-4 w-4" />}>
                          Maintenance #{it.maintenanceId}
                        </AppButton>
                      </Link>
                    )
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {data?.pagination && data.pagination.totalPages > 1 && (
        <Pagination pagination={data.pagination} onPageChange={setPage} />
      )}

      <DismissDialog issue={dismissing} onClose={() => setDismissing(null)} />

      <Dialog open={!!preview} onOpenChange={(o) => !o && setPreview(null)}>
        <DialogContent className="max-w-2xl rounded-2xl p-2 shadow-[var(--shadow-modal)]">
          {preview && <SafeImage src={preview} alt="Foto laporan" className="max-h-[80vh] w-full rounded-xl object-contain" fallback={<ImageOff className="h-10 w-10" />} />}
        </DialogContent>
      </Dialog>
    </div>
  )
}

const DismissDialog = ({ issue, onClose }: { issue: VehicleIssue | null; onClose: () => void }) => {
  const [note, setNote] = useState('')
  const dismiss = useDismissVehicleIssue()
  return (
    <FormDialog
      open={!!issue}
      onOpenChange={(o) => {
        if (!o) {
          setNote('')
          dismiss.reset()
          onClose()
        }
      }}
      title="Tutup Laporan Kendala"
      icon={<Ban className="h-5 w-5 text-[var(--text-secondary)]" />}
      footer={
        <>
          <AppButton variant="secondary" onClick={onClose}>Batal</AppButton>
          <AppButton
            loading={dismiss.isPending}
            disabled={!note.trim()}
            onClick={() =>
              issue &&
              dismiss.mutate(
                { id: issue.id, note: note.trim() },
                {
                  onSuccess: () => {
                    setNote('')
                    onClose()
                  },
                },
              )
            }
          >
            Tutup Laporan
          </AppButton>
        </>
      }
    >
      <ErrorAlert error={dismiss.error} />
      <p className="text-sm text-[var(--text-secondary)]">Supir pelapor akan menerima notifikasi beserta catatan ini.</p>
      <InputTextArea label="Catatan" required rows={3} placeholder="mis. Sudah ditangani di lokasi" value={note} onChange={(e) => setNote(e.target.value)} />
    </FormDialog>
  )
}

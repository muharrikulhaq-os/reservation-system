'use client'

import { useState } from 'react'
import { Car, CheckCircle2 } from 'lucide-react'
import { Card, CardHeader } from '@/components/common'
import { PageHeader } from '@/components/shared'
import { AppButton } from '@/components/ui-custom'
import { formatDate, formatCurrency, formatNumber, resolveFileUrl } from '@/lib'
import {
  isMaintenanceCompleted,
  maintenanceStatusCfg,
  maintenanceTypeLabel,
} from '@/constants'
import { useMaintenanceRecord } from '../hooks/useMaintenance'
import { CompleteMaintenanceModal } from './CompleteMaintenanceModal'

const Row = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <div className="flex items-start justify-between gap-4 py-2.5">
    <span className="text-xs font-semibold uppercase tracking-[0.06em] text-[var(--text-secondary)]">
      {label}
    </span>
    <span className="text-right text-sm text-[var(--text-primary)]">{value}</span>
  </div>
)

export const MaintenanceDetail = ({ id }: { id: number }) => {
  const { data, isLoading, refetch } = useMaintenanceRecord(id)
  const [completeOpen, setCompleteOpen] = useState(false)

  if (isLoading) {
    return (
      <p className="py-16 text-center text-sm text-[var(--text-secondary)]">Memuat…</p>
    )
  }

  if (!data) {
    return (
      <p className="py-16 text-center text-sm text-[var(--text-secondary)]">
        Data maintenance tidak ditemukan.
      </p>
    )
  }

  const isOngoing = !isMaintenanceCompleted(data.status)
  const statusCfg = maintenanceStatusCfg(data.status)
  const costNum = data.totalCost ? Number(data.totalCost) : null
  const photos = (data.proofPhotos ?? [])
    .map((p) => resolveFileUrl(p))
    .filter((u): u is string => !!u)

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Detail Maintenance"
        backHref="/maintenance"
        actions={
          isOngoing ? (
            <AppButton
              leftIcon={<CheckCircle2 className="h-4 w-4" />}
              onClick={() => setCompleteOpen(true)}
            >
              Selesaikan
            </AppButton>
          ) : undefined
        }
      />

      <Card>
        <CardHeader
          title={`${data.vehicleName} · ${data.plateNumber}`}
          action={
            <span
              className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold"
              style={{ backgroundColor: statusCfg.bg, color: statusCfg.text }}
            >
              <span
                className="h-1.5 w-1.5 rounded-full"
                style={{ backgroundColor: statusCfg.dot }}
              />
              {statusCfg.label}
            </span>
          }
        />

        <div className="mb-4 flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--bg-subtle)] text-[var(--text-secondary)]">
            <Car className="h-5 w-5" />
          </span>
          <span className="rounded-full bg-[var(--bg-subtle)] px-2.5 py-0.5 text-xs font-semibold text-[var(--text-primary)]">
            {maintenanceTypeLabel(data.type)}
          </span>
        </div>

        <div className="divide-y divide-[var(--border-divider)]">
          <Row label="Deskripsi" value={data.description} />
          <Row label="Lokasi" value={data.location || '-'} />
          <Row label="Vendor" value={data.vendorName || '-'} />
          <Row label="Mulai" value={formatDate(data.startDate)} />
          <Row
            label="Selesai"
            value={data.endDate ? formatDate(data.endDate) : 'Berjalan'}
          />
          <Row
            label="Odometer"
            value={data.odometer ? `${formatNumber(data.odometer)} km` : '-'}
          />
          <Row
            label="Biaya"
            value={costNum != null && !Number.isNaN(costNum) ? formatCurrency(costNum) : '-'}
          />
          <Row label="Dicatat oleh" value={data.createdBy ?? '-'} />
        </div>
      </Card>

      {/* Galeri bukti */}
      {photos.length > 0 && (
        <Card>
          <CardHeader title="Bukti Pekerjaan" />
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {photos.map((url, i) => (
              <a
                key={i}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="block aspect-square overflow-hidden rounded-xl border border-[var(--border-card)]"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt={`Bukti ${i + 1}`} className="h-full w-full object-cover" />
              </a>
            ))}
          </div>
        </Card>
      )}

      <CompleteMaintenanceModal
        maintenance={data}
        open={completeOpen}
        onOpenChange={setCompleteOpen}
        onSuccess={refetch}
      />
    </div>
  )
}

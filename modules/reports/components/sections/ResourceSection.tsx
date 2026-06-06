'use client'

import { Car, DoorOpen } from 'lucide-react'
import { Card, CardHeader } from '@/components/common'
import {
  DataTable,
  createColumnHelper,
  type ColumnDef,
  Badge,
  ResourceStatusBadge,
} from '@/components/shared'
import { RESOURCE_TYPE } from '@/constants'
import { formatDateTime } from '@/lib'
import type { ReportDateParams, ResourceUsageReport } from '@/types'
import { useResourceUsage, useResourceAvailability } from '../../hooks/useReports'

// ─────────────────────────────────────────
// TAB: RESOURCE
// ─────────────────────────────────────────

const ch = createColumnHelper<ResourceUsageReport>()

const usageColumns: ColumnDef<ResourceUsageReport, unknown>[] = [
  ch.accessor('resourceName', {
    header: 'Resource',
    cell: ({ getValue }) => (
      <span className="text-sm font-medium text-[var(--text-primary)]">{getValue()}</span>
    ),
  }),
  ch.accessor('resourceType', {
    header: 'Tipe',
    size: 120,
    cell: ({ getValue }) =>
      getValue() === RESOURCE_TYPE.VEHICLE ? (
        <Badge variant="info">Kendaraan</Badge>
      ) : (
        <Badge variant="default">Ruangan</Badge>
      ),
  }),
  ch.accessor('totalBookings', {
    header: 'Booking',
    size: 100,
    cell: ({ getValue }) => (
      <span className="text-sm text-[var(--text-secondary)]">{getValue()}</span>
    ),
  }),
  ch.accessor('totalHoursUsed', {
    header: 'Jam Pakai',
    size: 110,
    cell: ({ getValue }) => (
      <span className="text-sm text-[var(--text-secondary)]">{getValue()} jam</span>
    ),
  }),
  ch.accessor('utilizationRate', {
    header: 'Utilisasi',
    size: 180,
    cell: ({ getValue }) => {
      const rate = Math.min(100, Math.max(0, getValue()))
      return (
        <div className="flex items-center gap-2">
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[var(--bg-subtle)]">
            <div
              className="h-full rounded-full bg-[var(--primary)]"
              style={{ width: `${rate}%` }}
            />
          </div>
          <span className="w-9 shrink-0 text-right text-xs font-semibold text-[var(--text-primary)]">
            {rate}%
          </span>
        </div>
      )
    },
  }),
] as ColumnDef<ResourceUsageReport, unknown>[]

export const ResourceSection = ({ range }: { range: ReportDateParams }) => {
  const { data: usage, isLoading } = useResourceUsage(range)
  const { data: availability } = useResourceAvailability()

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader title="Utilisasi Resource" description="Periode terpilih" />
        <DataTable
          data={usage ?? []}
          columns={usageColumns}
          isLoading={isLoading}
          emptyMessage="Belum ada data utilisasi"
        />
      </Card>

      <Card>
        <CardHeader title="Status Real-time" description="Ketersediaan resource saat ini" />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {(availability ?? []).map((r) => (
            <div
              key={r.resourceId}
              className="rounded-xl border border-[var(--border-card)] bg-[var(--bg-subtle)] p-4"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--bg-card)]">
                    {r.type === RESOURCE_TYPE.VEHICLE ? (
                      <Car className="h-4 w-4 text-[var(--text-secondary)]" />
                    ) : (
                      <DoorOpen className="h-4 w-4 text-[var(--text-secondary)]" />
                    )}
                  </div>
                  <span className="text-sm font-semibold text-[var(--text-primary)]">{r.name}</span>
                </div>
                <ResourceStatusBadge status={r.status} />
              </div>

              <div className="mt-3 space-y-1 text-xs text-[var(--text-secondary)]">
                <p>
                  Sedang dipakai:{' '}
                  {r.currentBooking ? (
                    <span className="text-[var(--text-primary)]">
                      {r.currentBooking.user} — selesai {formatDateTime(r.currentBooking.endDate)}
                    </span>
                  ) : (
                    <span className="text-[var(--text-disabled)]">—</span>
                  )}
                </p>
                <p>
                  Booking berikutnya:{' '}
                  {r.nextBooking ? (
                    <span className="text-[var(--text-primary)]">
                      {r.nextBooking.user} — mulai {formatDateTime(r.nextBooking.startDate)}
                    </span>
                  ) : (
                    <span className="text-[var(--text-disabled)]">—</span>
                  )}
                </p>
                <p>
                  Idle bulan ini:{' '}
                  <span className="text-[var(--text-primary)]">{r.idleHoursThisMonth} jam</span>
                </p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}

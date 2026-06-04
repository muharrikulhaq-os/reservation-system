'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  CalendarDays,
  Car,
  CheckCircle2,
  Clock,
  DoorOpen,
  XCircle,
} from 'lucide-react'
import { Card, CardHeader } from '@/components/common'
import { UserAvatar } from '@/components/shared'
import { AppButton } from '@/components/ui-custom'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { StatCard } from '@/modules/dashboard/components/StatCard'
import { formatDate } from '@/lib'
import { BOOKING_STATUS, RESOURCE_TYPE } from '@/constants'
import type { Booking } from '@/types'
import {
  useBookings,
  useApproveBooking,
  useRejectBooking,
} from '../hooks/useBookings'

// ─────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────

const isToday = (iso: string | null) => {
  if (!iso) return false
  const d = new Date(iso)
  const now = new Date()
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  )
}

const monthBounds = () => {
  const now = new Date()
  const start = new Date(now.getFullYear(), now.getMonth(), 1)
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59)
  return { start: start.toISOString(), end: end.toISOString() }
}

// ─────────────────────────────────────────
// APPROVAL QUEUE (admin)
// ─────────────────────────────────────────

export const ApprovalQueue = () => {
  const [processedTab, setProcessedTab] = useState<
    typeof BOOKING_STATUS.APPROVED | typeof BOOKING_STATUS.REJECTED
  >(BOOKING_STATUS.APPROVED)

  const month = monthBounds()

  const pendingQ = useBookings({ status: BOOKING_STATUS.PENDING, limit: 100 })
  const approvedQ = useBookings({ status: BOOKING_STATUS.APPROVED, limit: 100 })
  const rejectedQ = useBookings({ status: BOOKING_STATUS.REJECTED, limit: 100 })
  const monthQ = useBookings({
    startDate: month.start,
    endDate: month.end,
    limit: 1,
  })

  const approve = useApproveBooking()
  const reject = useRejectBooking()

  const pending = pendingQ.data?.data ?? []
  const approved = approvedQ.data?.data ?? []
  const rejected = rejectedQ.data?.data ?? []

  const stats = {
    waiting: pendingQ.data?.pagination.total ?? 0,
    approvedToday: approved.filter((b) => isToday(b.approvedAt)).length,
    rejectedToday: rejected.filter((b) => isToday(b.updatedAt)).length,
    monthTotal: monthQ.data?.pagination.total ?? 0,
  }

  const handleApprove = (booking: Booking) =>
    approve.mutate({ id: booking.id, payload: undefined })

  const handleReject = (booking: Booking) => {
    const note = window.prompt('Alasan penolakan:')
    if (note && note.trim()) {
      reject.mutate({ id: booking.id, payload: { note: note.trim() } })
    }
  }

  const processedList =
    processedTab === BOOKING_STATUS.APPROVED ? approved : rejected

  return (
    <div className="flex flex-col gap-6">
      {/* ── Stat cards ── */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Menunggu"
          value={stats.waiting}
          iconBg="#FEF9C3"
          icon={<Clock className="h-5 w-5" style={{ color: '#854D0E' }} />}
        />
        <StatCard
          label="Disetujui Hari Ini"
          value={stats.approvedToday}
          iconBg="#DCFCE7"
          icon={
            <CheckCircle2 className="h-5 w-5" style={{ color: '#166534' }} />
          }
        />
        <StatCard
          label="Ditolak Hari Ini"
          value={stats.rejectedToday}
          iconBg="#FEE2E2"
          icon={<XCircle className="h-5 w-5" style={{ color: '#991B1B' }} />}
        />
        <StatCard
          label="Total Bulan Ini"
          value={stats.monthTotal}
          iconBg="var(--primary-light)"
          icon={
            <CalendarDays
              className="h-5 w-5"
              style={{ color: 'var(--primary)' }}
            />
          }
        />
      </div>

      {/* ── Antrean menunggu ── */}
      <Card>
        <CardHeader
          title="Menunggu Persetujuan"
          description="Booking yang membutuhkan tindakan Anda"
        />

        {pendingQ.isLoading ? (
          <p className="py-8 text-center text-sm text-[var(--text-secondary)]">
            Memuat…
          </p>
        ) : pending.length === 0 ? (
          <p className="py-8 text-center text-sm text-[var(--text-secondary)]">
            Tidak ada booking yang menunggu persetujuan
          </p>
        ) : (
          <ul className="divide-y divide-[var(--border-divider)]">
            {pending.map((booking) => (
              <QueueRow
                key={booking.id}
                booking={booking}
                onApprove={() => handleApprove(booking)}
                onReject={() => handleReject(booking)}
                approving={
                  approve.isPending && approve.variables?.id === booking.id
                }
                rejecting={
                  reject.isPending && reject.variables?.id === booking.id
                }
              />
            ))}
          </ul>
        )}
      </Card>

      {/* ── Baru diproses ── */}
      <Card>
        <CardHeader title="Baru Diproses" />

        <Tabs
          value={processedTab}
          onValueChange={(v) =>
            setProcessedTab(
              v as
                | typeof BOOKING_STATUS.APPROVED
                | typeof BOOKING_STATUS.REJECTED,
            )
          }
          className="mb-4"
        >
          <TabsList className="rounded-lg bg-[var(--bg-subtle)] p-1">
            <TabsTrigger
              value={BOOKING_STATUS.APPROVED}
              className="rounded-md px-4 text-sm font-medium text-[var(--text-secondary)] data-[state=active]:bg-[var(--bg-card)] data-[state=active]:text-[var(--primary)] data-[state=active]:shadow-sm"
            >
              Disetujui
            </TabsTrigger>
            <TabsTrigger
              value={BOOKING_STATUS.REJECTED}
              className="rounded-md px-4 text-sm font-medium text-[var(--text-secondary)] data-[state=active]:bg-[var(--bg-card)] data-[state=active]:text-[var(--primary)] data-[state=active]:shadow-sm"
            >
              Ditolak
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {processedList.length === 0 ? (
          <p className="py-8 text-center text-sm text-[var(--text-secondary)]">
            Belum ada data
          </p>
        ) : (
          <ul className="divide-y divide-[var(--border-divider)]">
            {processedList.slice(0, 10).map((booking) => (
              <QueueRow key={booking.id} booking={booking} />
            ))}
          </ul>
        )}
      </Card>
    </div>
  )
}

// ─────────────────────────────────────────
// QUEUE ROW
// ─────────────────────────────────────────

interface QueueRowProps {
  booking: Booking
  onApprove?: () => void
  onReject?: () => void
  approving?: boolean
  rejecting?: boolean
}

const QueueRow = ({
  booking,
  onApprove,
  onReject,
  approving,
  rejecting,
}: QueueRowProps) => {
  const isVehicle = booking.resource.type === RESOURCE_TYPE.VEHICLE
  const ResourceIcon = isVehicle ? Car : DoorOpen
  const showActions = !!onApprove || !!onReject

  return (
    <li className="flex flex-wrap items-center gap-4 py-3 first:pt-0">
      {/* Kiri: peminjam */}
      <div className="flex min-w-0 flex-1 items-center gap-2.5">
        <UserAvatar name={booking.user.name} size="md" />
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-[var(--text-primary)]">
            {booking.user.name}
          </p>
          <p className="truncate text-xs text-[var(--text-secondary)]">
            {booking.user.department} · Diajukan {formatDate(booking.createdAt)}
          </p>
        </div>
      </div>

      {/* Tengah: resource + tanggal */}
      <div className="flex min-w-0 flex-1 items-center gap-2.5">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--bg-subtle)] text-[var(--text-secondary)]">
          <ResourceIcon className="h-4 w-4" />
        </span>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <p className="truncate text-sm font-medium text-[var(--text-primary)]">
              {booking.resource.name}
            </p>
            <span className="shrink-0 rounded-full bg-[var(--bg-subtle)] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[var(--text-secondary)]">
              {isVehicle ? 'Kendaraan' : 'Ruangan'}
            </span>
          </div>
          <p className="truncate text-xs text-[var(--text-secondary)]">
            {formatDate(booking.startDate)} – {formatDate(booking.endDate)}
          </p>
        </div>
      </div>

      {/* Kanan: aksi */}
      <div className="flex shrink-0 items-center gap-2">
        {showActions && (
          <>
            <AppButton
              size="sm"
              variant="primary"
              loading={approving}
              disabled={approving || rejecting}
              onClick={onApprove}
              className="bg-[var(--success)] hover:bg-green-700"
            >
              Setujui
            </AppButton>
            <AppButton
              size="sm"
              variant="secondary"
              loading={rejecting}
              disabled={approving || rejecting}
              onClick={onReject}
              className="border-[var(--danger)] text-[var(--danger)] hover:bg-red-50"
            >
              Tolak
            </AppButton>
          </>
        )}
        <Link
          href={`/booking/${booking.id}`}
          className="text-xs font-semibold text-[var(--primary)] hover:underline"
        >
          Detail
        </Link>
      </div>
    </li>
  )
}

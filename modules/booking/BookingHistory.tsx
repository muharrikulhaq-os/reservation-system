'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { AlertCircle, Building2, Car, Download, FileSpreadsheet, Search } from 'lucide-react'
import { Card } from '@/components/common'
import { BookingStatusBadge, BookingTypeBadge, DataTable, PageHeader, createColumnHelper } from '@/components/shared'
import type { ColumnDef } from '@/components/shared'
import type { SortingState } from '@tanstack/react-table'
import { AppButton, AppCheckbox, InputDate, InputSelect, InputText } from '@/components/ui-custom'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { BOOKING_HISTORY_SECTIONS, BOOKING_STATUS_CONFIG, RESOURCE_TYPE } from '@/constants'
import { useDebounce } from '@/hooks'
import { cn, formatDateTime, getErrorMessage, wibYMD } from '@/lib'
import type {
  BookingHistoryItem,
  BookingHistoryParams,
  BookingHistorySection,
  BookingStatus,
  BookingType,
  ResourceType,
} from '@/types'
import { useBookingHistory, useExportBookingHistory } from './hooks/useBookings'

// ─────────────────────────────────────────
// RIWAYAT BOOKING (admin)
// Daftar seluruh booking per periode dengan filter gabungan (jenis resource,
// SPD/Non-SPD, beberapa status, kata kunci) + ekspor Excel banyak sheet
// (pilih bagian yang disertakan; default semua). Backend:
// GET /bookings/history & /bookings/history/export.
// ─────────────────────────────────────────

const MAX_DAYS = 366

const monthRange = () => {
  const today = wibYMD(new Date())
  const [y, m] = today.split('-').map(Number)
  const last = new Date(Date.UTC(y, m, 0)).getUTCDate()
  const mm = String(m).padStart(2, '0')
  return { from: `${y}-${mm}-01`, to: `${y}-${mm}-${String(last).padStart(2, '0')}` }
}

const daysBetween = (a: string, b: string) =>
  Math.round((Date.parse(`${b}T00:00:00Z`) - Date.parse(`${a}T00:00:00Z`)) / 86_400_000)

const RESOURCE_OPTIONS = [
  { value: RESOURCE_TYPE.VEHICLE, label: 'Kendaraan' },
  { value: RESOURCE_TYPE.ROOM, label: 'Ruangan' },
]
const TYPE_OPTIONS = [
  { value: 'SPD', label: 'SPD' },
  { value: 'NON_SPD', label: 'Non-SPD' },
]
const STATUS_KEYS = Object.keys(BOOKING_STATUS_CONFIG) as BookingStatus[]

const ch = createColumnHelper<BookingHistoryItem>()

const columns = [
  ch.accessor('id', {
    header: 'No.',
    cell: (i) => (
      <Link href={`/booking/${i.getValue()}`} data-row-open className="font-semibold text-[var(--primary)] hover:underline">
        #{i.getValue()}
      </Link>
    ),
  }),
  ch.accessor('startDate', {
    header: 'Jadwal',
    cell: (i) => (
      <div className="min-w-[150px] text-xs">
        <p className="text-[var(--text-primary)]">{formatDateTime(i.getValue())}</p>
        <p className="text-[var(--text-secondary)]">s/d {formatDateTime(i.row.original.endDate)}</p>
      </div>
    ),
  }),
  ch.accessor('resourceName', {
    header: 'Resource',
    cell: (i) => {
      const r = i.row.original
      const isVehicle = r.resourceType === RESOURCE_TYPE.VEHICLE
      const Icon = isVehicle ? Car : Building2
      return (
        <div className="flex min-w-[160px] items-start gap-2">
          <Icon className="mt-0.5 h-4 w-4 shrink-0 text-[var(--text-disabled)]" />
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-[var(--text-primary)]">{r.resourceName}</p>
            {r.plateNumber && <p className="text-xs text-[var(--text-secondary)]">{r.plateNumber}</p>}
            {/* SPD/Non-SPD (kendaraan) - dulu kolom "Tipe" tersendiri. */}
            {isVehicle && (
              <div className="mt-1">
                <BookingTypeBadge bookingType={r.bookingType} status={r.status} />
              </div>
            )}
          </div>
        </div>
      )
    },
  }),
  ch.accessor((r) => r.requester.name, {
    id: 'requester',
    header: 'Pemohon & Penumpang',
    cell: (i) => {
      const r = i.row.original
      return (
        <div className="min-w-[160px] max-w-[220px]">
          <p className="truncate text-sm text-[var(--text-primary)]">{i.getValue()}</p>
          <p className="truncate text-xs text-[var(--text-secondary)]">{r.requester.department}</p>
          {r.passengers.length > 0 && (
            <p
              className="mt-1 line-clamp-2 text-xs text-[var(--text-secondary)]"
              title={r.passengers.map((p) => p.name).join(', ')}
            >
              <span className="font-medium">+{r.passengers.length} penumpang:</span>{' '}
              {r.passengers.map((p) => (p.isGuest ? `${p.name} (tamu)` : p.name)).join(', ')}
            </p>
          )}
        </div>
      )
    },
  }),
  ch.accessor('purpose', {
    header: 'Tujuan',
    cell: (i) => {
      const r = i.row.original
      const route = [r.pickupLocation, r.destination].filter(Boolean).join(' → ')
      return (
        <div className="min-w-[160px] max-w-[260px]">
          <p className="line-clamp-2 text-sm text-[var(--text-primary)]" title={r.purpose}>
            {r.purpose || '-'}
          </p>
          {route && (
            <p className="mt-0.5 line-clamp-2 text-xs text-[var(--text-secondary)]" title={route}>
              {route}
            </p>
          )}
        </div>
      )
    },
  }),
  ch.accessor((r) => (r.resourceType === RESOURCE_TYPE.VEHICLE ? r.driverName : r.roomKeepers), {
    id: 'handler',
    header: 'Supir / Penjaga',
    cell: (i) => <span className="text-sm text-[var(--text-secondary)]">{i.getValue() || '-'}</span>,
  }),
  ch.accessor('status', {
    header: 'Status',
    cell: (i) => <BookingStatusBadge status={i.getValue()} />,
  }),
] as ColumnDef<BookingHistoryItem>[]

export const BookingHistory = () => {
  const initial = useMemo(monthRange, [])
  const [from, setFrom] = useState(initial.from)
  const [to, setTo] = useState(initial.to)
  const [resourceType, setResourceType] = useState<ResourceType | ''>('')
  const [bookingType, setBookingType] = useState<BookingType | ''>('')
  const [statuses, setStatuses] = useState<BookingStatus[]>([])
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(20)
  // Urutan dari header kolom - dikerjakan server (id kolom = kunci sort backend).
  const [sorting, setSorting] = useState<SortingState>([])
  const [exportOpen, setExportOpen] = useState(false)
  const debounced = useDebounce(search.trim(), 300)

  const rangeError = !from || !to
    ? 'Pilih tanggal awal dan akhir.'
    : to < from
      ? 'Tanggal akhir tidak boleh sebelum tanggal awal.'
      : daysBetween(from, to) > MAX_DAYS
        ? 'Periode maksimal 1 tahun.'
        : null

  const params: BookingHistoryParams = {
    from,
    to,
    resourceType: resourceType || undefined,
    // SPD/Non-SPD hanya bermakna untuk kendaraan.
    bookingType: resourceType === RESOURCE_TYPE.ROOM ? undefined : bookingType || undefined,
    status: statuses.length ? statuses.join(',') : undefined,
    search: debounced || undefined,
    sortBy: sorting[0]?.id,
    sortOrder: sorting[0] ? (sorting[0].desc ? 'desc' : 'asc') : undefined,
    page,
    limit,
  }
  const { data, isLoading, isFetching } = useBookingHistory(params, !rangeError)
  const total = rangeError ? 0 : (data?.pagination.total ?? 0)

  // Setiap perubahan filter kembali ke halaman 1.
  const reset = <T,>(set: (v: T) => void) => (v: T) => {
    set(v)
    setPage(1)
  }
  const toggleStatus = (s: BookingStatus) => {
    setStatuses((cur) => (cur.includes(s) ? cur.filter((x) => x !== s) : [...cur, s]))
    setPage(1)
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Riwayat Booking"
        description="Seluruh booking per periode - saring lalu ekspor ke Excel lengkap dengan BBM, laporan, dan link foto."
        actions={
          <AppButton
            leftIcon={<FileSpreadsheet className="h-4 w-4" />}
            disabled={!!rangeError || total === 0}
            onClick={() => setExportOpen(true)}
          >
            Ekspor Excel
          </AppButton>
        }
      />

      <Card>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <InputDate label="Dari Tanggal" required value={from} max={to || undefined} onChange={(e) => reset(setFrom)(e.target.value)} />
          <InputDate label="Sampai Tanggal" required value={to} min={from || undefined} onChange={(e) => reset(setTo)(e.target.value)} />
          <InputSelect
            label="Jenis Resource"
            placeholder="Semua"
            options={RESOURCE_OPTIONS}
            value={resourceType}
            onChange={(e) => reset(setResourceType)((e.target.value || '') as ResourceType | '')}
          />
          <InputSelect
            label="Tipe Booking"
            placeholder="Semua"
            options={TYPE_OPTIONS}
            value={resourceType === RESOURCE_TYPE.ROOM ? '' : bookingType}
            disabled={resourceType === RESOURCE_TYPE.ROOM}
            hint={resourceType === RESOURCE_TYPE.ROOM ? 'Khusus kendaraan' : undefined}
            onChange={(e) => reset(setBookingType)((e.target.value || '') as BookingType | '')}
          />
        </div>

        <div className="mt-4">
          <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-[0.07em] text-[var(--text-secondary)]">
            Status {statuses.length === 0 && <span className="normal-case tracking-normal">(semua)</span>}
          </p>
          <div className="flex flex-wrap gap-2">
            {STATUS_KEYS.map((s) => {
              const on = statuses.includes(s)
              return (
                <button
                  key={s}
                  type="button"
                  onClick={() => toggleStatus(s)}
                  aria-pressed={on}
                  className={cn(
                    'rounded-full border px-3 py-1 text-xs font-semibold transition-colors',
                    on
                      ? 'border-[var(--primary)] bg-[var(--primary-light)] text-[var(--primary)]'
                      : 'border-[var(--border-input)] bg-[var(--bg-card)] text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)]',
                  )}
                >
                  {BOOKING_STATUS_CONFIG[s].label}
                </button>
              )
            })}
            {statuses.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  setStatuses([])
                  setPage(1)
                }}
                className="px-2 text-xs font-medium text-[var(--primary)] hover:underline"
              >
                Hapus pilihan
              </button>
            )}
          </div>
        </div>

        <div className="mt-4 max-w-sm">
          <InputText
            value={search}
            onChange={(e) => reset(setSearch)(e.target.value)}
            placeholder="Cari resource, pemohon, atau no. booking"
            leftIcon={<Search className="h-4 w-4" />}
          />
        </div>

        {rangeError && (
          <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{rangeError}</span>
          </div>
        )}
      </Card>

      <Card>
        <p className="mb-3 text-sm text-[var(--text-secondary)]">
          {rangeError ? '-' : isFetching && !data ? 'Memuat…' : `${total} booking`}
        </p>
        <DataTable
          data={rangeError ? [] : (data?.data ?? [])}
          columns={columns}
          isLoading={isLoading && !rangeError}
          pagination={rangeError ? undefined : data?.pagination}
          onPageChange={setPage}
          onLimitChange={(l) => {
            setLimit(l)
            setPage(1)
          }}
          emptyMessage="Tidak ada booking pada periode & filter ini"
          manualSorting
          sorting={sorting}
          onSortingChange={(s) => {
            setSorting(s)
            setPage(1)
          }}
        />
      </Card>

      <ExportDialog open={exportOpen} onOpenChange={setExportOpen} params={params} total={total} />
    </div>
  )
}

// ─────────────────────────────────────────
// DIALOG EKSPOR - pilih bagian (default semua)
// ─────────────────────────────────────────

const ExportDialog = ({
  open,
  onOpenChange,
  params,
  total,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  params: BookingHistoryParams
  total: number
}) => {
  const all = BOOKING_HISTORY_SECTIONS.map((s) => s.key)
  const [sections, setSections] = useState<BookingHistorySection[]>(all)
  const exp = useExportBookingHistory()

  const toggle = (k: BookingHistorySection, on: boolean) =>
    setSections((cur) => (on ? all.filter((x) => cur.includes(x) || x === k) : cur.filter((x) => x !== k)))

  const download = async () => {
    try {
      const { blob, name } = await exp.mutateAsync({ params, sections })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = name
      document.body.appendChild(a)
      a.click()
      a.remove()
      setTimeout(() => URL.revokeObjectURL(url), 60_000)
      onOpenChange(false)
    } catch {
      // ditampilkan via exp.error
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto rounded-2xl p-6 shadow-[var(--shadow-modal)] sm:max-w-lg">
        <DialogHeader>
          <DialogTitle
            className="text-lg font-bold text-[var(--text-primary)]"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            Ekspor Riwayat Booking
          </DialogTitle>
        </DialogHeader>

        <div className="mt-2 space-y-4">
          {exp.error && (
            <div className="flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{getErrorMessage(exp.error)}</span>
            </div>
          )}

          <p className="text-sm text-[var(--text-secondary)]">
            <b className="text-[var(--text-primary)]">{total} booking</b> sesuai filter saat ini akan diekspor. Sheet{' '}
            <b className="text-[var(--text-primary)]">Info</b> dan <b className="text-[var(--text-primary)]">Booking</b> selalu
            disertakan; pilih bagian lainnya:
          </p>

          <div className="flex gap-3 text-xs font-medium">
            <button type="button" className="text-[var(--primary)] hover:underline" onClick={() => setSections(all)}>
              Pilih semua
            </button>
            <button type="button" className="text-[var(--primary)] hover:underline" onClick={() => setSections([])}>
              Kosongkan
            </button>
          </div>

          <ul className="divide-y divide-[var(--border-divider)] rounded-xl border border-[var(--border-card)]">
            {BOOKING_HISTORY_SECTIONS.map((s) => (
              <li key={s.key}>
                <label className="flex cursor-pointer items-start gap-3 px-4 py-3 hover:bg-[var(--bg-subtle)]">
                  <AppCheckbox
                    checked={sections.includes(s.key)}
                    onCheckedChange={(c) => toggle(s.key, c)}
                    className="mt-0.5"
                  />
                  <span className="min-w-0">
                    <span className="block text-sm font-medium text-[var(--text-primary)]">{s.label}</span>
                    <span className="block text-xs text-[var(--text-secondary)]">{s.description}</span>
                  </span>
                </label>
              </li>
            ))}
          </ul>

          <div className="flex gap-3 pt-1">
            <AppButton variant="secondary" fullWidth disabled={exp.isPending} onClick={() => onOpenChange(false)}>
              Batal
            </AppButton>
            <AppButton
              fullWidth
              leftIcon={<Download className="h-4 w-4" />}
              loading={exp.isPending}
              disabled={exp.isPending || total === 0}
              onClick={download}
            >
              Unduh Excel
            </AppButton>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

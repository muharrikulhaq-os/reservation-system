'use client'

import { useMemo, useState } from 'react'
import {
  AlertCircle,
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
} from 'lucide-react'
import { AppButton, TimePicker } from '@/components/ui-custom'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Separator } from '@/components/ui/separator'
import { useBookings } from '@/modules/booking/hooks/useBookings'
import { BOOKING_STATUS, BOOKING_STATUS_CONFIG } from '@/constants'
import type { BookingStatus, ResourceStatus } from '@/types'
import { cn } from '@/lib/utils'

// ─────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────

export interface CalendarEvent {
  id: number
  title: string
  type: 'booking' | 'maintenance'
  status?: BookingStatus | ResourceStatus
  startTime: string // "08:00"
  endTime: string // "18:00"
  startDate: string // ISO full - untuk cek overlap
  endDate: string // ISO full
}

export interface CalendarDayData {
  date: string // "YYYY-MM-DD"
  isAvailable: boolean
  isFullDay: boolean // true jika seluruh hari tidak tersedia
  events: CalendarEvent[]
}

/** Hasil pemilihan tanggal + jam */
export interface DateTimeRange {
  startDate: Date
  endDate: Date
  startTime: string // "08:00"
  endTime: string // "18:00"
}

export interface AvailabilityCalendarProps {
  data?: CalendarDayData[]
  resourceId?: number
  resourceType?: 'VEHICLE' | 'ROOM'
  mode?: 'single' | 'range' | 'view'
  selectedDate?: Date | null
  onSelectDate?: (date: Date) => void
  /** Dipanggil saat user menekan "Konfirmasi Jadwal" (tanggal + jam) */
  onSelectDateTime?: (range: DateTimeRange) => void
  /** Dipanggil saat range yang dipilih bentrok dengan event yang memblokir */
  onConflictDetected?: (conflicts: CalendarEvent[]) => void
  minDate?: Date
  maxDate?: Date
  showHeader?: boolean
  className?: string
  /** Booking yang tidak boleh dianggap blocking - mis. saat menjadwalkan
   *  ulang booking yang sedang di-merge, dia tak boleh bentrok dgn dirinya sendiri. */
  excludeBookingIds?: number[]
}

// ─────────────────────────────────────────
// TIME OPTIONS - 00:00 s/d 23:30, interval 30 menit
// ─────────────────────────────────────────

const TIME_OPTIONS: string[] = []
for (let h = 0; h < 24; h++) {
  for (let m = 0; m < 60; m += 30) {
    TIME_OPTIONS.push(
      `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`,
    )
  }
}

// ─────────────────────────────────────────
// DATE HELPERS (native Date - tanpa library)
// ─────────────────────────────────────────

const WEEKDAYS = ['MIN', 'SEN', 'SEL', 'RAB', 'KAM', 'JUM', 'SAB'] as const

const monthLabelFmt = new Intl.DateTimeFormat('id-ID', {
  month: 'long',
  year: 'numeric',
})

/** YYYY-MM-DD dari komponen tanggal lokal (bukan UTC) */
const toKey = (d: Date) => {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

const formatYMD = toKey

const addDays = (d: Date, n: number) =>
  new Date(d.getFullYear(), d.getMonth(), d.getDate() + n)

/** Tanggal tanpa jam - untuk komparasi hari */
const startOfDay = (d: Date) =>
  new Date(d.getFullYear(), d.getMonth(), d.getDate())

const isSameDayDate = (a: Date, b: Date) => toKey(a) === toKey(b)

const isBetween = (d: Date, start: Date, end: Date) => {
  const t = startOfDay(d).getTime()
  return t > startOfDay(start).getTime() && t < startOfDay(end).getTime()
}

/** "08:00" dari ISO datetime */
const formatTime = (iso: string) =>
  new Date(iso).toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })

/** "Senin, 10 Oktober 2025" dari Date */
const formatFullDate = (d: Date) =>
  d.toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

/** "12 Jun 2025" dari Date */
const formatShortDate = (d: Date) =>
  d.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })

// ─────────────────────────────────────────
// EVENT STYLING HELPERS
// ─────────────────────────────────────────

const isBlocking = (event: CalendarEvent) =>
  event.type === 'maintenance' ||
  event.status === BOOKING_STATUS.APPROVED ||
  event.status === BOOKING_STATUS.ONGOING

const chipClass = (event: CalendarEvent) => {
  if (event.type === 'maintenance') return 'bg-[#F3F4F6] text-[#374151]'
  if (
    event.status === BOOKING_STATUS.APPROVED ||
    event.status === BOOKING_STATUS.ONGOING
  )
    return 'bg-[#DBEAFE] text-[#1E40AF]'
  if (event.status === BOOKING_STATUS.PENDING)
    return 'bg-[#FEF9C3] text-[#854D0E]'
  return 'bg-[#F3F4F6] text-[#374151]'
}

const getEventDotColor = (event: CalendarEvent): string => {
  if (event.type === 'maintenance') return 'var(--text-disabled)'
  if (!event.status) return 'var(--primary)'
  const cfg = BOOKING_STATUS_CONFIG[event.status as BookingStatus]
  return cfg?.dotColor ?? 'var(--primary)'
}

const getStatusBg = (status: string) =>
  BOOKING_STATUS_CONFIG[status as BookingStatus]?.bg ?? 'var(--bg-subtle)'

const getStatusColor = (status: string) =>
  BOOKING_STATUS_CONFIG[status as BookingStatus]?.text ?? 'var(--text-secondary)'

const getStatusLabel = (status: string) =>
  BOOKING_STATUS_CONFIG[status as BookingStatus]?.label ?? status

/** Label jam untuk chip - maintenance tanpa jam → "Seharian" */
const timeLabel = (event: CalendarEvent) =>
  event.type === 'maintenance' && !event.startTime
    ? 'Seharian'
    : `${event.startTime}-${event.endTime}`

// ─────────────────────────────────────────
// AVAILABILITY CALENDAR
// ─────────────────────────────────────────

export const AvailabilityCalendar = ({
  data,
  resourceId,
  mode = 'view',
  selectedDate,
  onSelectDate,
  onSelectDateTime,
  onConflictDetected,
  minDate,
  maxDate,
  showHeader = true,
  className,
  excludeBookingIds,
}: AvailabilityCalendarProps) => {
  const today = startOfDay(new Date())

  // Waktu sekarang - untuk men-disable jam/tanggal yang sudah lewat
  const now = new Date()
  const todayStr = toKey(now)
  const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(
    now.getMinutes(),
  ).padStart(2, '0')}`

  // Bulan yang sedang ditampilkan
  const initialMonth = selectedDate ?? new Date()
  const [currentMonth, setCurrentMonth] = useState(
    new Date(initialMonth.getFullYear(), initialMonth.getMonth(), 1),
  )

  // Pemilihan tanggal (internal)
  const [selectedStart, setSelectedStart] = useState<Date | null>(null)
  const [selectedEnd, setSelectedEnd] = useState<Date | null>(null)
  const [startTime, setStartTime] = useState('08:00')
  const [endTime, setEndTime] = useState('17:00')

  // Tanggal yang bentrok - untuk highlight merah
  const [conflictKeys, setConflictKeys] = useState<Set<string>>(new Set())

  // ── Fetch internal jika resourceId ada tanpa data ──
  const shouldFetch = !!resourceId && !data
  const monthStart = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth(),
    1,
  )
  const monthEnd = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth() + 1,
    0,
    23,
    59,
    59,
  )

  const { data: fetched } = useBookings(
    shouldFetch
      ? {
          resourceId,
          startDate: monthStart.toISOString(),
          endDate: monthEnd.toISOString(),
          limit: 100,
        }
      : undefined,
    { enabled: shouldFetch },
  )

  // ── Bangun map tanggal -> CalendarDayData ──
  const dayMap = useMemo(() => {
    const map = new Map<string, CalendarDayData>()

    // 1. Dari prop data (prioritas)
    if (data) {
      for (const d of data) map.set(d.date, d)
      return map
    }

    // 2. Dari hasil fetch booking (exclude booking yang sedang dijadwalkan
    //    ulang sendiri, biar tidak dianggap bentrok dgn dirinya sendiri)
    const bookings = (fetched?.data ?? []).filter(
      (b) => !excludeBookingIds?.includes(b.id),
    )
    for (const b of bookings) {
      const start = startOfDay(new Date(b.startDate))
      const end = startOfDay(new Date(b.endDate))
      const blocks =
        b.status === BOOKING_STATUS.APPROVED ||
        b.status === BOOKING_STATUS.ONGOING

      for (let d = start; d.getTime() <= end.getTime(); d = addDays(d, 1)) {
        const key = toKey(d)
        const existing = map.get(key) ?? {
          date: key,
          isAvailable: true,
          isFullDay: false,
          events: [],
        }
        existing.events.push({
          id: b.id,
          title: b.user?.name ?? b.resource?.name ?? 'Booking',
          type: 'booking',
          status: b.status,
          startTime: formatTime(b.startDate),
          endTime: formatTime(b.endDate),
          startDate: b.startDate,
          endDate: b.endDate,
        })
        if (blocks) {
          existing.isAvailable = false
          existing.isFullDay = true
        }
        map.set(key, existing)
      }
    }
    return map
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, fetched, excludeBookingIds?.join(',')])

  // ── Grid 6x7 mulai Minggu ──
  const cells = useMemo(() => {
    const firstWeekday = monthStart.getDay() // 0 = Minggu
    const gridStart = addDays(monthStart, -firstWeekday)
    return Array.from({ length: 42 }, (_, i) => addDays(gridStart, i))
  }, [monthStart])

  // ── Navigasi bulan ──
  const goPrev = () =>
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1),
    )
  const goNext = () =>
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1),
    )

  // ── Kumpulkan event yang memblokir di rentang tanggal ──
  const collectConflicts = (start: Date, end: Date): CalendarEvent[] => {
    const found = new Map<number, CalendarEvent>()
    for (
      let d = startOfDay(start);
      d.getTime() <= startOfDay(end).getTime();
      d = addDays(d, 1)
    ) {
      const dd = dayMap.get(toKey(d))
      if (!dd) continue
      for (const ev of dd.events) if (isBlocking(ev)) found.set(ev.id, ev)
    }
    return [...found.values()]
  }

  const rangeKeys = (start: Date, end: Date): Set<string> => {
    const keys = new Set<string>()
    for (
      let d = startOfDay(start);
      d.getTime() <= startOfDay(end).getTime();
      d = addDays(d, 1)
    )
      keys.add(toKey(d))
    return keys
  }

  // ── Reset pemilihan ──
  const resetSelection = (start: Date | null) => {
    setSelectedStart(start)
    setSelectedEnd(null)
    setStartTime('08:00')
    setEndTime('17:00')
    setConflictKeys(new Set())
    onConflictDetected?.([])
  }

  // ── Handler klik tanggal ──
  const handleDateClick = (date: Date) => {
    if (mode === 'view') return

    // Jika tanggal = hari ini & semua jam sudah lewat → tidak bisa dipilih
    if (toKey(date) === todayStr) {
      const lastOption = TIME_OPTIONS[TIME_OPTIONS.length - 1] // "23:30"
      if (currentTime >= lastOption) return
    }

    if (mode === 'single') {
      onSelectDate?.(date)
      return
    }

    // mode === 'range' (tanggal + jam)
    if (!selectedStart || (selectedStart && selectedEnd)) {
      // mulai pemilihan baru
      resetSelection(date)
      return
    }

    // sudah ada start, belum ada end
    if (startOfDay(date).getTime() < startOfDay(selectedStart).getTime()) {
      // klik sebelum start → jadikan start baru
      resetSelection(date)
      return
    }

    // kandidat end (boleh sama dengan start → same-day)
    const conflicts = collectConflicts(selectedStart, date)
    if (conflicts.length) {
      setConflictKeys(rangeKeys(selectedStart, date))
      onConflictDetected?.(conflicts)
      return // jangan set end
    }
    setConflictKeys(new Set())
    onConflictDetected?.([])
    setSelectedEnd(date)
  }

  // ── Status same-day ──
  const isSameDay =
    !!selectedStart &&
    !!selectedEnd &&
    isSameDayDate(selectedStart, selectedEnd)

  // ── Status tanggal = hari ini (untuk disable jam lewat) ──
  const isStartDateToday = !!selectedStart && formatYMD(selectedStart) === todayStr
  const isEndDateToday = !!selectedEnd && formatYMD(selectedEnd) === todayStr

  // disableBefore untuk start: jika tanggal mulai = hari ini, disable jam <= sekarang
  const startTimeDisable = isStartDateToday ? currentTime : undefined
  // disableBefore untuk end:
  // - same day → disable jam <= startTime
  // - end = hari ini (beda hari dari start) → disable jam <= sekarang
  // - selain itu → tidak ada disable
  const endTimeDisable = isSameDay
    ? startTime
    : isEndDateToday
      ? currentTime
      : undefined

  // ── Validasi jam ──
  const timeError = useMemo(() => {
    if (!startTime || !endTime) return null
    if (isStartDateToday && startTime <= currentTime) {
      return 'Jam mulai harus setelah waktu sekarang'
    }
    if (isSameDay && endTime <= startTime) {
      return 'Jam selesai harus lebih dari jam mulai'
    }
    return null
  }, [startTime, endTime, isSameDay, isStartDateToday, currentTime])

  // ── Kalkulasi durasi ──
  const calculatedDuration = useMemo(() => {
    if (!selectedStart || !selectedEnd || !startTime || !endTime) return '-'
    const start = new Date(`${formatYMD(selectedStart)}T${startTime}:00`)
    const end = new Date(`${formatYMD(selectedEnd)}T${endTime}:00`)
    const ms = end.getTime() - start.getTime()
    if (ms <= 0) return '-'
    const hours = Math.floor(ms / 3_600_000)
    const minutes = Math.floor((ms % 3_600_000) / 60_000)
    if (hours >= 24) {
      const days = Math.floor(hours / 24)
      const remHours = hours % 24
      return remHours > 0 ? `${days} Hari ${remHours} Jam` : `${days} Hari`
    }
    if (minutes === 0) return `${hours} Jam`
    return `${hours} Jam ${minutes} Menit`
  }, [selectedStart, selectedEnd, startTime, endTime])

  // ── Konfirmasi ──
  const handleConfirmDateTime = () => {
    if (!selectedStart || !selectedEnd || timeError) return
    onSelectDateTime?.({
      startDate: selectedStart,
      endDate: selectedEnd,
      startTime,
      endTime,
    })
  }

  return (
    <div className={cn('w-full', className)}>
      {/* Header */}
      {showHeader && (
        <div className="mb-3 flex items-center justify-between">
          <h3
            className="text-base font-bold text-[var(--text-primary)]"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            Jadwal Ketersediaan
          </h3>
          <div className="flex items-center gap-2">
            <AppButton
              variant="ghost"
              size="icon-sm"
              onClick={goPrev}
              aria-label="Bulan sebelumnya"
            >
              <ChevronLeft className="h-4 w-4" />
            </AppButton>
            <span className="min-w-[120px] text-center text-sm font-semibold text-[var(--text-primary)]">
              {monthLabelFmt.format(currentMonth)}
            </span>
            <AppButton
              variant="ghost"
              size="icon-sm"
              onClick={goNext}
              aria-label="Bulan berikutnya"
            >
              <ChevronRight className="h-4 w-4" />
            </AppButton>
          </div>
        </div>
      )}

      {/* Day header row */}
      <div className="grid grid-cols-7">
        {WEEKDAYS.map((d) => (
          <div
            key={d}
            className="py-2 text-center text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--text-disabled)]"
          >
            {d}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7">
        {cells.map((cell, i) => {
          const key = toKey(cell)
          const inMonth = cell.getMonth() === currentMonth.getMonth()
          const isToday = isSameDayDate(cell, today)
          const isPast = startOfDay(cell).getTime() < today.getTime()
          const dayData = dayMap.get(key)
          const unavailable = dayData ? !dayData.isAvailable : false
          const isConflict = conflictKeys.has(key)

          const beforeMin = minDate
            ? startOfDay(cell).getTime() < startOfDay(minDate).getTime()
            : false
          const afterMax = maxDate
            ? startOfDay(cell).getTime() > startOfDay(maxDate).getTime()
            : false

          // Selected states
          const isSelectedSingle =
            mode === 'single' && selectedDate
              ? isSameDayDate(cell, selectedDate)
              : false
          const isRangeStart = selectedStart
            ? isSameDayDate(cell, selectedStart)
            : false
          const isRangeEnd = selectedEnd
            ? isSameDayDate(cell, selectedEnd)
            : false
          const isRangeBetween =
            selectedStart && selectedEnd
              ? isBetween(cell, selectedStart, selectedEnd)
              : false

          // Bisa diklik?
          const isInteractive =
            mode !== 'view' &&
            inMonth &&
            !isPast &&
            !unavailable &&
            !beforeMin &&
            !afterMax

          // Border grid
          const col = i % 7
          const rowLast = i >= 35
          const borderCls = cn(
            'border-t border-r border-[var(--border-divider)]',
            col === 0 && 'border-l',
            rowLast && 'border-b',
          )

          // State background
          let stateCls = 'bg-[var(--bg-card)]'
          if (!inMonth)
            stateCls = 'bg-[var(--bg-card)] opacity-40 pointer-events-none'
          else if (isPast)
            stateCls = 'bg-[var(--bg-card)] opacity-30 pointer-events-none'
          else if (unavailable || beforeMin || afterMax)
            stateCls = 'bg-[var(--bg-subtle)] cursor-not-allowed'
          else if (isInteractive)
            stateCls =
              'bg-[var(--bg-card)] hover:bg-[var(--bg-subtle)] cursor-pointer transition-colors'

          // Selected overlays
          const selectedCls = cn(
            isSelectedSingle &&
              'border-l-[2.5px] border-l-[var(--primary)] bg-[var(--primary-light)]',
            isRangeStart &&
              'border-l-[2.5px] border-l-[var(--primary)] bg-[var(--primary-light)] rounded-l-lg',
            isRangeEnd && 'bg-[var(--primary-light)] rounded-r-lg',
            isRangeBetween && 'bg-[var(--primary-light)] opacity-60',
          )

          // Conflict overlay - prioritas paling tinggi
          const conflictCls = isConflict
            ? 'bg-red-50 border-[var(--danger)]'
            : ''

          const events = dayData?.events ?? []
          const visibleEvents = events.slice(0, 2)
          const extra = events.length - visibleEvents.length
          const hasEvents = events.length > 0

          // ── Konten cell ──
          const cellNode = (
            <div
              onClick={
                isInteractive && !hasEvents
                  ? () => handleDateClick(cell)
                  : undefined
              }
              className={cn(
                'flex min-h-[80px] flex-col p-1.5',
                borderCls,
                stateCls,
                selectedCls,
                conflictCls,
                hasEvents && isInteractive && 'cursor-pointer',
              )}
            >
              {/* Nomor tanggal */}
              <div className="flex items-center justify-between">
                {isToday ? (
                  <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[var(--primary)] text-xs font-semibold text-white">
                    {cell.getDate()}
                  </span>
                ) : (
                  <span
                    className={cn(
                      'text-xs font-medium',
                      !inMonth
                        ? 'text-[var(--text-disabled)]'
                        : unavailable
                          ? 'text-[var(--text-disabled)] line-through'
                          : isSelectedSingle || isRangeStart
                            ? 'font-bold text-[var(--primary)]'
                            : 'text-[var(--text-primary)]',
                    )}
                  >
                    {cell.getDate()}
                  </span>
                )}
              </div>

              {/* Event chips - dengan jam */}
              {visibleEvents.map((ev, idx) => (
                <span
                  key={`${ev.type}-${ev.id}-${idx}`}
                  className={cn(
                    'mt-0.5 truncate rounded px-1 py-0.5 text-[9px] font-medium leading-tight',
                    chipClass(ev),
                  )}
                >
                  <span className="font-semibold">{timeLabel(ev)}</span>{' '}
                  {ev.title}
                </span>
              ))}
              {extra > 0 && (
                <span className="mt-0.5 text-[9px] text-[var(--text-disabled)]">
                  +{extra} lagi
                </span>
              )}

              {/* Label "Mulai" / "Selesai" */}
              {isSelectedSingle && (
                <span className="mt-auto flex items-center gap-1 pt-0.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-[var(--primary)]" />
                  <span className="text-[10px] text-[var(--primary)]">
                    Dipilih
                  </span>
                </span>
              )}
              {isRangeStart && !isSelectedSingle && (
                <span className="mt-auto pt-0.5 text-[10px] text-[var(--primary)]">
                  {isSameDay ? 'Mulai & Selesai' : 'Mulai'}
                </span>
              )}
              {isRangeEnd && !isRangeStart && (
                <span className="mt-auto pt-0.5 text-[10px] text-[var(--primary)]">
                  Selesai
                </span>
              )}
            </div>
          )

          // Cell tanpa event → render langsung
          if (!hasEvents) {
            return <div key={key}>{cellNode}</div>
          }

          // Cell dengan event → bungkus Popover
          return (
            <Popover key={key}>
              <PopoverTrigger asChild>{cellNode}</PopoverTrigger>
              <PopoverContent
                side="bottom"
                align="start"
                className="w-72 rounded-xl border border-[var(--border-card)] bg-[var(--bg-card)] p-0 shadow-[var(--shadow-dropdown)]"
              >
                {/* Header */}
                <div className="px-4 pb-2 pt-3">
                  <p
                    className="text-sm font-semibold text-[var(--text-primary)]"
                    style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                  >
                    {formatFullDate(cell)}
                  </p>
                  <p className="text-xs text-[var(--text-secondary)]">
                    {events.length} jadwal
                  </p>
                </div>

                <Separator className="bg-[var(--border-divider)]" />

                {/* Event list */}
                <div className="max-h-48 space-y-2 overflow-y-auto px-4 py-2">
                  {events.map((event) => (
                    <div
                      key={`${event.type}-${event.id}`}
                      className="flex items-start gap-3 py-1.5"
                    >
                      <span
                        className="mt-1.5 h-2 w-2 shrink-0 rounded-full"
                        style={{ backgroundColor: getEventDotColor(event) }}
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold text-[var(--text-primary)]">
                          {timeLabel(event)}
                        </p>
                        <p className="truncate text-xs text-[var(--text-secondary)]">
                          {event.title}
                        </p>
                        {event.status && (
                          <span
                            className="mt-1 inline-block rounded-full px-1.5 py-0.5 text-[9px] font-medium"
                            style={{
                              backgroundColor: getStatusBg(event.status),
                              color: getStatusColor(event.status),
                            }}
                          >
                            {getStatusLabel(event.status)}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Footer - hanya di mode non-view & tanggal available */}
                {mode !== 'view' && dayData?.isAvailable && isInteractive && (
                  <>
                    <Separator className="bg-[var(--border-divider)]" />
                    <div className="px-4 py-2">
                      <button
                        onClick={() => handleDateClick(cell)}
                        className="w-full rounded-lg bg-[var(--primary-light)] py-1.5 text-xs font-semibold text-[var(--primary)] transition-colors hover:bg-[var(--primary)] hover:text-white"
                      >
                        Pilih tanggal ini
                      </button>
                    </div>
                  </>
                )}
              </PopoverContent>
            </Popover>
          )
        })}
      </div>

      {/* ── TIME PICKER - muncul setelah start + end terpilih ── */}
      {mode === 'range' && selectedStart && selectedEnd && (
        <div className="mt-4 rounded-xl border border-[var(--border-card)] bg-[var(--bg-subtle)] p-4">
          {/* Info tanggal terpilih */}
          <div className="mb-3 flex items-center gap-2 text-sm">
            <CalendarIcon className="h-4 w-4 text-[var(--primary)]" />
            <span className="font-medium text-[var(--text-primary)]">
              {isSameDay
                ? formatFullDate(selectedStart)
                : `${formatShortDate(selectedStart)} - ${formatShortDate(selectedEnd)}`}
            </span>
          </div>

          {/* Time inputs row */}
          <div className="grid grid-cols-2 gap-3">
            <TimePicker
              value={startTime}
              onChange={setStartTime}
              disableBefore={startTimeDisable}
              label={
                isSameDay
                  ? 'JAM MULAI'
                  : `JAM MULAI · ${formatShortDate(selectedStart)}`
              }
            />
            <TimePicker
              value={endTime}
              onChange={setEndTime}
              disableBefore={endTimeDisable}
              label={
                isSameDay
                  ? 'JAM SELESAI'
                  : `JAM SELESAI · ${formatShortDate(selectedEnd)}`
              }
            />
          </div>

          {/* Durasi otomatis */}
          <div className="mt-3 flex items-center gap-2 rounded-lg border border-[var(--border-divider)] bg-[var(--bg-card)] px-3 py-2">
            <Clock className="h-3.5 w-3.5 text-[var(--text-secondary)]" />
            <span className="text-xs text-[var(--text-secondary)]">
              Durasi:{' '}
              <span className="font-medium text-[var(--text-primary)]">
                {calculatedDuration}
              </span>
            </span>
          </div>

          {/* Error jika jam invalid */}
          {timeError && (
            <p className="mt-2 flex items-center gap-1 text-xs text-[var(--danger)]">
              <AlertCircle className="h-3 w-3" /> {timeError}
            </p>
          )}

          {/* Tombol konfirmasi */}
          <button
            type="button"
            onClick={handleConfirmDateTime}
            disabled={!!timeError}
            className="mt-3 h-9 w-full rounded-lg bg-[var(--primary)] text-sm font-semibold text-white transition-all hover:bg-[var(--primary-dark)] disabled:bg-[var(--border-card)] disabled:text-[var(--text-disabled)]"
          >
            Konfirmasi Jadwal
          </button>
        </div>
      )}
    </div>
  )
}

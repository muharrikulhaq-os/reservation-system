'use client'

import { useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { AppButton } from '@/components/ui-custom'
import { useBookings } from '@/modules/booking/hooks/useBookings'
import { BOOKING_STATUS } from '@/constants'
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
}

export interface CalendarDayData {
  date: string // "YYYY-MM-DD"
  isAvailable: boolean
  events: CalendarEvent[]
}

export interface AvailabilityCalendarProps {
  data?: CalendarDayData[]
  resourceId?: number
  resourceType?: 'VEHICLE' | 'ROOM'
  mode?: 'single' | 'range' | 'view'
  selectedDate?: Date | null
  selectedRange?: { start: Date | null; end: Date | null }
  onSelectDate?: (date: Date) => void
  onSelectRange?: (range: { start: Date; end: Date }) => void
  minDate?: Date
  maxDate?: Date
  showHeader?: boolean
  className?: string
}

// ─────────────────────────────────────────
// DATE HELPERS (native Date — tanpa library)
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

const addDays = (d: Date, n: number) =>
  new Date(d.getFullYear(), d.getMonth(), d.getDate() + n)

/** Tanggal tanpa jam — untuk komparasi hari */
const startOfDay = (d: Date) =>
  new Date(d.getFullYear(), d.getMonth(), d.getDate())

const isSameDay = (a: Date, b: Date) => toKey(a) === toKey(b)

const isBetween = (d: Date, start: Date, end: Date) => {
  const t = startOfDay(d).getTime()
  return t > startOfDay(start).getTime() && t < startOfDay(end).getTime()
}

// ─────────────────────────────────────────
// EVENT CHIP STYLING
// (warna hardcode sesuai spesifikasi kalender)
// ─────────────────────────────────────────

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

// ─────────────────────────────────────────
// AVAILABILITY CALENDAR
// ─────────────────────────────────────────

export const AvailabilityCalendar = ({
  data,
  resourceId,
  mode = 'view',
  selectedDate,
  selectedRange,
  onSelectDate,
  onSelectRange,
  minDate,
  maxDate,
  showHeader = true,
  className,
}: AvailabilityCalendarProps) => {
  const today = startOfDay(new Date())

  // Bulan yang sedang ditampilkan
  const initialMonth =
    selectedDate ?? selectedRange?.start ?? new Date()
  const [currentMonth, setCurrentMonth] = useState(
    new Date(initialMonth.getFullYear(), initialMonth.getMonth(), 1),
  )

  // Range internal (uncontrolled) untuk mode="range"
  const [internalRange, setInternalRange] = useState<{
    start: Date | null
    end: Date | null
  }>({ start: selectedRange?.start ?? null, end: selectedRange?.end ?? null })

  // Range efektif: controlled prop > internal
  const range = selectedRange ?? internalRange

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

  // ── Bangun map tanggal -> { events, isAvailable } ──
  const dayMap = useMemo(() => {
    const map = new Map<string, CalendarDayData>()

    // 1. Dari prop data (prioritas)
    if (data) {
      for (const d of data) map.set(d.date, d)
      return map
    }

    // 2. Dari hasil fetch booking
    const bookings = fetched?.data ?? []
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
          events: [],
        }
        existing.events.push({
          id: b.id,
          title: b.user?.name ?? b.resource?.name ?? 'Booking',
          type: 'booking',
          status: b.status,
        })
        if (blocks) existing.isAvailable = false
        map.set(key, existing)
      }
    }
    return map
  }, [data, fetched])

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

  // ── Handler klik tanggal ──
  const handleClick = (date: Date) => {
    if (mode === 'view') return

    if (mode === 'single') {
      onSelectDate?.(date)
      return
    }

    // mode === 'range'
    const { start, end } = range
    if (!start || (start && end)) {
      // mulai range baru
      const next = { start: date, end: null }
      if (!selectedRange) setInternalRange(next)
      onSelectDate?.(date)
    } else {
      // start ada, end belum
      if (startOfDay(date).getTime() > startOfDay(start).getTime()) {
        const next = { start, end: date }
        if (!selectedRange) setInternalRange(next)
        onSelectRange?.({ start, end: date })
      } else {
        // klik <= start → reset start
        const next = { start: date, end: null }
        if (!selectedRange) setInternalRange(next)
        onSelectDate?.(date)
      }
    }
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
          const isToday = isSameDay(cell, today)
          const isPast = startOfDay(cell).getTime() < today.getTime()
          const dayData = dayMap.get(key)
          const unavailable = dayData ? !dayData.isAvailable : false

          const beforeMin = minDate
            ? startOfDay(cell).getTime() < startOfDay(minDate).getTime()
            : false
          const afterMax = maxDate
            ? startOfDay(cell).getTime() > startOfDay(maxDate).getTime()
            : false

          // Selected states
          const isSelectedSingle =
            mode === 'single' && selectedDate
              ? isSameDay(cell, selectedDate)
              : false
          // Highlight range berlaku untuk mode "range" maupun "view"
          // (detail booking menandai rentang tanggalnya).
          const isRangeStart = range.start
            ? isSameDay(cell, range.start)
            : false
          const isRangeEnd = range.end ? isSameDay(cell, range.end) : false
          const isRangeBetween =
            range.start && range.end
              ? isBetween(cell, range.start, range.end)
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
          if (!inMonth) stateCls = 'bg-[var(--bg-card)] opacity-40 pointer-events-none'
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

          const events = dayData?.events ?? []
          const visibleEvents = events.slice(0, 2)
          const extra = events.length - visibleEvents.length

          return (
            <div
              key={key}
              onClick={isInteractive ? () => handleClick(cell) : undefined}
              className={cn(
                'flex min-h-[80px] flex-col p-1.5',
                borderCls,
                stateCls,
                selectedCls,
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

              {/* Event chips */}
              {visibleEvents.map((ev, idx) => (
                <span
                  key={`${ev.type}-${ev.id}-${idx}`}
                  className={cn(
                    'mt-0.5 truncate rounded px-1 py-0.5 text-[9px] font-medium leading-tight',
                    chipClass(ev),
                  )}
                >
                  {ev.title}
                </span>
              ))}
              {extra > 0 && (
                <span className="mt-0.5 text-[9px] text-[var(--text-disabled)]">
                  +{extra} lagi
                </span>
              )}

              {/* Label "Dipilih" / "Mulai" / "Selesai" */}
              {isSelectedSingle && (
                <span className="mt-auto flex items-center gap-1 pt-0.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-[var(--primary)]" />
                  <span className="text-[10px] text-[var(--primary)]">
                    Dipilih
                  </span>
                </span>
              )}
              {isRangeStart && (
                <span className="mt-auto pt-0.5 text-[10px] text-[var(--primary)]">
                  Mulai
                </span>
              )}
              {isRangeEnd && (
                <span className="mt-auto pt-0.5 text-[10px] text-[var(--primary)]">
                  Selesai
                </span>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

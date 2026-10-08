'use client'

import { useEffect, useRef, useState } from 'react'
import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import { wibHM, wibYMD } from '@/lib/wib'
import { AppFieldError, AppFieldHint, AppLabel } from './Appinput'

// ─────────────────────────────────────────
// DATE PICKER - pengganti <input type="date|datetime-local">.
// Popup kalender bawaan browser tidak bisa diberi tema, jadi kalender
// digambar sendiri dengan token proyek. Nilai tetap string jam dinding WIB
// ("YYYY-MM-DD" / "YYYY-MM-DDTHH:mm") dan onChange tetap berbentuk event
// ({ target: { value } }) supaya pemanggil lama tidak perlu berubah.
// ─────────────────────────────────────────

const MONTHS = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
]
const WEEKDAYS = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab']
const HOURS = Array.from({ length: 24 }, (_, i) => i)
const MINUTE_STEP = 5

const pad = (n: number) => String(n).padStart(2, '0')
const ymdOf = (y: number, m: number, d: number) => `${y}-${pad(m + 1)}-${pad(d)}`

/** "2026-10-08" → { y, m (0-11), d }; null bila tidak valid. */
const parseYMD = (v?: string) => {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(v ?? '')
  if (!match) return null
  return { y: +match[1], m: +match[2] - 1, d: +match[3] }
}

/** "2026-10-08" → "8 Okt 2026" */
const formatYMD = (v: string) => {
  const p = parseYMD(v)
  return p ? `${p.d} ${MONTHS[p.m].slice(0, 3)} ${p.y}` : ''
}

export interface DateChangeEvent {
  target: { name?: string; value: string }
}

interface BaseProps {
  label?: string
  error?: string
  hint?: string
  required?: boolean
  disabled?: boolean
  placeholder?: string
  name?: string
  id?: string
  className?: string
  value?: string
  onChange?: (e: DateChangeEvent) => void
  /** Batas bawah/atas "YYYY-MM-DD" (boleh juga nilai datetime; jamnya diabaikan). */
  min?: string
  max?: string
  /** Tampilkan tombol "Hapus". Default: true bila tidak `required`. */
  clearable?: boolean
}

// ─────────────────────────────────────────
// CALENDAR GRID
// ─────────────────────────────────────────

interface CalendarGridProps {
  value: string
  onSelect: (ymd: string) => void
  min?: string
  max?: string
}

const CalendarGrid = ({ value, onSelect, min, max }: CalendarGridProps) => {
  const today = wibYMD(new Date())
  const initial = parseYMD(value) ?? parseYMD(today)!
  const [view, setView] = useState({ y: initial.y, m: initial.m })
  const [mode, setMode] = useState<'days' | 'months'>('days')
  const minYMD = min?.slice(0, 10)
  const maxYMD = max?.slice(0, 10)

  const shift = (delta: number) =>
    setView(({ y, m }) => {
      const t = y * 12 + m + delta
      return { y: Math.floor(t / 12), m: ((t % 12) + 12) % 12 }
    })

  // Grid 6x7 mulai Minggu (sama dengan AvailabilityCalendar) supaya tinggi
  // popup tidak berubah antarbulan.
  const firstWeekday = new Date(view.y, view.m, 1).getDay()
  const cells = Array.from({ length: 42 }, (_, i) => {
    const d = new Date(view.y, view.m, i - firstWeekday + 1)
    return {
      ymd: ymdOf(d.getFullYear(), d.getMonth(), d.getDate()),
      day: d.getDate(),
      inMonth: d.getMonth() === view.m,
    }
  })

  const navBtn =
    'flex h-8 w-8 items-center justify-center rounded-lg text-[var(--text-secondary)] transition-colors hover:bg-[var(--primary-light)] hover:text-[var(--primary)]'

  return (
    <div className="w-[17.5rem]">
      <div className="mb-2 flex items-center justify-between">
        <button
          type="button"
          className={navBtn}
          onClick={() => (mode === 'days' ? shift(-1) : shift(-12))}
          aria-label={mode === 'days' ? 'Bulan sebelumnya' : 'Tahun sebelumnya'}
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => setMode(mode === 'days' ? 'months' : 'days')}
          className="rounded-lg px-2 py-1 text-sm font-semibold text-[var(--text-primary)] transition-colors hover:bg-[var(--primary-light)] hover:text-[var(--primary)]"
          title={mode === 'days' ? 'Pilih bulan & tahun' : 'Kembali ke tanggal'}
        >
          {mode === 'days' ? `${MONTHS[view.m]} ${view.y}` : view.y}
        </button>
        <button
          type="button"
          className={navBtn}
          onClick={() => (mode === 'days' ? shift(1) : shift(12))}
          aria-label={mode === 'days' ? 'Bulan berikutnya' : 'Tahun berikutnya'}
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {mode === 'months' ? (
        <div className="grid grid-cols-3 gap-1.5 py-1">
          {MONTHS.map((name, m) => {
            const active = m === view.m
            return (
              <button
                key={name}
                type="button"
                onClick={() => {
                  setView((v) => ({ ...v, m }))
                  setMode('days')
                }}
                className={cn(
                  'h-11 rounded-lg text-sm transition-colors',
                  active
                    ? 'bg-[var(--primary)] font-semibold text-white'
                    : 'text-[var(--text-primary)] hover:bg-[var(--primary-light)] hover:text-[var(--primary)]',
                )}
              >
                {name.slice(0, 3)}
              </button>
            )
          })}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-7">
            {WEEKDAYS.map((d) => (
              <div
                key={d}
                className="py-1.5 text-center text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--text-disabled)]"
              >
                {d}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-y-0.5">
            {cells.map((c) => {
              const selected = c.ymd === value?.slice(0, 10)
              const isToday = c.ymd === today
              const blocked =
                (!!minYMD && c.ymd < minYMD) || (!!maxYMD && c.ymd > maxYMD)
              return (
                <button
                  key={c.ymd}
                  type="button"
                  disabled={blocked}
                  onClick={() => onSelect(c.ymd)}
                  aria-pressed={selected}
                  aria-label={formatYMD(c.ymd)}
                  className={cn(
                    'mx-auto flex h-9 w-9 items-center justify-center rounded-lg text-sm transition-colors',
                    'disabled:cursor-not-allowed disabled:opacity-35',
                    selected
                      ? 'bg-[var(--primary)] font-semibold text-white'
                      : cn(
                          c.inMonth ? 'text-[var(--text-primary)]' : 'text-[var(--text-disabled)]',
                          'enabled:hover:bg-[var(--primary-light)] enabled:hover:text-[var(--primary)]',
                          isToday && 'border border-[var(--primary)] font-semibold text-[var(--primary)]',
                        ),
                  )}
                >
                  {c.day}
                </button>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}

// ─────────────────────────────────────────
// TIME COLUMNS (jam & menit, 24 jam)
// ─────────────────────────────────────────

const TimeColumn = ({
  items,
  selected,
  onPick,
  label,
}: {
  items: number[]
  selected: number | null
  onPick: (n: number) => void
  label: string
}) => {
  const listRef = useRef<HTMLDivElement>(null)

  // Gulir ke nilai terpilih tanpa ikut menggulir halaman (scrollIntoView
  // menggeser semua ancestor yang bisa digulir).
  useEffect(() => {
    const list = listRef.current
    const el = list?.querySelector<HTMLElement>('[data-active="true"]')
    if (list && el) list.scrollTop = el.offsetTop - list.clientHeight / 2 + el.clientHeight / 2
  }, [selected])

  return (
    <div className="flex w-16 flex-col sm:w-14">
      <div className="py-1.5 text-center text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--text-disabled)]">
        {label}
      </div>
      <div
        ref={listRef}
        className="relative h-32 space-y-0.5 overflow-y-auto overflow-x-hidden overscroll-contain [scrollbar-width:none] sm:h-auto sm:min-h-0 sm:grow sm:basis-0 [&::-webkit-scrollbar]:hidden"
      >
        {items.map((n) => {
          const active = n === selected
          return (
            <button
              key={n}
              type="button"
              data-active={active}
              onClick={() => onPick(n)}
              className={cn(
                'flex h-8 w-full items-center justify-center rounded-lg text-sm tabular-nums transition-colors',
                active
                  ? 'bg-[var(--primary)] font-semibold text-white'
                  : 'text-[var(--text-primary)] hover:bg-[var(--primary-light)] hover:text-[var(--primary)]',
              )}
            >
              {pad(n)}
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────
// FIELD SHELL (label + trigger + popup)
// ─────────────────────────────────────────

const DateFieldShell = ({
  label,
  error,
  hint,
  required,
  disabled,
  placeholder,
  id,
  className,
  display,
  open,
  setOpen,
  children,
}: Pick<BaseProps, 'label' | 'error' | 'hint' | 'required' | 'disabled' | 'id' | 'className'> & {
  placeholder: string
  display: string
  open: boolean
  setOpen: (o: boolean) => void
  children: React.ReactNode
}) => {
  const triggerId = id ?? (label ? `date-${label.toLowerCase().replace(/\s+/g, '-')}` : undefined)
  return (
    <div className="w-full">
      {label && (
        <AppLabel htmlFor={triggerId} required={required}>
          {label}
        </AppLabel>
      )}
      {/* modal: tetap bisa diklik saat dipakai di dalam Dialog. */}
      <Popover modal open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            id={triggerId}
            type="button"
            disabled={disabled}
            aria-haspopup="dialog"
            aria-expanded={open}
            className={cn(
              'flex h-10 w-full items-center gap-2 rounded-lg border bg-[var(--bg-card)] px-3 text-left text-sm transition-all duration-150',
              'focus:outline-none focus-visible:border-[1.5px] focus-visible:border-[var(--primary)]',
              'disabled:cursor-not-allowed disabled:bg-[var(--bg-subtle)] disabled:text-[var(--text-disabled)]',
              error ? 'border-[var(--danger)]' : 'border-[var(--border-input)]',
              open && 'border-[1.5px] border-[var(--primary)]',
              className,
            )}
          >
            <CalendarDays
              className={cn(
                'h-4 w-4 shrink-0',
                open ? 'text-[var(--primary)]' : 'text-[var(--text-secondary)]',
              )}
            />
            <span
              className={cn(
                'min-w-0 flex-1 truncate',
                display ? 'text-[var(--text-primary)]' : 'text-[var(--text-disabled)]',
              )}
            >
              {display || placeholder}
            </span>
          </button>
        </PopoverTrigger>
        <PopoverContent
          align="start"
          collisionPadding={8}
          className="w-auto gap-0 rounded-xl border border-[var(--border-card)] bg-[var(--bg-card)] p-3 text-[var(--text-primary)] shadow-[0_4px_16px_rgba(0,0,0,0.10)] ring-0"
        >
          {children}
        </PopoverContent>
      </Popover>
      <AppFieldError>{error}</AppFieldError>
      <AppFieldHint>{hint}</AppFieldHint>
    </div>
  )
}

const footerBtn =
  'rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-colors'

// ─────────────────────────────────────────
// 8. INPUT DATE  ("YYYY-MM-DD")
// ─────────────────────────────────────────

export type InputDateProps = BaseProps

export const InputDate = ({
  value = '',
  onChange,
  name,
  min,
  max,
  required,
  clearable = !required,
  placeholder = 'Pilih tanggal',
  ...rest
}: InputDateProps) => {
  const [open, setOpen] = useState(false)
  const emit = (v: string) => onChange?.({ target: { name, value: v } })
  const today = wibYMD(new Date())
  const todayAllowed =
    !(min && today < min.slice(0, 10)) && !(max && today > max.slice(0, 10))

  return (
    <DateFieldShell
      {...rest}
      required={required}
      placeholder={placeholder}
      display={formatYMD(value)}
      open={open}
      setOpen={setOpen}
    >
      <CalendarGrid
        value={value}
        min={min}
        max={max}
        onSelect={(v) => {
          emit(v)
          setOpen(false)
        }}
      />
      <div className="mt-2 flex items-center justify-between border-t border-[var(--border-divider)] pt-2">
        <button
          type="button"
          disabled={!todayAllowed}
          onClick={() => {
            emit(today)
            setOpen(false)
          }}
          className={cn(footerBtn, 'text-[var(--primary)] hover:bg-[var(--primary-light)] disabled:opacity-40')}
        >
          Hari ini
        </button>
        {clearable && value && (
          <button
            type="button"
            onClick={() => {
              emit('')
              setOpen(false)
            }}
            className={cn(footerBtn, 'text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)] hover:text-[var(--danger)]')}
          >
            Hapus
          </button>
        )}
      </div>
    </DateFieldShell>
  )
}

// ─────────────────────────────────────────
// 9. INPUT DATETIME  ("YYYY-MM-DDTHH:mm")
// ─────────────────────────────────────────

export type InputDateTimeProps = BaseProps

export const InputDateTime = ({
  value = '',
  onChange,
  name,
  min,
  max,
  required,
  clearable = !required,
  placeholder = 'Pilih tanggal & jam',
  ...rest
}: InputDateTimeProps) => {
  const [open, setOpen] = useState(false)
  const emit = (v: string) => onChange?.({ target: { name, value: v } })

  const [datePart, timePart = ''] = value.split('T')
  const hm = /^(\d{2}):(\d{2})/.exec(timePart)
  const hour = hm ? +hm[1] : null
  const minute = hm ? +hm[2] : null

  // Menit per 5; menit di luar kelipatan (mis. dari "Sekarang") tetap tampil.
  const minutes = Array.from({ length: 60 / MINUTE_STEP }, (_, i) => i * MINUTE_STEP)
  if (minute !== null && !minutes.includes(minute)) {
    minutes.push(minute)
    minutes.sort((a, b) => a - b)
  }

  const set = (date: string, h: number, m: number) => emit(`${date}T${pad(h)}:${pad(m)}`)
  const fallbackDate = datePart || wibYMD(new Date())

  return (
    <DateFieldShell
      {...rest}
      required={required}
      placeholder={placeholder}
      display={datePart ? `${formatYMD(datePart)}, ${timePart.slice(0, 5) || '--:--'}` : ''}
      open={open}
      setOpen={setOpen}
    >
      <div className="flex flex-col gap-3 sm:flex-row">
        <CalendarGrid
          value={datePart}
          min={min}
          max={max}
          onSelect={(d) => set(d, hour ?? 8, minute ?? 0)}
        />
        <div className="flex justify-center gap-1 border-t border-[var(--border-divider)] pt-2 sm:border-l sm:border-t-0 sm:pl-3 sm:pt-0">
          <TimeColumn
            label="Jam"
            items={HOURS}
            selected={hour}
            onPick={(h) => set(fallbackDate, h, minute ?? 0)}
          />
          <TimeColumn
            label="Menit"
            items={minutes}
            selected={minute}
            onPick={(m) => set(fallbackDate, hour ?? 8, m)}
          />
        </div>
      </div>
      <div className="mt-2 flex items-center gap-1 border-t border-[var(--border-divider)] pt-2">
        <button
          type="button"
          onClick={() => {
            const now = new Date()
            emit(`${wibYMD(now)}T${wibHM(now)}`)
          }}
          className={cn(footerBtn, 'text-[var(--primary)] hover:bg-[var(--primary-light)]')}
        >
          Sekarang
        </button>
        {clearable && value && (
          <button
            type="button"
            onClick={() => emit('')}
            className={cn(footerBtn, 'text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)] hover:text-[var(--danger)]')}
          >
            Hapus
          </button>
        )}
        <button
          type="button"
          onClick={() => setOpen(false)}
          className={cn(footerBtn, 'ml-auto bg-[var(--primary)] px-3.5 text-white hover:bg-[var(--primary-dark)]')}
        >
          Selesai
        </button>
      </div>
    </DateFieldShell>
  )
}

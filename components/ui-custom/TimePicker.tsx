'use client'

import { useState } from 'react'
import { ChevronDown, Keyboard } from 'lucide-react'
import { cn } from '@/lib/utils'
import { AppLabel } from './Appinput'
import { InputSelect } from './InputSelect'

// ─────────────────────────────────────────
// TIME PICKER - hybrid dropdown / ketik manual
// Dipakai di AvailabilityCalendar & BookingMergePanel.
// Dropdown = InputSelect bertema; mode ketik = isian teks "HH:MM"
// (bukan <input type="time"> bawaan browser).
// ─────────────────────────────────────────

// 00:00 – 23:30, interval 30 menit
export const TIME_OPTIONS: string[] = (() => {
  const out: string[] = []
  for (let h = 0; h < 24; h++) {
    for (let m = 0; m < 60; m += 30) {
      out.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`)
    }
  }
  return out
})()

const VALID_TIME = /^([01]\d|2[0-3]):[0-5]\d$/

/** "143" → "14:3", "1430" → "14:30" (hanya digit, maks 4). */
const maskTime = (raw: string) => {
  const d = raw.replace(/\D/g, '').slice(0, 4)
  return d.length > 2 ? `${d.slice(0, 2)}:${d.slice(2)}` : d
}

export interface TimePickerProps {
  value: string
  onChange: (v: string) => void
  /** "14:30" - disable semua opsi <= ini */
  disableBefore?: string
  label?: string
  className?: string
}

export const TimePicker = ({
  value,
  onChange,
  disableBefore,
  label,
  className,
}: TimePickerProps) => {
  const [isDropdown, setIsDropdown] = useState(true)
  const [draft, setDraft] = useState(value)
  const [draftError, setDraftError] = useState<string>()

  // Jam hasil ketik manual (mis. 14:15) tetap tampil di dropdown.
  const times = value && !TIME_OPTIONS.includes(value)
    ? [...TIME_OPTIONS, value].sort()
    : TIME_OPTIONS
  const options = times.map((t) => ({
    value: t,
    label: t,
    disabled: disableBefore ? t <= disableBefore : false,
  }))

  const commitDraft = (v: string) => {
    if (!VALID_TIME.test(v)) {
      setDraftError(v ? 'Format jam HH:MM (00:00–23:59)' : undefined)
      return
    }
    if (disableBefore && v <= disableBefore) {
      setDraftError(`Harus setelah ${disableBefore}`)
      return
    }
    setDraftError(undefined)
    onChange(v)
  }

  return (
    <div className={cn('w-full', className)}>
      {label && <AppLabel>{label}</AppLabel>}
      {isDropdown ? (
        <div className="relative">
          <InputSelect
            aria-label={label ?? 'Jam'}
            value={value}
            options={options}
            placeholder="Pilih jam"
            required
            onChange={(e) => onChange(e.target.value)}
          />
          <button
            type="button"
            onClick={() => {
              setDraft(value)
              setDraftError(undefined)
              setIsDropdown(false)
            }}
            className="absolute inset-y-0 right-9 flex items-center px-1 text-[var(--text-disabled)] hover:text-[var(--primary)]"
            title="Ketik manual"
            aria-label="Ketik jam manual"
          >
            <Keyboard className="h-3.5 w-3.5" />
          </button>
        </div>
      ) : (
        <div>
          <div className="relative">
            <input
              type="text"
              inputMode="numeric"
              autoFocus
              placeholder="HH:MM"
              value={draft}
              onChange={(e) => {
                const v = maskTime(e.target.value)
                setDraft(v)
                if (v.length === 5) commitDraft(v)
                else setDraftError(undefined)
              }}
              onBlur={() => commitDraft(draft)}
              className={cn(
                'h-10 w-full rounded-lg border bg-[var(--bg-card)] px-3 pr-9 text-sm tabular-nums text-[var(--text-primary)] placeholder:text-[var(--text-disabled)] focus-visible:border-[1.5px] focus-visible:border-[var(--primary)] focus-visible:outline-none focus-visible:ring-0',
                draftError ? 'border-[var(--danger)]' : 'border-[var(--border-input)]',
              )}
            />
            <button
              type="button"
              onClick={() => setIsDropdown(true)}
              className="absolute inset-y-0 right-2.5 flex items-center text-[var(--text-disabled)] hover:text-[var(--primary)]"
              title="Pilih dari daftar"
              aria-label="Pilih jam dari daftar"
            >
              <ChevronDown className="h-3.5 w-3.5" />
            </button>
          </div>
          {draftError && <p className="mt-1.5 text-xs text-[var(--danger)]">{draftError}</p>}
        </div>
      )}
    </div>
  )
}

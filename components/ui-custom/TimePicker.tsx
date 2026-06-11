'use client'

import { useState } from 'react'
import { ChevronDown, Keyboard } from 'lucide-react'
import { cn } from '@/lib/utils'

// ─────────────────────────────────────────
// TIME PICKER — hybrid dropdown / ketik manual
// Dipakai di AvailabilityCalendar & BookingMergePanel.
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

export interface TimePickerProps {
  value: string
  onChange: (v: string) => void
  /** "14:30" — disable semua opsi <= ini */
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

  return (
    <div className={cn('w-full', className)}>
      {label && (
        <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.07em] text-[var(--text-secondary)]">
          {label}
        </label>
      )}
      {isDropdown ? (
        <div className="relative">
          <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="h-10 w-full appearance-none rounded-lg border border-[var(--border-input)] bg-[var(--bg-card)] px-3 pr-8 text-sm text-[var(--text-primary)] focus-visible:border-[1.5px] focus-visible:border-[var(--primary)] focus-visible:outline-none focus-visible:ring-0"
          >
            {TIME_OPTIONS.map((t) => (
              <option
                key={t}
                value={t}
                disabled={disableBefore ? t <= disableBefore : false}
              >
                {t}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => setIsDropdown(false)}
            className="absolute inset-y-0 right-2.5 flex items-center text-[var(--text-disabled)] hover:text-[var(--text-secondary)]"
            title="Ketik manual"
          >
            <Keyboard className="h-3.5 w-3.5" />
          </button>
        </div>
      ) : (
        <div className="relative">
          <input
            type="time"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            min={disableBefore || undefined}
            className="h-10 w-full rounded-lg border border-[var(--border-input)] bg-[var(--bg-card)] px-3 pr-8 text-sm text-[var(--text-primary)] focus-visible:border-[1.5px] focus-visible:border-[var(--primary)] focus-visible:outline-none focus-visible:ring-0"
          />
          <button
            type="button"
            onClick={() => setIsDropdown(true)}
            className="absolute inset-y-0 right-2.5 flex items-center text-[var(--text-disabled)] hover:text-[var(--text-secondary)]"
            title="Pilih dari daftar"
          >
            <ChevronDown className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
    </div>
  )
}

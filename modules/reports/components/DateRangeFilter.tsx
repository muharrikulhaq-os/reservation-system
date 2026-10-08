'use client'

import { useState } from 'react'
import { CalendarRange, ChevronDown, ChevronUp } from 'lucide-react'
import { CardSection } from '@/components/common'
import { InputDate, InputSelect } from '@/components/ui-custom'
import { cn, formatShortDate, wibToISO, wibYMD } from '@/lib'
import type { SelectOption } from '@/types'

// ─────────────────────────────────────────
// DATE RANGE FILTER
// Dropdown preset rentang + input tanggal kustom. Bisa di-collapse ke satu
// baris ringkasan - filter ini muncul di atas SEMUA tab & lumayan makan
// tempat kalau selalu terbuka, padahal jarang diubah setelah dipilih.
// startDate/endDate diharapkan ISO string.
// ─────────────────────────────────────────

type Preset = 'today' | '7d' | '30d' | '90d' | '12m'

export interface DateRangeFilterProps {
  startDate: string
  endDate: string
  onStartChange: (date: string) => void
  onEndChange: (date: string) => void
  onPresetClick?: (preset: Preset) => void
  activePreset?: Preset
  className?: string
}

const PRESET_OPTIONS: SelectOption[] = [
  { value: 'today', label: 'Hari Ini' },
  { value: '7d', label: '7 Hari Terakhir' },
  { value: '30d', label: '30 Hari Terakhir' },
  { value: '90d', label: '90 Hari Terakhir' },
  { value: '12m', label: '12 Bulan Terakhir' },
]

const PRESET_LABEL: Record<Preset, string> = {
  today: 'Hari Ini',
  '7d': '7 Hari Terakhir',
  '30d': '30 Hari Terakhir',
  '90d': '90 Hari Terakhir',
  '12m': '12 Bulan Terakhir',
}

// ISO → "YYYY-MM-DD" (tanggal WIB) untuk <input type="date">. Dulu
// `iso.slice(0, 10)` = tanggal UTC: awal bulan WIB ("...-30T17:00:00Z")
// tampil sebagai tanggal sebelumnya.
const toDateValue = (iso: string) => (iso ? wibYMD(iso) : '')
// "YYYY-MM-DD" → ISO: DARI = 00:00 WIB, SAMPAI = 23:59:59 WIB supaya data
// pada tanggal terakhir ikut terhitung.
const toStartIso = (value: string) => (value ? wibToISO(value) : '')
const toEndIso = (value: string) => (value ? wibToISO(value, '23:59', '59') : '')

export const DateRangeFilter = ({
  startDate,
  endDate,
  onStartChange,
  onEndChange,
  onPresetClick,
  activePreset,
  className,
}: DateRangeFilterProps) => {
  const [expanded, setExpanded] = useState(false)

  const summary = activePreset
    ? PRESET_LABEL[activePreset]
    : `${formatShortDate(startDate)} – ${formatShortDate(endDate)}`

  if (!expanded) {
    return (
      <CardSection className={cn('flex items-center justify-between', className)}>
        <span className="flex items-center gap-2 text-sm text-[var(--text-primary)]">
          <CalendarRange className="h-4 w-4 text-[var(--text-secondary)]" />
          <span className="font-medium">{summary}</span>
        </span>
        <button
          type="button"
          onClick={() => setExpanded(true)}
          className="flex items-center gap-1 text-xs font-medium text-[var(--primary)] hover:underline"
        >
          Ubah Rentang <ChevronDown className="h-3.5 w-3.5" />
        </button>
      </CardSection>
    )
  }

  return (
    <CardSection className={cn('flex flex-wrap items-end gap-3', className)}>
      <div className="w-48">
        <InputSelect
          label="RENTANG"
          placeholder="Kustom"
          options={PRESET_OPTIONS}
          value={activePreset ?? ''}
          onChange={(e) => {
            if (e.target.value) onPresetClick?.(e.target.value as Preset)
          }}
        />
      </div>

      <div className="h-10 w-px self-end bg-[var(--border-divider)]" />

      <div className="w-40">
        <InputDate
          label="DARI"
          value={toDateValue(startDate)}
          max={toDateValue(endDate) || undefined}
          onChange={(e) => onStartChange(toStartIso(e.target.value))}
        />
      </div>
      <div className="w-40">
        <InputDate
          label="SAMPAI"
          value={toDateValue(endDate)}
          min={toDateValue(startDate) || undefined}
          onChange={(e) => onEndChange(toEndIso(e.target.value))}
        />
      </div>

      <button
        type="button"
        onClick={() => setExpanded(false)}
        className="ml-auto flex items-center gap-1 self-end pb-2.5 text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--primary)]"
      >
        Sembunyikan <ChevronUp className="h-3.5 w-3.5" />
      </button>
    </CardSection>
  )
}

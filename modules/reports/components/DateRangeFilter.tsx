'use client'

import { CardSection } from '@/components/common'
import { InputDate } from '@/components/ui-custom'
import { AppButton } from '@/components/ui-custom'
import { cn } from '@/lib/utils'

// ─────────────────────────────────────────
// DATE RANGE FILTER
// Filter periode persisten di atas setiap tab laporan.
// startDate/endDate diharapkan ISO string; input date
// hanya butuh bagian YYYY-MM-DD.
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

const PRESETS: Array<{ key: Preset; label: string }> = [
  { key: 'today', label: 'Hari Ini' },
  { key: '7d', label: '7 Hari' },
  { key: '30d', label: '30 Hari' },
  { key: '90d', label: '90 Hari' },
  { key: '12m', label: '12 Bulan' },
]

// ISO → "YYYY-MM-DD" untuk <input type="date">
const toDateValue = (iso: string) => (iso ? iso.slice(0, 10) : '')
// "YYYY-MM-DD" → ISO (awal hari, UTC)
const toIso = (value: string) => (value ? new Date(value).toISOString() : '')

export const DateRangeFilter = ({
  startDate,
  endDate,
  onStartChange,
  onEndChange,
  onPresetClick,
  activePreset,
  className,
}: DateRangeFilterProps) => (
  <CardSection
    className={cn('flex flex-wrap items-end gap-3', className)}
  >
    <div className="flex flex-wrap items-center gap-1.5">
      {PRESETS.map((p) => (
        <AppButton
          key={p.key}
          size="sm"
          variant={activePreset === p.key ? 'primary' : 'ghost'}
          onClick={() => onPresetClick?.(p.key)}
        >
          {p.label}
        </AppButton>
      ))}
    </div>

    <div className="h-8 w-px self-center bg-[var(--border-divider)]" />

    <div className="w-40">
      <InputDate
        label="DARI"
        value={toDateValue(startDate)}
        onChange={(e) => onStartChange(toIso(e.target.value))}
      />
    </div>
    <div className="w-40">
      <InputDate
        label="SAMPAI"
        value={toDateValue(endDate)}
        onChange={(e) => onEndChange(toIso(e.target.value))}
      />
    </div>
  </CardSection>
)

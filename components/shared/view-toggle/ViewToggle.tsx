'use client'

import { LayoutGrid, List } from 'lucide-react'
import { cn } from '@/lib/utils'

// ─────────────────────────────────────────
// VIEW TOGGLE
// Segmented control untuk switch tampilan
// list: mode baris (tabel) vs mode kartu.
// Dipakai bersama oleh vehicles & rooms.
// ─────────────────────────────────────────

export type ViewMode = 'row' | 'card'

interface ViewToggleProps {
  value:      ViewMode
  onChange:   (mode: ViewMode) => void
  className?: string
}

const OPTIONS: { value: ViewMode; label: string; Icon: typeof List }[] = [
  { value: 'row',  label: 'Tampilan baris', Icon: List },
  { value: 'card', label: 'Tampilan kartu', Icon: LayoutGrid },
]

export const ViewToggle = ({ value, onChange, className }: ViewToggleProps) => (
  <div
    role="group"
    aria-label="Mode tampilan"
    className={cn(
      'inline-flex shrink-0 items-center gap-1 rounded-lg bg-[var(--bg-subtle)] p-1',
      className,
    )}
  >
    {OPTIONS.map(({ value: mode, label, Icon }) => {
      const active = mode === value
      return (
        <button
          key={mode}
          type="button"
          onClick={() => onChange(mode)}
          title={label}
          aria-label={label}
          aria-pressed={active}
          className={cn(
            'flex h-8 w-8 items-center justify-center rounded-md transition-all duration-150',
            active
              ? 'bg-[var(--bg-card)] text-[var(--primary)] shadow-sm'
              : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]',
          )}
        >
          <Icon className="h-4 w-4" />
        </button>
      )
    })}
  </div>
)

'use client'

import { Card } from '@/components/common'
import { cn } from '@/lib/utils'
import { ChangeIndicator } from './ChangeIndicator'

// ─────────────────────────────────────────
// REPORT STAT CARD
// Seperti StatCard dashboard, tapi dengan ChangeIndicator
// + label perbandingan di bawah nilai.
// ─────────────────────────────────────────

export interface ReportStatCardProps {
  label: string
  value: string | number
  icon: React.ReactNode
  iconBg?: string
  change?: number
  changeLabel?: string
  goodDirection?: 'up' | 'down'
  className?: string
}

export const ReportStatCard = ({
  label,
  value,
  icon,
  iconBg,
  change,
  changeLabel,
  goodDirection = 'up',
  className,
}: ReportStatCardProps) => (
  <Card className={cn('flex flex-col gap-3', className)}>
    <div className="flex items-center gap-4">
      <div
        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl"
        style={{ backgroundColor: iconBg ?? 'var(--bg-subtle)' }}
      >
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--text-secondary)]">
          {label}
        </p>
        <p
          className="mt-0.5 text-2xl font-bold text-[var(--text-primary)]"
          style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
        >
          {value}
        </p>
      </div>
    </div>

    {change !== undefined && (
      <div className="flex items-center gap-2">
        <ChangeIndicator value={change} goodDirection={goodDirection} />
        {changeLabel && (
          <span className="text-xs text-[var(--text-secondary)]">{changeLabel}</span>
        )}
      </div>
    )}
  </Card>
)

'use client'

import { ArrowDownRight, ArrowUpRight } from 'lucide-react'
import { cn } from '@/lib/utils'

// ─────────────────────────────────────────
// CHANGE INDICATOR
// Pill perubahan persentase. goodDirection menentukan
// apakah kenaikan itu "baik" (hijau) atau "buruk" (merah).
// Untuk overdue, goodDirection='down'.
// ─────────────────────────────────────────

export interface ChangeIndicatorProps {
  value: number
  suffix?: string
  goodDirection?: 'up' | 'down'
  size?: 'sm' | 'md'
  className?: string
}

export const ChangeIndicator = ({
  value,
  suffix = '%',
  goodDirection = 'up',
  size = 'sm',
  className,
}: ChangeIndicatorProps) => {
  const isUp = value >= 0
  const isGood = goodDirection === 'up' ? isUp : !isUp
  const Icon = isUp ? ArrowUpRight : ArrowDownRight

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full font-semibold',
        size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-sm',
        isGood ? 'bg-green-50 text-[var(--success)]' : 'bg-red-50 text-[var(--danger)]',
        className,
      )}
    >
      <Icon className={size === 'sm' ? 'h-3 w-3' : 'h-3.5 w-3.5'} />
      {isUp ? '+' : ''}
      {value.toFixed(1)}
      {suffix}
    </span>
  )
}

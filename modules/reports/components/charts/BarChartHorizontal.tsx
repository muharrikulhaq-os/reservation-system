'use client'

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts'
import { cn } from '@/lib/utils'

// ─────────────────────────────────────────
// HORIZONTAL BAR CHART
// Untuk ranking: rating driver, biaya per kendaraan, dll.
// ─────────────────────────────────────────

export interface BarChartHorizontalProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: Array<Record<string, any>>
  nameKey: string
  valueKey: string
  barColor?: string
  height?: number
  formatValue?: (value: number) => string
  className?: string
}

interface BarTooltipProps {
  active?: boolean
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  payload?: Array<{ value?: number; payload?: Record<string, any> }>
  formatValue?: (v: number) => string
}

const BarTooltip = ({ active, payload, formatValue }: BarTooltipProps) => {
  if (!active || !payload?.length) return null
  const item = payload[0]
  return (
    <div className="rounded-xl border border-[var(--border-card)] bg-[var(--bg-card)] p-3 shadow-[0_4px_16px_rgba(0,0,0,0.10)]">
      <p className="text-xs font-semibold text-[var(--text-primary)]">
        {String(item.payload?.__name ?? '')}
      </p>
      <p className="text-xs text-[var(--text-secondary)]">
        <span className="font-semibold text-[var(--text-primary)]">
          {formatValue ? formatValue(Number(item.value)) : item.value}
        </span>
      </p>
    </div>
  )
}

export const BarChartHorizontal = ({
  data,
  nameKey,
  valueKey,
  barColor = 'var(--primary)',
  height,
  formatValue,
  className,
}: BarChartHorizontalProps) => {
  // Salin nameKey ke __name agar tooltip generik bisa membacanya.
  const rows = data.map((d) => ({ ...d, __name: d[nameKey] }))
  const resolvedHeight = height ?? Math.max(160, rows.length * 44)

  return (
    <div className={cn('w-full', className)}>
      <ResponsiveContainer width="100%" height={resolvedHeight}>
        <BarChart
          layout="vertical"
          data={rows}
          margin={{ top: 4, right: 16, bottom: 4, left: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border-divider)" horizontal={false} />
          <XAxis
            type="number"
            tickFormatter={formatValue}
            tick={{ fontSize: 11, fill: 'var(--text-secondary)' }}
            tickLine={false}
            axisLine={{ stroke: 'var(--border-divider)' }}
          />
          <YAxis
            type="category"
            dataKey={nameKey}
            width={120}
            tick={{ fontSize: 12, fill: 'var(--text-secondary)' }}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip
            cursor={{ fill: 'var(--bg-subtle)' }}
            content={<BarTooltip formatValue={formatValue} />}
          />
          <Bar dataKey={valueKey} fill={barColor} radius={[0, 4, 4, 0]} maxBarSize={28} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

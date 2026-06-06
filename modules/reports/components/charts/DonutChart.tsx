'use client'

import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  Tooltip,
} from 'recharts'
import { cn } from '@/lib/utils'

// ─────────────────────────────────────────
// DONUT CHART
// Distribusi: status booking, split tipe resource, dll.
// ─────────────────────────────────────────

export interface DonutChartProps {
  data: Array<{ name: string; value: number; color: string }>
  height?: number
  innerRadius?: number
  showLabel?: boolean
  showLegend?: boolean
  centerText?: string
  centerValue?: string | number
  className?: string
}

interface DonutTooltipProps {
  active?: boolean
  payload?: Array<{ name?: string; value?: number; payload?: { color?: string } }>
}

const DonutTooltip = ({ active, payload }: DonutTooltipProps) => {
  if (!active || !payload?.length) return null
  const item = payload[0]
  return (
    <div className="rounded-xl border border-[var(--border-card)] bg-[var(--bg-card)] p-3 shadow-[0_4px_16px_rgba(0,0,0,0.10)]">
      <div className="flex items-center gap-2 text-xs">
        <span className="h-2 w-2 rounded-full" style={{ backgroundColor: item.payload?.color }} />
        <span className="text-[var(--text-secondary)]">{item.name}</span>
        <span className="ml-auto font-semibold text-[var(--text-primary)]">{item.value}</span>
      </div>
    </div>
  )
}

export const DonutChart = ({
  data,
  height = 260,
  innerRadius = 60,
  showLabel = false,
  showLegend = true,
  centerText,
  centerValue,
  className,
}: DonutChartProps) => (
  <div className={cn('relative w-full', className)}>
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          innerRadius={innerRadius}
          outerRadius={90}
          paddingAngle={2}
          stroke="var(--bg-card)"
          strokeWidth={2}
          label={
            showLabel
              ? ({ name, value }: { name?: string; value?: number }) => `${name}: ${value}`
              : undefined
          }
        >
          {data.map((entry) => (
            <Cell key={entry.name} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip content={<DonutTooltip />} />
        {showLegend && (
          <Legend wrapperStyle={{ fontSize: 12 }} iconType="circle" iconSize={8} />
        )}
      </PieChart>
    </ResponsiveContainer>

    {(centerText || centerValue !== undefined) && (
      <div
        className="pointer-events-none absolute inset-x-0 flex flex-col items-center justify-center text-center"
        style={{ top: 0, height: showLegend ? height - 32 : height }}
      >
        {centerValue !== undefined && (
          <span
            className="text-2xl font-bold text-[var(--text-primary)]"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            {centerValue}
          </span>
        )}
        {centerText && (
          <span className="text-[11px] text-[var(--text-secondary)]">{centerText}</span>
        )}
      </div>
    )}
  </div>
)

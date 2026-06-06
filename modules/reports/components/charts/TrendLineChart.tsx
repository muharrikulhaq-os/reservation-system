'use client'

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts'
import { cn } from '@/lib/utils'

// ─────────────────────────────────────────
// TREND LINE CHART
// Reusable untuk booking trend, cost trend, dll.
// Warna garis WAJIB dilewatkan dari pemanggil (design token).
// ─────────────────────────────────────────

export interface TrendLineChartProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: Array<Record<string, any>>
  xKey: string
  lines: Array<{ key: string; label: string; color: string }>
  height?: number
  formatY?: (value: number) => string
  formatX?: (value: string) => string
  className?: string
}

// Bentuk minimal payload tooltip recharts (v3 tak meng-export tipe ini lugas).
interface TooltipPayloadItem {
  dataKey?: string | number
  name?: string
  value?: number
  color?: string
}

interface ChartTooltipProps {
  active?: boolean
  payload?: TooltipPayloadItem[]
  label?: string | number
  formatY?: (v: number) => string
  formatX?: (v: string) => string
}

const ChartTooltip = ({ active, payload, label, formatY, formatX }: ChartTooltipProps) => {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-xl border border-[var(--border-card)] bg-[var(--bg-card)] p-3 shadow-[0_4px_16px_rgba(0,0,0,0.10)]">
      <p className="mb-1.5 text-xs font-semibold text-[var(--text-primary)]">
        {formatX ? formatX(String(label)) : String(label)}
      </p>
      <div className="flex flex-col gap-1">
        {payload.map((item) => (
          <div key={String(item.dataKey)} className="flex items-center gap-2 text-xs">
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color }} />
            <span className="text-[var(--text-secondary)]">{item.name}</span>
            <span className="ml-auto font-semibold text-[var(--text-primary)]">
              {formatY ? formatY(Number(item.value)) : item.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

export const TrendLineChart = ({
  data,
  xKey,
  lines,
  height = 300,
  formatY,
  formatX,
  className,
}: TrendLineChartProps) => (
  <div className={cn('w-full', className)}>
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 8, right: 12, bottom: 4, left: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border-divider)" vertical={false} />
        <XAxis
          dataKey={xKey}
          tickFormatter={formatX}
          tick={{ fontSize: 11, fill: 'var(--text-secondary)' }}
          tickLine={false}
          axisLine={{ stroke: 'var(--border-divider)' }}
        />
        <YAxis
          tickFormatter={formatY}
          tick={{ fontSize: 11, fill: 'var(--text-secondary)' }}
          tickLine={false}
          axisLine={false}
          width={60}
        />
        <Tooltip
          cursor={{ stroke: 'var(--border-card)', strokeWidth: 1 }}
          content={<ChartTooltip formatY={formatY} formatX={formatX} />}
        />
        <Legend wrapperStyle={{ fontSize: 12, paddingTop: 8 }} iconType="circle" iconSize={8} />
        {lines.map((line) => (
          <Line
            key={line.key}
            type="monotone"
            dataKey={line.key}
            name={line.label}
            stroke={line.color}
            strokeWidth={2}
            dot={{ r: 3, fill: line.color, strokeWidth: 0 }}
            activeDot={{ r: 5 }}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  </div>
)

import { cn } from '@/lib/utils'
import { Card } from '@/components/common'

// ─────────────────────────────────────────
// STAT CARD
// Kartu statistik ringkas (dashboard, list, dll).
// Card primitif berada di @/components/common.
// ─────────────────────────────────────────

interface StatCardProps {
  label:      string
  value:      string | number
  icon:       React.ReactNode
  iconBg?:    string
  className?: string
}

export const StatCard = ({ label, value, icon, iconBg, className }: StatCardProps) => (
  <Card className={cn('flex items-center gap-4', className)}>
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
  </Card>
)

'use client'

import { AlertCircle, AlertTriangle } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { getErrorMessage } from '@/lib'
import { maintenanceStatusCfg, VEHICLE_ISSUE_STATUS_CONFIG } from '@/constants'
import type { VehicleIssueStatus } from '@/types'

// ─────────────────────────────────────────
// Potongan UI bersama modul maintenance
// ─────────────────────────────────────────

const Pill = ({ cfg }: { cfg: { label: string; bg: string; text: string; dot: string } }) => (
  <span
    className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-semibold"
    style={{ backgroundColor: cfg.bg, color: cfg.text }}
  >
    <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: cfg.dot }} />
    {cfg.label}
  </span>
)

export const MaintenanceStatusBadge = ({ status }: { status: string }) => (
  <Pill cfg={maintenanceStatusCfg(status)} />
)

export const VehicleIssueStatusBadge = ({ status }: { status: VehicleIssueStatus }) => (
  <Pill cfg={VEHICLE_ISSUE_STATUS_CONFIG[status]} />
)

export const ErrorAlert = ({ error }: { error: unknown }) =>
  error ? (
    <div className="flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
      <span>{typeof error === 'string' ? error : getErrorMessage(error)}</span>
    </div>
  ) : null

export const WarningAlert = ({ children }: { children: React.ReactNode }) => (
  <div className="flex items-start gap-2.5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
    <span>{children}</span>
  </div>
)

/** Kerangka dialog form (judul + isi + tombol). */
export const FormDialog = ({
  open,
  onOpenChange,
  title,
  icon,
  children,
  footer,
  wide,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  icon?: React.ReactNode
  children: React.ReactNode
  footer: React.ReactNode
  wide?: boolean
}) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent
      className={`max-h-[90vh] overflow-y-auto rounded-2xl p-6 shadow-[var(--shadow-modal)] ${wide ? 'sm:max-w-2xl' : 'sm:max-w-lg'}`}
    >
      <DialogHeader>
        <DialogTitle
          className="flex items-center gap-2 text-lg font-bold text-[var(--text-primary)]"
          style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
        >
          {icon}
          {title}
        </DialogTitle>
      </DialogHeader>
      <div className="mt-2 space-y-4">{children}</div>
      <div className="mt-6 flex items-center justify-end gap-3">{footer}</div>
    </DialogContent>
  </Dialog>
)

/** Baris label–nilai untuk kartu info. */
export const InfoRow = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <div className="flex items-start justify-between gap-4 py-2.5">
    <span className="shrink-0 text-xs font-semibold uppercase tracking-[0.06em] text-[var(--text-secondary)]">
      {label}
    </span>
    <span className="min-w-0 text-right text-sm text-[var(--text-primary)] [overflow-wrap:anywhere]">
      {value}
    </span>
  </div>
)

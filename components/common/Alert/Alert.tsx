'use client'

import * as React from 'react'
import { AlertCircle, CheckCircle2, AlertTriangle, Info, X } from 'lucide-react'
import { cn } from '@/lib'

// ─────────────────────────────────────────
// ALERT
// Kartu notifikasi inline - dipakai di atas
// form untuk menampilkan error response server,
// pesan sukses, peringatan, atau info.
//
// Usage:
//   <Alert variant="error">{getErrorMessage(error)}</Alert>
//   <Alert variant="success" title="Berhasil">Data tersimpan.</Alert>
// ─────────────────────────────────────────

export type AlertVariant = 'error' | 'success' | 'warning' | 'info'

const VARIANTS: Record<AlertVariant, { wrap: string; icon: React.ElementType }> = {
  error:   { wrap: 'border-red-100 bg-red-50 text-[var(--danger)]',     icon: AlertCircle },
  success: { wrap: 'border-green-100 bg-green-50 text-[var(--success)]', icon: CheckCircle2 },
  warning: { wrap: 'border-amber-100 bg-amber-50 text-[var(--warning)]', icon: AlertTriangle },
  info:    { wrap: 'border-sky-100 bg-sky-50 text-[var(--info)]',        icon: Info },
}

export interface AlertProps {
  variant?:   AlertVariant
  title?:     string
  children:   React.ReactNode
  onClose?:   () => void
  className?: string
}

export const Alert = ({ variant = 'error', title, children, onClose, className }: AlertProps) => {
  const { wrap, icon: Icon } = VARIANTS[variant]

  return (
    <div
      role="alert"
      className={cn(
        'flex items-start gap-2.5 rounded-xl border px-4 py-3 text-sm leading-relaxed',
        wrap,
        className,
      )}
    >
      <Icon className="mt-0.5 h-4 w-4 shrink-0" />
      <div className="min-w-0 flex-1">
        {title && <p className="font-semibold">{title}</p>}
        <div className={cn(title && 'mt-0.5')}>{children}</div>
      </div>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          aria-label="Tutup"
          className="shrink-0 opacity-60 transition-opacity hover:opacity-100"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  )
}

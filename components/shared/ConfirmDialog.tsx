'use client'

import React, { type ReactNode } from 'react'
import { AlertTriangle, Info, Trash2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { AppButton } from '@/components/ui-custom'

export interface ConfirmDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: ReactNode
  confirmText?: string
  cancelText?: string
  variant?: 'danger' | 'warning' | 'primary'
  loading?: boolean
  onConfirm: () => void
  icon?: ReactNode
}

export const ConfirmDialog = ({
  open,
  onOpenChange,
  title,
  description,
  confirmText = 'Ya, Hapus',
  cancelText = 'Batal',
  variant = 'danger',
  loading = false,
  onConfirm,
  icon,
}: ConfirmDialogProps) => {
  const getIcon = () => {
    if (icon) return icon
    switch (variant) {
      case 'danger':
        return <Trash2 className="h-6 w-6 text-[var(--danger)]" />
      case 'warning':
        return <AlertTriangle className="h-6 w-6 text-[var(--warning)]" />
      default:
        return <Info className="h-6 w-6 text-[var(--primary)]" />
    }
  }

  const getIconWrapperClass = () => {
    switch (variant) {
      case 'danger':
        return 'bg-red-50 text-red-600 border border-red-100 ring-4 ring-red-50/60 dark:bg-red-950/40 dark:border-red-900/50 dark:text-red-400'
      case 'warning':
        return 'bg-amber-50 text-amber-600 border border-amber-100 ring-4 ring-amber-50/60 dark:bg-amber-950/40 dark:border-amber-900/50 dark:text-amber-400'
      default:
        return 'bg-blue-50 text-blue-600 border border-blue-100 ring-4 ring-blue-50/60 dark:bg-blue-950/40 dark:border-blue-900/50 dark:text-blue-400'
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-2xl p-6 shadow-[var(--shadow-modal)] sm:max-w-[420px] overflow-hidden border border-[var(--border-card)]">
        <div className="flex flex-col items-center text-center sm:items-start sm:text-left">
          {/* Icon */}
          <div
            className={`flex h-12 w-12 items-center justify-center rounded-2xl transition-all mb-4 ${getIconWrapperClass()}`}
          >
            {getIcon()}
          </div>

          <DialogHeader className="p-0 text-left">
            <DialogTitle
              className="text-lg font-bold text-[var(--text-primary)]"
              style={{ fontFamily: "'Poppins', sans-serif" }}
            >
              {title}
            </DialogTitle>
            <DialogDescription asChild>
              <div className="mt-2 text-sm text-[var(--text-secondary)] leading-relaxed">
                {description}
              </div>
            </DialogDescription>
          </DialogHeader>

          {/* Action Buttons */}
          <div className="mt-6 flex w-full flex-col-reverse gap-2.5 sm:flex-row sm:justify-end">
            <AppButton
              variant="secondary"
              onClick={() => onOpenChange(false)}
              disabled={loading}
              className="w-full sm:w-auto min-w-[90px]"
            >
              {cancelText}
            </AppButton>
            <AppButton
              variant={variant === 'danger' ? 'danger' : 'primary'}
              onClick={onConfirm}
              loading={loading}
              className="w-full sm:w-auto min-w-[100px]"
            >
              {confirmText}
            </AppButton>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

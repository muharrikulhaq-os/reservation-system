'use client'

import {
  Plus,
  Ban,
  Check,
  X,
  Play,
  CheckCircle,
  ArrowRightLeft,
  Merge,
  UserCheck,
  Building2,
  FileCheck,
  Clock,
  Star,
  Bell,
} from 'lucide-react'
import { cn, formatRelativeTime } from '@/lib'
import { notificationTypeConfig } from '@/constants'
import type { AppNotification } from '@/types'

// Peta nama icon (string, dari NOTIFICATION_TYPE_CONFIG) → komponen lucide.
// Disimpan di komponen, bukan constants/ - constants/ harus bebas import
// React supaya bisa dipakai ulang di RN (lihat catatan di CLAUDE.md §10).
const NOTIFICATION_ICON: Record<string, React.ComponentType<{ className?: string }>> = {
  Plus,
  Ban,
  Check,
  X,
  Play,
  CheckCircle,
  ArrowRightLeft,
  Merge,
  UserCheck,
  Building2,
  FileCheck,
  Clock,
  Star,
  Bell,
}

interface NotificationItemProps {
  notification: AppNotification
  onClick: (notification: AppNotification) => void
}

export const NotificationItem = ({ notification, onClick }: NotificationItemProps) => {
  const cfg = notificationTypeConfig(notification.type)
  const Icon = NOTIFICATION_ICON[cfg.icon] ?? Bell

  return (
    <button
      type="button"
      onClick={() => onClick(notification)}
      className={cn(
        'flex w-full items-start gap-3 rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-[var(--bg-subtle)]',
        !notification.isRead && 'bg-[var(--primary-light)]/40',
      )}
    >
      <span
        className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
        style={{ backgroundColor: `${cfg.color}1A`, color: cfg.color }}
      >
        <Icon className="h-4 w-4" />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <p className="truncate text-sm font-semibold text-[var(--text-primary)]">
            {notification.title}
          </p>
          {!notification.isRead && (
            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--primary)]" />
          )}
        </div>
        <p className="mt-0.5 line-clamp-2 text-xs text-[var(--text-secondary)]">
          {notification.body}
        </p>
        <p className="mt-1 text-[10px] text-[var(--text-disabled)]">
          {formatRelativeTime(notification.createdAt)}
        </p>
      </div>
    </button>
  )
}

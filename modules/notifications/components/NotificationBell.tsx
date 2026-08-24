'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Bell, CheckCheck, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib'
import {
  useNotifications,
  useUnreadCount,
  useMarkNotificationAsRead,
  useMarkAllNotificationsAsRead,
} from '../hooks/useNotifications'
import { useNotificationSocket } from '../hooks/useNotificationSocket'
import { NotificationItem } from './NotificationItem'
import type { AppNotification } from '@/types'

const PREVIEW_LIMIT = 8

export const NotificationBell = () => {
  const [open, setOpen] = useState(false)
  const router = useRouter()

  // Koneksi realtime - selalu aktif selama Navbar ter-mount (seluruh
  // halaman terproteksi, lihat app/(main)/layout.tsx).
  useNotificationSocket()

  const { data: unreadCount = 0 } = useUnreadCount()
  const { data, isLoading } = useNotifications({ limit: PREVIEW_LIMIT })
  const { mutate: markAsRead } = useMarkNotificationAsRead()
  const { mutate: markAllAsRead, isPending: isMarkingAll } = useMarkAllNotificationsAsRead()

  const notifications = data?.data ?? []

  const handleItemClick = (n: AppNotification) => {
    if (!n.isRead) markAsRead(n.id)
    setOpen(false)
    if (n.relatedEntityId != null) router.push(`/booking/${n.relatedEntityId}`)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          aria-label="Notifikasi"
          className={cn(
            'relative flex h-9 w-9 items-center justify-center rounded-lg',
            'text-[var(--text-secondary)] transition-colors',
            'hover:bg-[var(--bg-subtle)] hover:text-[var(--text-primary)]',
          )}
        >
          <Bell className="h-[18px] w-[18px]" />
          {unreadCount > 0 && (
            <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[var(--danger)] px-1 text-[9px] font-semibold text-white">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </button>
      </PopoverTrigger>

      <PopoverContent align="end" className="w-[360px] p-0">
        <div className="flex items-center justify-between border-b border-[var(--border-divider)] px-3 py-2.5">
          <p className="text-sm font-semibold text-[var(--text-primary)]">Notifikasi</p>
          {unreadCount > 0 && (
            <button
              type="button"
              onClick={() => markAllAsRead()}
              disabled={isMarkingAll}
              className="flex items-center gap-1 text-xs font-medium text-[var(--primary)] hover:underline disabled:opacity-50"
            >
              {isMarkingAll ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <CheckCheck className="h-3 w-3" />
              )}
              Tandai semua dibaca
            </button>
          )}
        </div>

        <div className="max-h-[380px] overflow-y-auto p-1.5">
          {isLoading ? (
            <p className="px-3 py-6 text-center text-xs text-[var(--text-secondary)]">
              Memuat...
            </p>
          ) : notifications.length === 0 ? (
            <p className="px-3 py-6 text-center text-xs text-[var(--text-secondary)]">
              Belum ada notifikasi
            </p>
          ) : (
            <div className="space-y-0.5">
              {notifications.map((n) => (
                <NotificationItem key={n.id} notification={n} onClick={handleItemClick} />
              ))}
            </div>
          )}
        </div>

        <div className="border-t border-[var(--border-divider)] p-2">
          <Link
            href="/notifications"
            onClick={() => setOpen(false)}
            className="block rounded-lg px-3 py-1.5 text-center text-xs font-medium text-[var(--primary)] hover:bg-[var(--bg-subtle)]"
          >
            Lihat semua notifikasi
          </Link>
        </div>
      </PopoverContent>
    </Popover>
  )
}

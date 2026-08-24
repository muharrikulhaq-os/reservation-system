'use client'

import { useRouter } from 'next/navigation'
import { CheckCheck } from 'lucide-react'
import { PageHeader, Pagination } from '@/components/shared'
import { AppButton } from '@/components/ui-custom'
import { usePagination } from '@/hooks'
import {
  useNotifications,
  useMarkNotificationAsRead,
  useMarkAllNotificationsAsRead,
} from './hooks/useNotifications'
import { NotificationItem } from './components/NotificationItem'
import type { AppNotification } from '@/types'

export const NotificationsPage = () => {
  const router = useRouter()
  const { setPage, params } = usePagination(20)

  const { data, isLoading } = useNotifications(params)
  const { mutate: markAsRead } = useMarkNotificationAsRead()
  const { mutate: markAllAsRead, isPending: isMarkingAll } = useMarkAllNotificationsAsRead()

  const notifications = data?.data ?? []
  const hasUnread = notifications.some((n) => !n.isRead)

  const handleItemClick = (n: AppNotification) => {
    if (!n.isRead) markAsRead(n.id)
    if (n.relatedEntityId != null) router.push(`/booking/${n.relatedEntityId}`)
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Notifikasi"
        description="Riwayat pemberitahuan untuk akun Anda"
        actions={
          hasUnread ? (
            <AppButton
              variant="secondary"
              leftIcon={<CheckCheck className="h-4 w-4" />}
              loading={isMarkingAll}
              onClick={() => markAllAsRead()}
            >
              Tandai semua dibaca
            </AppButton>
          ) : undefined
        }
      />

      <div className="rounded-2xl border border-[var(--border-card)] bg-[var(--bg-card)] p-5 shadow-[0_1px_4px_rgba(0,0,0,0.06)]">
        {isLoading ? (
          <p className="py-10 text-center text-sm text-[var(--text-secondary)]">Memuat...</p>
        ) : notifications.length === 0 ? (
          <p className="py-10 text-center text-sm text-[var(--text-secondary)]">
            Belum ada notifikasi
          </p>
        ) : (
          <div className="space-y-1">
            {notifications.map((n) => (
              <NotificationItem key={n.id} notification={n} onClick={handleItemClick} />
            ))}
          </div>
        )}

        {data?.pagination && data.pagination.total > 0 && (
          <Pagination pagination={data.pagination} onPageChange={setPage} />
        )}
      </div>
    </div>
  )
}

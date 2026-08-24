'use client'

// ─────────────────────────────────────────
// useNotificationSocket
// Koneksi realtime ke /ws untuk notifikasi masuk - dipasang sekali di
// <NotificationBell/> (selalu ter-mount di layout (main), lihat
// app/(main)/layout.tsx) sehingga aktif di seluruh halaman terproteksi.
//
// Pakai WebSocket global bawaan (BUKAN library tambahan) - tersedia baik di
// browser maupun React Native, jadi hook ini siap dipakai ulang saat
// ekspansi mobile tanpa perlu diganti.
// ─────────────────────────────────────────

import { useEffect, useRef } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { QUERY_KEYS, API_ENDPOINTS } from '@/constants'
import { buildWsUrl } from '@/lib'
import { useAuthStore } from '@/store/auth.store'
import type { NotificationSocketMessage } from '@/types'

const RECONNECT_BASE_DELAY_MS = 1_000
const RECONNECT_MAX_DELAY_MS = 30_000

interface UseNotificationSocketOptions {
  /** Dipanggil untuk setiap notifikasi baru yang masuk - mis. untuk toast. */
  onMessage?: (msg: NotificationSocketMessage) => void
}

export const useNotificationSocket = (options?: UseNotificationSocketOptions) => {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const accessToken = useAuthStore((s) => s.accessToken)
  const qc = useQueryClient()

  // Ref agar callback terbaru terpakai tanpa memicu reconnect effect.
  const onMessageRef = useRef(options?.onMessage)
  onMessageRef.current = options?.onMessage

  useEffect(() => {
    if (!isAuthenticated || !accessToken) return
    if (typeof WebSocket === 'undefined') return

    let socket: WebSocket | null = null
    let reconnectTimer: ReturnType<typeof setTimeout> | null = null
    let attempt = 0
    let cleanedUp = false

    const connect = () => {
      socket = new WebSocket(buildWsUrl(API_ENDPOINTS.NOTIFICATIONS.WS, accessToken))

      socket.onopen = () => {
        attempt = 0
      }

      socket.onmessage = (event) => {
        // Backend (WritePump) bisa menggabung beberapa pesan yang di-queue
        // jadi satu frame teks, dipisah "\n" - jangan asumsikan satu frame
        // = satu JSON.
        const lines = String(event.data).split('\n').filter(Boolean)
        for (const line of lines) {
          try {
            const msg = JSON.parse(line) as NotificationSocketMessage
            qc.invalidateQueries({ queryKey: QUERY_KEYS.NOTIFICATIONS })
            qc.invalidateQueries({ queryKey: QUERY_KEYS.NOTIFICATIONS_UNREAD_COUNT })
            onMessageRef.current?.(msg)
          } catch {
            // abaikan baris yang bukan JSON valid
          }
        }
      }

      socket.onclose = () => {
        if (cleanedUp) return
        const delay = Math.min(RECONNECT_BASE_DELAY_MS * 2 ** attempt, RECONNECT_MAX_DELAY_MS)
        attempt += 1
        reconnectTimer = setTimeout(connect, delay)
      }

      socket.onerror = () => {
        socket?.close()
      }
    }

    connect()

    return () => {
      cleanedUp = true
      if (reconnectTimer) clearTimeout(reconnectTimer)
      socket?.close()
    }
    // accessToken berubah (mis. silent refresh) → reconnect otomatis pakai token baru.
  }, [isAuthenticated, accessToken, qc])
}

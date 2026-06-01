'use client'

import { useEffect } from 'react'
import { tokenStorage } from '@/lib'
import { useAuthStore } from '@/store/auth.store'
import { authService } from '@/services'

// ─────────────────────────────────────────
// AUTH PROVIDER
// Letakkan di root layout.
// Saat mount: cek token di localStorage →
// fetch /me → hydrate Zustand store.
// ─────────────────────────────────────────

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const setAuth   = useAuthStore((s) => s.setAuth)
  const clearAuth = useAuthStore((s) => s.clearAuth)

  useEffect(() => {
    const accessToken  = tokenStorage.getAccess()
    const refreshToken = tokenStorage.getRefresh()

    if (!accessToken || !refreshToken) return

    // Fetch /me untuk hydrate user data
    authService.getMe()
      .then(({ data: user }) => {
        setAuth(
          {
            id:          user.id,
            employeeId:  user.employeeId,
            name:        user.name,
            email:       user.email,
            role:        user.role.name,
            department:  user.department.name,
          },
          accessToken,
          refreshToken,
        )
      })
      .catch(() => {
        // Token invalid / expired dan refresh gagal → bersihkan
        clearAuth()
      })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return <>{children}</>
}
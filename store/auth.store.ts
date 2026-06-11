// ─────────────────────────────────────────
// AUTH STORE — Zustand
// Menyimpan user & token di memory.
// Token persisten di localStorage via tokenStorage.
// ─────────────────────────────────────────

import { create } from 'zustand'
import { tokenStorage } from '@/lib'
import type { AuthUser, RoleName } from '@/types'

interface AuthStore {
  user: AuthUser | null
  accessToken: string | null
  isAuthenticated: boolean

  // Actions
  setAuth: (user: AuthUser, accessToken: string, refreshToken: string) => void
  setAccessToken: (token: string) => void
  clearAuth: () => void

  // Helpers
  hasRole: (role: RoleName | RoleName[]) => boolean
  isAdmin: () => boolean
  isDriver: () => boolean
  isEmployee: () => boolean
  isRoomKeeper: () => boolean
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  user:            null,
  accessToken:     null,
  isAuthenticated: false,

  setAuth: (user, accessToken, refreshToken) => {
    tokenStorage.setTokens(accessToken, refreshToken)
    set({ user, accessToken, isAuthenticated: true })
  },

  setAccessToken: (token) => {
    tokenStorage.setAccess(token)
    set({ accessToken: token })
  },

  clearAuth: () => {
    tokenStorage.clearAll()
    set({ user: null, accessToken: null, isAuthenticated: false })
  },

  hasRole: (role) => {
    const { user } = get()
    if (!user) return false
    const roles = Array.isArray(role) ? role : [role]
    return roles.includes(user.role as RoleName)
  },

  isAdmin:      () => get().hasRole('ADMIN'),
  isDriver:     () => get().hasRole('DRIVER'),
  isEmployee:   () => get().hasRole('EMPLOYEE'),
  isRoomKeeper: () => get().hasRole('ROOM_KEEPER'),
}))
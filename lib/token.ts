// ─────────────────────────────────────────
// TOKEN MANAGEMENT
// Abstraksi atas storage - jangan akses
// localStorage langsung di luar file ini
// ─────────────────────────────────────────

import { TOKEN_CONFIG } from '@/constants'

export const tokenStorage = {
  getAccess: (): string | null => {
    if (typeof window === 'undefined') return null
    return localStorage.getItem(TOKEN_CONFIG.ACCESS_TOKEN_KEY)
  },

  getRefresh: (): string | null => {
    if (typeof window === 'undefined') return null
    return localStorage.getItem(TOKEN_CONFIG.REFRESH_TOKEN_KEY)
  },

  setAccess: (token: string): void => {
    if (typeof window === 'undefined') return
    localStorage.setItem(TOKEN_CONFIG.ACCESS_TOKEN_KEY, token)
  },

  setRefresh: (token: string): void => {
    if (typeof window === 'undefined') return
    localStorage.setItem(TOKEN_CONFIG.REFRESH_TOKEN_KEY, token)
  },

  setTokens: (access: string, refresh: string): void => {
    tokenStorage.setAccess(access)
    tokenStorage.setRefresh(refresh)
  },

  clearAll: (): void => {
    if (typeof window === 'undefined') return
    localStorage.removeItem(TOKEN_CONFIG.ACCESS_TOKEN_KEY)
    localStorage.removeItem(TOKEN_CONFIG.REFRESH_TOKEN_KEY)
  },
}
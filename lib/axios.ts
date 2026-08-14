// ─────────────────────────────────────────
// AXIOS INSTANCE
// - Auth header injection
// - Silent token refresh (401)
// - Request queue saat refresh berlangsung
// - Cookie sync untuk Next.js middleware
// ─────────────────────────────────────────

import axios, {
  type AxiosInstance,
  type AxiosError,
  type InternalAxiosRequestConfig,
} from 'axios'
import { APP_CONFIG, API_ENDPOINTS, TOKEN_CONFIG } from '@/constants'
import { tokenStorage } from './token'
import type { ApiResponse, RefreshTokenResponse } from '@/types'

// ── Cookie helpers (untuk middleware) ────
// Middleware Edge Runtime tidak bisa akses localStorage,
// maka token juga disimpan di cookie (non-httpOnly, client-writable)

const setCookie = (name: string, value: string, days = 1): void => {
  if (typeof document === 'undefined') return
  const expires = new Date(Date.now() + days * 864e5).toUTCString()
  document.cookie = `${name}=${value}; path=/; expires=${expires}; SameSite=Lax`
}

const deleteCookie = (name: string): void => {
  if (typeof document === 'undefined') return
  document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`
}

export const syncTokensToCookies = (accessToken: string, role: string): void => {
  setCookie(TOKEN_CONFIG.ACCESS_TOKEN_KEY, accessToken)
  setCookie('user_role', role)
}

export const clearTokenCookies = (): void => {
  deleteCookie(TOKEN_CONFIG.ACCESS_TOKEN_KEY)
  deleteCookie('user_role')
}

// ── Instance ────────────────────────────

export const apiClient: AxiosInstance = axios.create({
  baseURL: APP_CONFIG.API_BASE_URL,
  timeout: APP_CONFIG.REQUEST_TIMEOUT,
  headers: { 'Content-Type': 'application/json' },
})

// ── Token Refresh Queue ──────────────────

let isRefreshing = false
let failedQueue: Array<{
  resolve: (token: string) => void
  reject: (err: unknown) => void
}> = []

const processQueue = (error: unknown, token: string | null = null): void => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error)
    } else if (token) {
      resolve(token)
    }
  })
  failedQueue = []
}

// ── Request Interceptor ──────────────────

apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = tokenStorage.getAccess()
    if (token) config.headers.Authorization = `Bearer ${token}`
    return config
  },
  (error) => Promise.reject(error),
)

// ── Response Interceptor ─────────────────

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as InternalAxiosRequestConfig & { _retry?: boolean }

    const is401          = error.response?.status === 401
    const alreadyRetried = original._retry

    // 401 dari endpoint auth BUKAN sesi kedaluwarsa:
    // - /auth/login  → kredensial salah, error harus sampai ke form
    // - /auth/refresh → refresh-nya sendiri yang gagal
    // Kalau ikut alur refresh, keduanya berujung handleLogout() →
    // reload halaman dan pesan errornya hilang sebelum sempat terbaca.
    const isAuthEndpoint =
      original.url?.includes(API_ENDPOINTS.AUTH.LOGIN) ||
      original.url?.includes(API_ENDPOINTS.AUTH.REFRESH)

    if (!is401 || alreadyRetried || isAuthEndpoint) {
      return Promise.reject(error)
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject })
      }).then((token) => {
        original.headers.Authorization = `Bearer ${token}`
        return apiClient(original)
      })
    }

    original._retry = true
    isRefreshing    = true

    const refreshToken = tokenStorage.getRefresh()

    if (!refreshToken) {
      processQueue(error)
      isRefreshing = false
      handleLogout()
      return Promise.reject(error)
    }

    try {
      const { data } = await axios.post<ApiResponse<RefreshTokenResponse>>(
        `${APP_CONFIG.API_BASE_URL}${API_ENDPOINTS.AUTH.REFRESH}`,
        { refreshToken },
      )

      const { accessToken: newAccess, refreshToken: newRefresh } = data.data
      tokenStorage.setTokens(newAccess, newRefresh)
      apiClient.defaults.headers.common.Authorization = `Bearer ${newAccess}`
      original.headers.Authorization = `Bearer ${newAccess}`

      processQueue(null, newAccess)
      return apiClient(original)
    } catch (refreshError) {
      processQueue(refreshError)
      handleLogout()
      return Promise.reject(refreshError)
    } finally {
      isRefreshing = false
    }
  },
)

const handleLogout = (): void => {
  tokenStorage.clearAll()
  clearTokenCookies()
  if (typeof window === 'undefined') return
  // Sudah di halaman login - redirect hanya akan me-reload halaman
  // dan menghapus pesan error yang sedang tampil.
  if (window.location.pathname === '/login') return
  window.location.href = '/login'
}
// ─────────────────────────────────────────
// AUTH HOOKS - dengan cookie sync & store
// ─────────────────────────────────────────

import { useEffect } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useMutation } from '@/lib/mutation'
import { useRouter } from 'next/navigation'
import { QUERY_KEYS } from '@/constants'
import { authService } from '@/services'
import { tokenStorage, syncTokensToCookies, clearTokenCookies } from '@/lib'
import { useAuthStore } from '@/store/auth.store'
import type {
  AuthUser,
  LoginPayload,
  ChangePasswordPayload,
  ForgotPasswordPayload,
  VerifyOtpPayload,
  ResetPasswordPayload,
} from '@/types'

// ── Queries ──────────────────────────────

export const useMe = () =>
  useQuery({
    queryKey: QUERY_KEYS.AUTH_ME,
    queryFn:  () => authService.getMe().then((r) => r.data),
    retry:    false,
  })

/**
 * Jaga user di auth store (dibaca Navbar/Sidebar) tetap sama dengan
 * /auth/me. Store hanya diisi sekali saat halaman dimuat, jadi tanpa ini
 * perubahan nama/role/departemen akun sendiri (mis. oleh admin lain) baru
 * terlihat setelah reload. AUTH_ME ikut di-invalidate topik `user`
 * (constants/sync.ts). Pasang SEKALI di layout terproteksi.
 */
export const useSyncAuthUser = () => {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const { data } = useQuery({
    queryKey: QUERY_KEYS.AUTH_ME,
    queryFn: () => authService.getMe().then((r) => r.data),
    enabled: isAuthenticated,
    retry: false,
  })

  useEffect(() => {
    if (!data) return
    const { user, accessToken, updateUser } = useAuthStore.getState()
    if (!user) return
    // Defensif: data tak lengkap tidak boleh membuat header crash atau
    // menghapus role (gating rute) - lewati saja.
    const role = data.role?.name
    if (!role) return
    const next: AuthUser = {
      id: data.id,
      employeeId: data.employeeId ?? user.employeeId,
      name: data.name ?? user.name,
      email: data.email ?? user.email,
      role,
      department: data.department?.name ?? user.department,
    }
    const changed = (Object.keys(next) as (keyof AuthUser)[]).some(
      (k) => next[k] !== user[k],
    )
    if (!changed) return
    updateUser(next)
    // Cookie role dipakai proxy.ts untuk gating rute.
    if (next.role !== user.role && accessToken) {
      syncTokensToCookies(accessToken, next.role)
    }
  }, [data])
}

// ── Mutations ────────────────────────────

export const useLogin = () => {
  const qc      = useQueryClient()
  const setAuth = useAuthStore((s) => s.setAuth)
  const router  = useRouter()

  return useMutation({
    mutationFn: (payload: LoginPayload) => authService.login(payload),
    onSuccess: ({ data }) => {
      const { accessToken, refreshToken, user } = data
      setAuth(user, accessToken, refreshToken)
      syncTokensToCookies(accessToken, user.role)
      qc.invalidateQueries({ queryKey: QUERY_KEYS.AUTH_ME })
      router.replace('/dashboard')
    },
  })
}

export const useLogout = () => {
  const qc        = useQueryClient()
  const clearAuth = useAuthStore((s) => s.clearAuth)
  const router    = useRouter()

  return useMutation({
    mutationFn: () => {
      const refreshToken = tokenStorage.getRefresh() ?? ''
      return authService.logout({ refreshToken })
    },
    onSettled: () => {
      clearAuth()
      clearTokenCookies()
      qc.clear()
      router.replace('/login')
    },
  })
}

export const useChangePassword = () =>
  useMutation({
    mutationFn: (payload: ChangePasswordPayload) =>
      authService.changePassword(payload),
  })

// ── Lupa password (user, 3 langkah: email → OTP → password baru) ──

// Backend sengaja SELALU sukses walau email tak terdaftar (anti user-enumeration).
export const useForgotPassword = () =>
  useMutation({
    mutationFn: (payload: ForgotPasswordPayload) =>
      authService.forgotPassword(payload),
  })

// Mengembalikan resetToken yang dipakai di langkah reset.
export const useVerifyOtp = () =>
  useMutation({
    mutationFn: (payload: VerifyOtpPayload) =>
      authService.verifyOtp(payload).then((r) => r.data),
  })

export const useResetPassword = () =>
  useMutation({
    mutationFn: (payload: ResetPasswordPayload) =>
      authService.resetPassword(payload),
  })

export const useUpdateProfilePhoto = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (file: File) => authService.updateProfilePhoto(file),
    onSuccess:  () => qc.invalidateQueries({ queryKey: QUERY_KEYS.AUTH_ME }),
  })
}

export const useDeleteProfilePhoto = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () => authService.deleteProfilePhoto(),
    onSuccess:  () => qc.invalidateQueries({ queryKey: QUERY_KEYS.AUTH_ME }),
  })
}
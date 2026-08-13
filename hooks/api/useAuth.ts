// ─────────────────────────────────────────
// AUTH HOOKS — dengan cookie sync & store
// ─────────────────────────────────────────

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { QUERY_KEYS } from '@/constants'
import { authService } from '@/services'
import { tokenStorage, syncTokensToCookies, clearTokenCookies } from '@/lib'
import { useAuthStore } from '@/store/auth.store'
import type {
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
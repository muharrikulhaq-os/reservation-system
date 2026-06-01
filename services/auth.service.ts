// ─────────────────────────────────────────
// AUTH SERVICE
// ─────────────────────────────────────────

import { apiClient } from '@/lib'
import { API_ENDPOINTS } from '@/constants'
import type {
  ApiResponse,
  User,
  LoginPayload,
  LoginResponse,
  RegisterPayload,
  RefreshTokenPayload,
  RefreshTokenResponse,
  LogoutPayload,
  ForgotPasswordPayload,
  VerifyOtpPayload,
  VerifyOtpResponse,
  ResetPasswordPayload,
  ChangePasswordPayload,
  UpdateProfilePhotoResponse,
} from '@/types'

export const authService = {
  register: (payload: RegisterPayload) =>
    apiClient
      .post<ApiResponse<User>>(API_ENDPOINTS.AUTH.REGISTER, payload)
      .then((r) => r.data),

  login: (payload: LoginPayload) =>
    apiClient
      .post<ApiResponse<LoginResponse>>(API_ENDPOINTS.AUTH.LOGIN, payload)
      .then((r) => r.data),

  refresh: (payload: RefreshTokenPayload) =>
    apiClient
      .post<ApiResponse<RefreshTokenResponse>>(API_ENDPOINTS.AUTH.REFRESH, payload)
      .then((r) => r.data),

  logout: (payload: LogoutPayload) =>
    apiClient
      .post<ApiResponse<null>>(API_ENDPOINTS.AUTH.LOGOUT, payload)
      .then((r) => r.data),

  forgotPassword: (payload: ForgotPasswordPayload) =>
    apiClient
      .post<ApiResponse<null>>(API_ENDPOINTS.AUTH.FORGOT_PASSWORD, payload)
      .then((r) => r.data),

  verifyOtp: (payload: VerifyOtpPayload) =>
    apiClient
      .post<ApiResponse<VerifyOtpResponse>>(API_ENDPOINTS.AUTH.VERIFY_OTP, payload)
      .then((r) => r.data),

  resetPassword: (payload: ResetPasswordPayload) =>
    apiClient
      .post<ApiResponse<null>>(API_ENDPOINTS.AUTH.RESET_PASSWORD, payload)
      .then((r) => r.data),

  changePassword: (payload: ChangePasswordPayload) =>
    apiClient
      .patch<ApiResponse<null>>(API_ENDPOINTS.AUTH.CHANGE_PASSWORD, payload)
      .then((r) => r.data),

  getMe: () =>
    apiClient
      .get<ApiResponse<User>>(API_ENDPOINTS.AUTH.ME)
      .then((r) => r.data),

  updateProfilePhoto: (file: File) => {
    const form = new FormData()
    form.append('photo', file)
    return apiClient
      .put<ApiResponse<UpdateProfilePhotoResponse>>(
        API_ENDPOINTS.USERS.ME_PHOTO,
        form,
        { headers: { 'Content-Type': 'multipart/form-data' } },
      )
      .then((r) => r.data)
  },

  deleteProfilePhoto: () =>
    apiClient
      .delete<ApiResponse<null>>(API_ENDPOINTS.USERS.ME_PHOTO)
      .then((r) => r.data),
}

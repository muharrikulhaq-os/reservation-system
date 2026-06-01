// ─────────────────────────────────────────
// USER SERVICE
// ─────────────────────────────────────────

import { apiClient } from '@/lib'
import { API_ENDPOINTS } from '@/constants'
import type {
  ApiResponse,
  PaginatedResponse,
  User,
  Role,
  Department,
  UserQueryParams,
  CreateUserPayload,
  UpdateUserPayload,
  ToggleActiveResponse,
  UpdateProfilePhotoResponse,
} from '@/types'

export const userService = {
  // ── List & Detail ─────────────────────

  getAll: (params?: UserQueryParams) =>
    apiClient
      .get<PaginatedResponse<User>>(API_ENDPOINTS.USERS.BASE, { params })
      .then((r) => r.data),

  getById: (id: number) =>
    apiClient
      .get<ApiResponse<User>>(API_ENDPOINTS.USERS.BY_ID(id))
      .then((r) => r.data),

  getMe: () =>
    apiClient
      .get<ApiResponse<User>>(API_ENDPOINTS.USERS.ME)
      .then((r) => r.data),

  // ── Lookup (dropdown) ─────────────────

  getRoles: () =>
    apiClient
      .get<ApiResponse<Role[]>>(API_ENDPOINTS.USERS.ROLES)
      .then((r) => r.data),

  getDepartments: () =>
    apiClient
      .get<ApiResponse<Department[]>>(API_ENDPOINTS.USERS.DEPARTMENTS)
      .then((r) => r.data),

  // ── CRUD ──────────────────────────────

  create: (payload: CreateUserPayload) =>
    apiClient
      .post<ApiResponse<User>>(API_ENDPOINTS.USERS.BASE, payload)
      .then((r) => r.data),

  update: (id: number, payload: UpdateUserPayload) =>
    apiClient
      .put<ApiResponse<User>>(API_ENDPOINTS.USERS.BY_ID(id), payload)
      .then((r) => r.data),

  toggleActive: (id: number) =>
    apiClient
      .patch<ApiResponse<ToggleActiveResponse>>(API_ENDPOINTS.USERS.TOGGLE_ACTIVE(id))
      .then((r) => r.data),

  delete: (id: number) =>
    apiClient
      .delete<ApiResponse<null>>(API_ENDPOINTS.USERS.BY_ID(id))
      .then((r) => r.data),

  // ── Photo (Admin — update foto user lain) ──

  updatePhotoById: (id: number, file: File) => {
    const form = new FormData()
    form.append('photo', file)
    return apiClient
      .put<ApiResponse<UpdateProfilePhotoResponse>>(
        API_ENDPOINTS.USERS.PHOTO_BY_ID(id),
        form,
        { headers: { 'Content-Type': 'multipart/form-data' } },
      )
      .then((r) => r.data)
  },
}

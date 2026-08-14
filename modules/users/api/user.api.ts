// ─────────────────────────────────────────
// USER API (call layer)
// Semua endpoint sudah tersedia di backend - tidak ada dummy.
// ─────────────────────────────────────────

import { isAxiosError } from 'axios'
import { apiClient } from '@/lib'
import { API_ENDPOINTS } from '@/constants'
import type {
  ApiResponse,
  PaginatedResponse,
  User,
  UserSummary,
  Role,
  Department,
  UserQueryParams,
  CreateUserPayload,
  UpdateUserPayload,
  ToggleActiveResponse,
  UpdateProfilePhotoResponse,
  BulkImportResult,
} from '@/types'

// ── Helper: download biner ────────────────

// Ambil nama file dari header Content-Disposition (RFC 5987 & bentuk polos).
const filenameFromDisposition = (value?: string): string | undefined => {
  if (!value) return undefined
  const utf8 = /filename\*=UTF-8''([^;]+)/i.exec(value)
  if (utf8) return decodeURIComponent(utf8[1])
  const plain = /filename="?([^";]+)"?/i.exec(value)
  return plain ? plain[1] : undefined
}

// Saat responseType='blob', body error dari API juga berupa Blob -
// ubah kembali ke JSON agar getErrorMessage() bisa membaca pesannya.
const normalizeBlobError = async (error: unknown): Promise<unknown> => {
  if (isAxiosError(error) && error.response?.data instanceof Blob) {
    try {
      const text = await error.response.data.text()
      error.response.data = JSON.parse(text)
    } catch {
      // Body bukan JSON - biarkan apa adanya, fallback getErrorMessage yang dipakai.
    }
  }
  return error
}

export const userApi = {
  // ── List & Detail ─────────────────────

  getAll: (params?: UserQueryParams) =>
    apiClient
      .get<PaginatedResponse<User>>(API_ENDPOINTS.USERS.BASE, { params })
      .then((r) => r.data),

  getById: (id: number) =>
    apiClient
      .get<ApiResponse<User>>(API_ENDPOINTS.USERS.BY_ID(id))
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

  // Reset password oleh ADMIN - langsung, tanpa OTP.
  resetPassword: (id: number, newPassword: string) =>
    apiClient
      .patch<ApiResponse<null>>(API_ENDPOINTS.USERS.RESET_PASSWORD(id), { newPassword })
      .then((r) => r.data),

  delete: (id: number) =>
    apiClient
      .delete<ApiResponse<null>>(API_ENDPOINTS.USERS.BY_ID(id))
      .then((r) => r.data),

  // ── Photo (admin - update foto user lain) ──

  updatePhoto: (id: number, file: File) => {
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

  // ── Bulk Import (Excel) ────────────────

  // Template .xlsx berisi sheet "Users" + sheet "Referensi"
  // (daftar role & departemen valid). Dikirim sebagai binary.
  downloadBulkTemplate: () =>
    apiClient
      .get<Blob>(API_ENDPOINTS.USERS.BULK_TEMPLATE, { responseType: 'blob' })
      .then((r) => ({
        blob: r.data,
        filename:
          filenameFromDisposition(r.headers['content-disposition']) ??
          'template-import-users.xlsx',
      }))
      .catch(async (error: unknown) => {
        throw await normalizeBlobError(error)
      }),

  bulkImport: (file: File) => {
    const form = new FormData()
    form.append('file', file)
    return apiClient
      .post<ApiResponse<BulkImportResult>>(API_ENDPOINTS.USERS.BULK_IMPORT, form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .then((r) => r.data)
  },

  // ── Lookup (dropdown) ──────────────────

  // Agregat untuk stat card - dihitung backend atas seluruh data,
  // bukan hanya halaman yang sedang tampil.
  getSummary: () =>
    apiClient
      .get<ApiResponse<UserSummary>>(API_ENDPOINTS.USERS.SUMMARY)
      .then((r) => r.data),

  getRoles: () =>
    apiClient
      .get<ApiResponse<Role[]>>(API_ENDPOINTS.USERS.ROLES)
      .then((r) => r.data),

  getDepartments: () =>
    apiClient
      .get<ApiResponse<Department[]>>(API_ENDPOINTS.USERS.DEPARTMENTS)
      .then((r) => r.data),

  createDepartment: (name: string) =>
    apiClient
      .post<ApiResponse<Department>>(API_ENDPOINTS.USERS.DEPARTMENTS, { name })
      .then((r) => r.data),

  updateDepartment: (id: number, name: string) =>
    apiClient
      .put<ApiResponse<Department>>(`${API_ENDPOINTS.USERS.DEPARTMENTS}/${id}`, { name })
      .then((r) => r.data),

  deleteDepartment: (id: number) =>
    apiClient
      .delete<ApiResponse<null>>(`${API_ENDPOINTS.USERS.DEPARTMENTS}/${id}`)
      .then((r) => r.data),
}

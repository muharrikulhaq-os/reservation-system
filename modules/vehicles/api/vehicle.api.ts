// ─────────────────────────────────────────
// VEHICLE SERVICE
// ─────────────────────────────────────────

import { apiClient } from '@/lib'
import { API_ENDPOINTS } from '@/constants'
import type {
  ApiResponse,
  PaginatedResponse,
  Vehicle,
  VehicleCategory,
  Attachment,
  VehicleQueryParams,
  CreateVehiclePayload,
  UpdateVehiclePayload,
  UpdateVehicleStatusPayload,
  UpdateVehiclePhotoResponse,
  CreateVehicleCategoryPayload,
  CreateAttachmentPayload,
} from '@/types'

export const vehicleService = {
  // ── Vehicles ──────────────────────────

  getAll: (params?: VehicleQueryParams) =>
    apiClient
      .get<PaginatedResponse<Vehicle>>(API_ENDPOINTS.VEHICLES.BASE, { params })
      .then((r) => r.data),

  getById: (id: number) =>
    apiClient
      .get<ApiResponse<Vehicle>>(API_ENDPOINTS.VEHICLES.BY_ID(id))
      .then((r) => r.data),

  create: (payload: CreateVehiclePayload) =>
    apiClient
      .post<ApiResponse<Vehicle>>(API_ENDPOINTS.VEHICLES.BASE, payload)
      .then((r) => r.data),

  // PUT - semua field wajib sesuai API doc
  update: (id: number, payload: UpdateVehiclePayload) =>
    apiClient
      .put<ApiResponse<Vehicle>>(API_ENDPOINTS.VEHICLES.BY_ID(id), payload)
      .then((r) => r.data),

  updateStatus: (id: number, payload: UpdateVehicleStatusPayload) =>
    apiClient
      .patch<ApiResponse<Vehicle>>(API_ENDPOINTS.VEHICLES.STATUS(id), payload)
      .then((r) => r.data),

  updatePhoto: (id: number, file: File) => {
    const form = new FormData()
    form.append('photo', file)
    return apiClient
      .patch<ApiResponse<UpdateVehiclePhotoResponse>>(
        API_ENDPOINTS.VEHICLES.PHOTO(id),
        form,
        { headers: { 'Content-Type': 'multipart/form-data' } },
      )
      .then((r) => r.data)
  },

  delete: (id: number) =>
    apiClient
      .delete<ApiResponse<null>>(API_ENDPOINTS.VEHICLES.BY_ID(id))
      .then((r) => r.data),

  // ── Categories ────────────────────────

  getCategories: () =>
    apiClient
      .get<ApiResponse<VehicleCategory[]>>(API_ENDPOINTS.VEHICLES.CATEGORIES)
      .then((r) => r.data),

  createCategory: (payload: CreateVehicleCategoryPayload) =>
    apiClient
      .post<ApiResponse<VehicleCategory>>(API_ENDPOINTS.VEHICLES.CATEGORIES, payload)
      .then((r) => r.data),

  deleteCategory: (id: number) =>
    apiClient
      .delete<ApiResponse<null>>(API_ENDPOINTS.VEHICLES.CATEGORY_BY_ID(id))
      .then((r) => r.data),

  // ── Attachments ───────────────────────

  getAttachments: (vehicleId: number) =>
    apiClient
      .get<ApiResponse<Attachment[]>>(API_ENDPOINTS.VEHICLES.ATTACHMENTS(vehicleId))
      .then((r) => r.data),

  uploadAttachment: (vehicleId: number, payload: CreateAttachmentPayload) => {
    const form = new FormData()
    form.append('file', payload.file)
    if (payload.description) form.append('description', payload.description)
    return apiClient
      .post<ApiResponse<Attachment>>(
        API_ENDPOINTS.VEHICLES.ATTACHMENTS(vehicleId),
        form,
        { headers: { 'Content-Type': 'multipart/form-data' } },
      )
      .then((r) => r.data)
  },
}

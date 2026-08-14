// ─────────────────────────────────────────
// RESOURCE TYPES
// Covers: vehicles, rooms, vehicle_categories
// ─────────────────────────────────────────

import type { ResourceStatus } from './enums'

// --- Vehicle Category ---

export interface VehicleCategory {
  id: number
  name: string
}

// --- Vehicle ---

// Shape dari GET /vehicles & GET /vehicles/:id
export interface Vehicle {
  id: number
  resourceId: number
  name: string
  plateNumber: string
  brand: string
  model: string
  year: number
  currentOdometer: number
  capacity: number
  category: VehicleCategory
  status: ResourceStatus
  photoUrl: string | null
}

// Subset untuk nested di booking response
export interface VehicleSummary {
  id: number
  plateNumber: string
}

// Subset untuk nested di driver response
export interface VehicleRef {
  id: number
  plateNumber: string
  name?: string
}

// --- Room ---

export interface Room {
  id: number
  resourceId: number
  name: string
  location: string
  capacity: number
  status: ResourceStatus
  photoUrl: string | null
}

export interface RoomSummary {
  id: number
  name: string
  location: string
  capacity: number
  status: ResourceStatus
}

// --- Shared Resource ref (dipakai di booking.resource) ---

export interface ResourceRef {
  id: number
  name: string
  type: 'VEHICLE' | 'ROOM'
  status: ResourceStatus
}

// --- Attachment ---

export interface Attachment {
  id: number
  uploadedById: number
  uploaderName: string
  vehicleId: number | null
  roomId: number | null
  bookingId: number | null
  filePath: string
  fileName: string
  fileType: string
  fileSize: number | null
  description: string | null
  createdAt: string
}

// --- Query Params ---

export interface VehicleQueryParams {
  page?: number
  limit?: number
  search?: string
  categoryId?: number
  status?: ResourceStatus
}

export interface RoomQueryParams {
  page?: number
  limit?: number
  search?: string
  status?: ResourceStatus
}

// --- Payloads ---

export interface CreateVehiclePayload {
  name: string
  plateNumber: string
  brand: string
  model: string
  year: number
  currentOdometer?: number
  categoryId: number
  capacity: number
}

// PUT /vehicles/:id - semua field wajib (bukan partial)
export type UpdateVehiclePayload = Required<CreateVehiclePayload>

export interface UpdateVehicleStatusPayload {
  status: ResourceStatus
}

export interface UpdateVehiclePhotoResponse {
  photoUrl: string
}

export interface CreateVehicleCategoryPayload {
  name: string
}

export interface CreateRoomPayload {
  name: string
  location: string
  capacity: number
}

export type UpdateRoomPayload = CreateRoomPayload

export interface UpdateRoomStatusPayload {
  status: ResourceStatus
}

export interface UpdateRoomPhotoResponse {
  photoUrl: string
}

export interface CreateAttachmentPayload {
  file: File
  description?: string
}
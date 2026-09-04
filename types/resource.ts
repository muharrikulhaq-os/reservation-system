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

// Sumber energi kendaraan (beda dari EnergyType fuel_expenses - HYBRID bisa
// diisi BBM atau listrik, jadi tidak dipaksa satu tipe transaksi saja).
export type VehicleEnergyType = 'BBM' | 'LISTRIK' | 'HYBRID'

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
  energyType: VehicleEnergyType
  // true bila sedang diklaim booking SPD hari ini (hari kalender penuh,
  // terlepas dari jam booking-nya) - beda dari `status` yang tidak
  // membedakan sebab pemakaian.
  isSpdActive: boolean
  // Supir tetap (permanen, diatur admin) - kalau terisi, booking kendaraan
  // ini otomatis pakai supir ini, tidak ada pilihan supir lain.
  fixedDriver: { id: number; name: string } | null
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
  // Room keeper penanggung jawab ruangan ini (opsional) - beda dari supir
  // tetap kendaraan, satu room keeper boleh bertanggung jawab atas lebih
  // dari satu ruangan (N:1, bukan 1:1).
  roomKeeper: { id: number; name: string } | null
}

export interface RoomSummary {
  id: number
  name: string
  location: string
  capacity: number
  status: ResourceStatus
}

// --- Room Rating ---
// Rating ditujukan ke ROOM KEEPER, bukan ruangannya - lihat GetRoomKeeperIDByResourceID
// di backend. Satu room keeper bisa punya banyak ruangan, jadi rating-nya
// terkumpul lintas semua ruangan yang dia kelola.

// Satu ulasan pada daftar rating room keeper (GET /bookings/room-keepers/:id/ratings)
export interface RoomRating {
  id: number
  rating: 1 | 2 | 3 | 4 | 5
  review: string | null
  ratedBy: { id: number; name: string }
  createdAt: string
}

// Ringkasan + daftar ulasan seorang room keeper
export interface RoomRatingsResult {
  roomKeeperId: number
  totalRatings: number
  averageRating: number | null
  ratings: RoomRating[]
}

// --- Shared Resource ref (dipakai di booking.resource) ---

export interface ResourceRef {
  id: number
  name: string
  type: 'VEHICLE' | 'ROOM'
  status: ResourceStatus
  photoUrl: string | null
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
  energyType?: VehicleEnergyType
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
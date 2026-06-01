// ─────────────────────────────────────────
// DRIVER TYPES
// ─────────────────────────────────────────

// --- Driver ---

// Shape dari GET /drivers & GET /drivers/:driver_id
export interface Driver {
  id: number
  userId: number
  name: string
  employeeId: string
  email: string
  profilePhoto?: string | null
  licenseNumber: string
  phoneNumber: string
  isActive: boolean
  assignedPlate: string | null // null jika belum assigned ke kendaraan
}

// Subset untuk nested di booking response
export interface DriverSummary {
  id: number
  name: string
  phoneNumber: string
}

// --- Driver Assignment History ---

export interface DriverAssignment {
  vehicleId: number
  plateNumber: string
  assignedAt: string
  releasedAt: string | null
}

// --- Driver Rating ---

export interface DriverRating {
  id: number
  bookingId: number
  rating: 1 | 2 | 3 | 4 | 5
  review: string | null
  reviewerName: string
  createdAt: string
}

// --- Query Params ---

export interface DriverQueryParams {
  page?: number
  limit?: number
}

// --- Payloads ---

export interface CreateDriverPayload {
  userId: number
  licenseNumber: string
  phoneNumber: string
}

export interface UpdateDriverPayload {
  licenseNumber?: string
  phoneNumber?: string
}

export interface AssignDriverToVehiclePayload {
  vehicleId: number
}

export interface ToggleDriverActiveResponse {
  id: number
  isActive: boolean
}

export interface CreateDriverRatingPayload {
  rating: 1 | 2 | 3 | 4 | 5
  review?: string
}
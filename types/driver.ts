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
  // Kendaraan tetap (permanen, diatur admin) - beda dari assignedPlate yang
  // mengikuti booking aktif. null jika supir ini tidak punya kendaraan tetap.
  fixedVehicle: { id: number; plateNumber: string } | null
}

// Subset untuk nested di booking response
export interface DriverSummary {
  id: number
  name: string
  phoneNumber: string
}

// --- Driver Availability (untuk pemilihan driver saat create booking) ---

// Response dari GET /drivers/available
// Supir "kosong" (belum pegang kendaraan) → vehicle* null; kapasitas & remainingSeats
// mengikuti kendaraan yang dibooking (dihitung di FE).
export interface AvailableDriver {
  driverId: number
  driverName: string
  employeeId: string
  vehicleId: number | null
  plateNumber: string | null
  vehicleCapacity: number | null
  overlappingPassengers: number // penumpang dari booking lain yang overlap
  remainingSeats: number | null // sisa kursi (null jika supir kosong)
  overlappingPurpose: string    // tujuan booking overlap (kosong jika tidak ada)
  // true bila supir ini sedang terkunci tugas SPD hari ini (hari kalender
  // penuh) - badge "Digunakan SPD" di daftar pemilihan supir.
  isSpdActive: boolean
}

export interface AvailableDriverParams {
  startDate: string // RFC3339
  endDate: string   // RFC3339
}

// --- Driver Assignment History ---

export interface DriverAssignment {
  vehicleId: number
  plateNumber: string
  assignedAt: string
  releasedAt: string | null
}

// --- Driver Rating ---

// Satu ulasan pada daftar rating driver (GET /bookings/drivers/:id/ratings)
export interface DriverRating {
  id: number
  rating: 1 | 2 | 3 | 4 | 5
  review: string | null
  ratedBy: { id: number; name: string }
  createdAt: string
}

// Ringkasan + daftar ulasan seorang driver
export interface DriverRatingsResult {
  driverId: number
  totalRatings: number
  averageRating: number | null
  ratings: DriverRating[]
}

// --- Query Params ---

export interface DriverQueryParams {
  page?: number
  limit?: number
  search?: string
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
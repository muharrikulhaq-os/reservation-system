// ─────────────────────────────────────────
// COMMON / BASE TYPES
// Disesuaikan dengan actual API response format
// ─────────────────────────────────────────

// --- API Response Wrappers ---

export interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
  // Hadir kalau endpoint sukses tapi ingin memberi peringatan non-blocking
  // (mis. jadwal maintenance bentrok booking lain) - lihat MaintenanceForm.
  warning?: string
}

export interface ApiErrorResponse {
  success: false
  message: string
  error: {
    code: string
    message: string
  }
}

// API menggunakan key "pagination" (bukan "meta")
export interface PaginatedResponse<T> {
  success: boolean
  message: string
  data: T[]
  pagination: PaginationMeta
}

export interface PaginationMeta {
  total: number
  page: number
  limit: number
  totalPages: number
}

// --- Query Params ---

export interface PaginationParams {
  page?: number
  limit?: number
}

export interface BaseQueryParams extends PaginationParams {
  search?: string
}

// --- Select Option (untuk dropdown/combobox) ---

export interface SelectOption<T = string | number> {
  label: string
  value: T
}

// --- Timestamps ---

export interface Timestamps {
  createdAt: string // ISO 8601 / RFC3339
  updatedAt: string
}
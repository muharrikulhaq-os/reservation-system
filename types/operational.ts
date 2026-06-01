// ─────────────────────────────────────────
// OPERATIONAL TYPES
// Covers: fuel_expenses, maintenance,
//         master_settings, reports, audit_logs
// ─────────────────────────────────────────

import type { FuelType } from './enums'

// ─────────────────────────────────────────
// FUEL EXPENSES
// ─────────────────────────────────────────

// Shape dari GET /fuel-expenses (list)
// API menggabungkan BBM & LISTRIK dalam satu shape
// field yang tidak relevan akan bernilai 0 atau null
export interface FuelExpense {
  id: number
  driverId: number
  driverName: string
  vehicleId: number
  fuelType: FuelType
  // BBM fields
  liter: number | null
  pricePerLiter: number | null
  odometerBefore: number | null
  odometerAfter: number | null
  // LISTRIK fields
  kwh: number | null
  pricePerKwh: number | null
  batteryBefore: number | null
  batteryAfter: number | null
  // Common
  totalCost: number      // API pakai "totalCost", bukan "totalAmount"
  note: string | null
  createdAt: string
}

export interface CreateBbmExpensePayload {
  vehicleId: number
  bookingId?: number
  liter: number
  pricePerLiter: number
  odometerBefore: number
  odometerAfter: number
  note?: string
}

export interface CreateListrikExpensePayload {
  vehicleId: number
  bookingId?: number
  kwh: number
  pricePerKwh: number
  batteryBefore?: number
  batteryAfter?: number
  note?: string
}

export interface FuelExpenseQueryParams {
  page?: number
  limit?: number
  driverId?: number
  vehicleId?: number
  fuelType?: FuelType
}

// ─────────────────────────────────────────
// MAINTENANCE
// ─────────────────────────────────────────

export interface MaintenanceRecord {
  id: number
  resourceId: number
  resourceName: string
  resourceType: 'VEHICLE' | 'ROOM'
  description: string
  startDate: string
  endDate: string | null  // null = masih dalam proses
  cost: number | null
  createdBy: string       // nama string
  createdAt: string
}

export interface CreateMaintenancePayload {
  resourceId: number
  description: string
  startDate: string
  cost?: number
}

export interface UpdateMaintenancePayload {
  description?: string
  startDate?: string
  endDate?: string        // mengisi endDate otomatis ubah status resource → AVAILABLE
  cost?: number
}

export interface MaintenanceQueryParams {
  page?: number
  limit?: number
  resourceId?: number
}

// ─────────────────────────────────────────
// MASTER SETTINGS
// ─────────────────────────────────────────

// API mengembalikan value sebagai string
export interface MasterSetting {
  key: string
  value: string           // string di response, parse ke number saat dipakai
  unit: string | null
  description: string | null
}

export interface UpdateSettingPayload {
  value: number
  unit?: string
  description?: string
}

// ─────────────────────────────────────────
// REPORTS
// ─────────────────────────────────────────

export interface BookingSummaryReport {
  totalBookings: number
  pendingCount: number
  approvedCount: number
  completedCount: number
  cancelledCount: number
  rejectedCount: number
  vehicleBookings: number
  roomBookings: number
}

export interface ResourceUsageReport {
  resourceId: number
  resourceName: string
  resourceType: 'VEHICLE' | 'ROOM'
  totalBookings: number
  totalHoursUsed: number
  utilizationRate: number
}

export interface FuelExpenseReport {
  vehicleId: number
  plateNumber: string
  vehicleName: string
  totalLiter: number
  totalKwh: number
  totalCost: number
  fuelType: FuelType
}

export interface MaintenanceCostReport {
  resourceId: number
  resourceName: string
  resourceType: 'VEHICLE' | 'ROOM'
  totalMaintenanceCount: number
  totalCost: number
}

export interface DriverRatingReport {
  driverId: number
  driverName: string
  averageRating: number
  totalReviews: number
}

export interface DriverActivityReport {
  driverId: number
  driverName: string
  totalTrips: number
  totalFuelExpenses: number
}

export interface OverdueBooking {
  id: number
  status: 'ONGOING'
  user: { id: number; name: string }
  resource: { id: number; name: string; type: 'VEHICLE' | 'ROOM' }
  startDate: string
  endDate: string
  overdueHours: number
}

export interface ReportDateParams {
  startDate?: string // RFC3339
  endDate?: string
}

// ─────────────────────────────────────────
// AUDIT LOGS
// ─────────────────────────────────────────

export interface AuditLog {
  id: number
  userId: number | null
  userName: string | null
  action: string
  entityType: string
  entityId: number | null
  description: string | null
  createdAt: string
}

export interface AuditLogQueryParams {
  page?: number
  limit?: number
  entityType?: string
  userId?: number
}

// ─────────────────────────────────────────
// HEALTH CHECK
// ─────────────────────────────────────────

export interface HealthStatus {
  status: 'healthy' | 'unhealthy'
  db: 'connected' | 'disconnected'
}
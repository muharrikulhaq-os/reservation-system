// ─────────────────────────────────────────
// OPERATIONAL TYPES
// Covers: fuel_expenses, maintenance,
//         master_settings, reports, audit_logs
// ─────────────────────────────────────────

import type { FuelType, ResourceStatus, ResourceType } from './enums'

// ─────────────────────────────────────────
// FUEL EXPENSES
// ─────────────────────────────────────────

// Jenis BBM / sumber energi (grade). LISTRIK dipakai untuk kendaraan EV.
export type FuelGrade =
  | 'PERTALITE'
  | 'PERTAMAX'
  | 'PERTAMAX_TURBO'
  | 'SOLAR'
  | 'DEXLITE'
  | 'PERTAMINA_DEX'
  | 'LISTRIK'

// Shape dari GET /fuel-expenses (list)
// API menggabungkan BBM & LISTRIK dalam satu shape
// field yang tidak relevan akan bernilai null
export interface FuelExpense {
  id: number
  vehicleId: number
  vehicle: {
    id: number
    name: string
    plateNumber: string
  }
  driverId: number
  driverName: string
  bookingId: number | null // null jika isi di luar booking
  fuelType: FuelType
  fuelGrade: FuelGrade      // jenis BBM / LISTRIK
  // BBM fields
  liter: number | null
  pricePerLiter: number | null
  // Listrik fields
  kwh: number | null
  pricePerKwh: number | null
  // Common
  totalCost: number        // API pakai "totalCost", bukan "totalAmount"
  odometerBefore: number
  odometerAfter: number
  distanceKm: number       // dihitung: odometerAfter - odometerBefore
  proofPhotoUrl: string | null // bukti wajib
  note: string | null
  createdAt: string
}

// Payload gabungan create fuel (multipart — proofPhoto WAJIB)
export interface CreateFuelPayload {
  vehicleId: number
  bookingId?: number       // opsional
  fuelType: FuelType
  fuelGrade: FuelGrade
  liter?: number           // untuk BBM
  pricePerLiter?: number
  kwh?: number             // untuk LISTRIK
  pricePerKwh?: number
  odometerBefore: number
  odometerAfter: number
  proofPhoto: File         // WAJIB
  note?: string
}

export interface FuelExpenseQueryParams {
  page?: number
  limit?: number
  search?: string
  driverId?: number
  vehicleId?: number
  fuelType?: FuelType
  fuelGrade?: FuelGrade
  startDate?: string
  endDate?: string
}

// ─────────────────────────────────────────
// MAINTENANCE
// ─────────────────────────────────────────

export type MaintenanceStatus = 'ONGOING' | 'COMPLETED'
export type MaintenanceType = 'RUTIN' | 'PERBAIKAN' | 'PENGGANTIAN' | 'BODY'

export interface MaintenanceRecord {
  id: number
  resourceId: number
  resource: {
    id: number
    name: string
    type: 'VEHICLE' | 'ROOM'
  }
  type: MaintenanceType
  description: string
  status: MaintenanceStatus
  startDate: string
  endDate: string | null  // null = masih dalam proses
  cost: number
  vendor: string | null   // bengkel/vendor
  odometer: number | null // untuk kendaraan
  proofPhotos: string[]   // bukti saat selesai
  completedAt: string | null
  createdAt: string
}

export interface CreateMaintenancePayload {
  resourceId: number
  type: MaintenanceType
  description: string
  startDate: string
  cost?: number           // bisa diisi belakangan (saat complete)
  vendor?: string
  odometer?: number
}

// Menyelesaikan maintenance (multipart — proofPhotos bukti pekerjaan)
export interface CompleteMaintenancePayload {
  endDate: string
  cost: number
  proofPhotos?: File[]
  note?: string
}

export interface MaintenanceQueryParams {
  page?: number
  limit?: number
  search?: string
  resourceId?: number
  resourceType?: ResourceType
  type?: MaintenanceType
  status?: MaintenanceStatus
  startDate?: string
  endDate?: string
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

// Harga bahan bakar per grade — default prefill saat input pengisian
export interface FuelPriceSetting {
  grade: FuelGrade
  pricePerUnit: number // per liter atau per kWh
  unit: 'LITER' | 'KWH'
  updatedAt: string
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

// ─────────────────────────────────────────
// REPORT TYPES — EXTENDED
// TODO: Beberapa type ini belum ada endpoint-nya di backend.
//       Ditandai dengan [DUMMY] — data sementara dari frontend.
//       Hapus dummy dan ganti fetch setelah backend siap.
// ─────────────────────────────────────────

// [EXISTING] — sudah ada di atas:
// BookingSummaryReport, ResourceUsageReport, FuelExpenseReport,
// MaintenanceCostReport, DriverRatingReport, DriverActivityReport,
// OverdueBooking, AuditLog, ReportDateParams, AuditLogQueryParams

// [DUMMY] — endpoint belum ada
export interface ReportOverview {
  totalBookings: number
  totalCost: number
  avgUtilization: number
  overdueCount: number
  previousPeriod: {
    totalBookings: number
    totalCost: number
    avgUtilization: number
    overdueCount: number
  }
  changePercent: {
    bookings: number // +12.5 atau -3.2
    cost: number
    utilization: number
    overdue: number
  }
}

// [DUMMY]
export interface BookingTrend {
  period: string // "2025-W22" atau "2025-06"
  count: number
  vehicle: number
  room: number
}

// [DUMMY]
export interface BookingByDepartment {
  departmentId: number
  departmentName: string
  total: number
  pending: number
  approved: number
  completed: number
  cancelled: number
  rejected: number
}

// [DUMMY]
export interface BookingByResource {
  resourceId: number
  resourceName: string
  resourceType: ResourceType
  totalBookings: number
  totalHours: number
}

// [DUMMY]
export interface ApprovalPerformance {
  avgApprovalTimeHours: number
  approvedWithin24h: number // persentase
  totalProcessed: number
}

// [DUMMY]
export interface ResourceAvailability {
  resourceId: number
  name: string
  type: ResourceType
  status: ResourceStatus
  currentBooking: { id: number; user: string; endDate: string } | null
  nextBooking: { id: number; user: string; startDate: string } | null
  idleHoursThisMonth: number
}

// [DUMMY]
export interface CostSummary {
  totalFuelCost: number
  totalMaintenanceCost: number
  totalCost: number
  previousPeriod: {
    totalFuelCost: number
    totalMaintenanceCost: number
    totalCost: number
  }
  changePercent: {
    fuel: number
    maintenance: number
    total: number
  }
}

// [DUMMY]
export interface CostByVehicle {
  vehicleId: number
  name: string
  plateNumber: string
  fuelCost: number
  maintenanceCost: number
  totalCost: number
  totalKm: number
  avgCostPerKm: number
}

// [DUMMY]
export interface CostByDepartment {
  departmentId: number
  departmentName: string
  bookingCount: number
  fuelCost: number
  maintenanceCost: number
  totalCost: number
}

// [DUMMY]
export interface CostTrend {
  period: string
  fuelCost: number
  maintenanceCost: number
  totalCost: number
}

// [DUMMY]
export interface DriverPerformance {
  driverId: number
  driverName: string
  totalTrips: number
  totalKm: number
  totalFuelCost: number
  avgCostPerKm: number
  avgRating: number
  totalReviews: number
  onTimeRate: number // persentase
  lateCount: number
}

// [DUMMY]
export interface DepartmentSummary {
  departmentId: number
  departmentName: string
  bookingCount: number
  fuelCost: number
  maintenanceCost: number
  totalCost: number
  topResource: string
}

// Query params tambahan
export interface ReportTrendParams {
  groupBy?: 'daily' | 'weekly' | 'monthly'
  periods?: number
}

export interface ReportPeriodParams {
  period?: 'monthly' | 'quarterly' | 'yearly'
}
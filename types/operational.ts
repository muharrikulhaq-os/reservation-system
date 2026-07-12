// ─────────────────────────────────────────
// OPERATIONAL TYPES
// Covers: fuel_expenses, maintenance,
//         master_settings, reports, audit_logs
// ─────────────────────────────────────────

import type { FuelType, ResourceStatus, ResourceType } from './enums'

// ─────────────────────────────────────────
// FUEL EXPENSES
// ─────────────────────────────────────────

// Sumber energi — BBM (satuan liter) atau LISTRIK (satuan kWh)
export type EnergyType = 'BBM' | 'LISTRIK'
export type FuelUnit = 'LITER' | 'KWH'

// ── Master data jenis bahan bakar (/fuel-types) ──
export interface FuelTypeMaster {
  id: number
  name: string          // mis. "Pertamax", "SPKLU PLN"
  type: EnergyType      // BBM | LISTRIK
  unit: FuelUnit        // LITER | KWH
  defaultPrice: number  // harga acuan per unit
  isActive: boolean
}

export interface CreateFuelTypePayload {
  name: string
  type: EnergyType
  unit: FuelUnit
  defaultPrice: number
  isActive: boolean
}

// Shape dari GET /fuel-expenses (list)
export interface FuelExpense {
  id: number
  driverId: number
  driverName: string
  vehicleId: number
  fuelType: EnergyType // "BBM" | "LISTRIK"
  // BBM fields (null jika LISTRIK)
  liter: number | null
  pricePerLiter: number | null
  // LISTRIK fields (null jika BBM)
  kwh: number | null
  pricePerKwh: number | null
  // Common
  bookingId: number | null
  totalCost: number
  odometerBefore: number | null
  odometerAfter: number | null
  note: string | null
  proofPhotoUrl: string | null // URL/path foto bukti pengisian
  createdAt: string
}

// Payload create fuel (multipart — proofPhoto WAJIB)
export interface CreateFuelPayload {
  vehicleId: number
  bookingId?: number
  fuelTypeId: number   // WAJIB — referensi ke fuel-types
  fuelGrade?: string   // RON/grade bebas (opsional)
  // BBM
  liter?: number
  pricePerLiter?: number
  // LISTRIK
  kwh?: number
  pricePerKwh?: number
  // Common
  odometerBefore?: number
  odometerAfter?: number
  note?: string
  proofPhoto: File // WAJIB
}

export interface FuelExpenseParams {
  page?: number
  limit?: number
  driverId?: number
  vehicleId?: number
  fuelType?: EnergyType
  bookingId?: number
}

// ─────────────────────────────────────────
// MAINTENANCE
// ─────────────────────────────────────────

// Shape dari GET /maintenance (list/detail) — VEHICLE only
export interface MaintenanceRecord {
  id: number
  vehicleId: number
  vehicleName: string
  plateNumber: string
  maintenanceTypeId: number | null
  type: string           // mis. "routine" | "repair"
  status: string         // mis. "pending" | "completed"
  description: string
  odometer: number | null
  totalCost: string | null // API mengirim string
  vendorName: string | null
  location: string
  startDate: string
  endDate: string | null
  completedAt: string | null
  proofPhotos: string[]
  createdBy: string
  createdAt: string
}

// POST /maintenance — JSON
export interface CreateMaintenancePayload {
  vehicleId: number
  maintenanceTypeId?: number
  type: string          // WAJIB
  status: string        // WAJIB ("pending" saat create)
  description: string   // WAJIB
  odometer?: number
  totalCost?: number
  vendorName?: string
  location: string      // WAJIB
  startDate: string     // WAJIB (RFC3339)
  endDate?: string
}

// PUT /maintenance/:id — sama dengan create
export type UpdateMaintenancePayload = CreateMaintenancePayload

// PATCH /maintenance/:id/complete — multipart, upload foto bukti
export interface CompleteMaintenancePayload {
  photos?: File[]
}

export interface MaintenanceParams {
  vehicleId?: number
  page?: number
  limit?: number
}

// ─────────────────────────────────────────
// MASTER SETTINGS
// ─────────────────────────────────────────

// API mengembalikan value sebagai string (/master-settings)
export interface MasterSetting {
  key: string
  value: string // string di response, parse ke number saat dipakai
  unit: string | null
  description: string | null
}

// ─────────────────────────────────────────
// REPORTS
// ─────────────────────────────────────────

// Nilai numerik yang bisa dikirim backend sebagai number, string, atau null
// (sqlc menserialisasi SUM/numeric secara tidak konsisten).
export type Numeric = number | string | null

// GET /reports/bookings — ReportBookingSummaryRow
export interface BookingSummaryReport {
  total: number
  completed: number
  pending: number
  approved: number
  ongoing: number
  cancelled: number
  rejected: number
  overdue: number
}

// GET /reports/resource-usage — v_vehicle_summary (VEHICLE saja)
export interface ResourceUsageReport {
  id: number
  vehicle_name: string
  plateNumber: string
  category: string
  capacity: number
  status: ResourceStatus
  currentOdometer: number
  total_bookings: number
  completed_bookings: number
  total_liter_bbm: Numeric
  total_cost_bbm: Numeric
  total_kwh_listrik: Numeric
  total_cost_listrik: Numeric
  total_fuel_cost: Numeric
}

// GET /reports/fuel-expenses — v_fuel_expense_summary
export interface FuelExpenseReport {
  vehicle_id: number
  plateNumber: string
  vehicle_name: string
  category: string
  bbm_entries: number
  total_liter: Numeric
  total_cost_bbm: Numeric
  listrik_entries: number
  total_kwh: Numeric
  total_cost_listrik: Numeric
  grand_total: Numeric
}

// GET /reports/maintenance-cost — ReportMaintenanceCostRow
export interface MaintenanceCostReport {
  vehicleId: number
  resource_name: string
  resource_type: string
  total_records: number
  total_cost: Numeric
}

// GET /reports/driver-ratings — v_driver_ratings_summary
export interface DriverRatingReport {
  driver_id: number
  driver_name: string
  employeeId: string
  isActive: boolean
  total_ratings: number
  average_rating: string // API mengirim string
  bintang_5: number
  bintang_4: number
  bintang_3: number
  bintang_2: number
  bintang_1: number
}

// GET /reports/driver-activity — ReportDriverActivityRow
export interface DriverActivityReport {
  driver_id: number
  driver_name: string
  employeeId: string
  total_bookings: number
  completed_bookings: number
  total_fuel_expenses: Numeric
}

// GET /reports/overdue-bookings — ReportOverdueBookingsRow (flat)
export interface OverdueBooking {
  id: number
  userId: number
  resourceId: number
  startDate: string
  endDate: string
  purpose: string
  status: string
  user_name: string
  employeeId: string
  resource_name: string
  resource_type: ResourceType
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

export interface BookingTrend {
  period: string
  count: number
  vehicle: number
  room: number
}

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

export interface BookingByResource {
  resourceId: number
  resourceName: string
  resourceType: ResourceType
  totalBookings: number
  totalHours: number
}

// Objek tunggal (BUKAN array)
export interface ApprovalPerformance {
  avgApprovalTimeHours: number
  approvedWithin24h: number
  totalProcessed: number
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

export interface CostByDepartment {
  departmentId: number
  departmentName: string
  bookingCount: number
  fuelCost: number
  maintenanceCost: number
  totalCost: number
}

export interface CostTrend {
  period: string
  fuelCost: number
  maintenanceCost: number
  totalCost: number
}

export interface DriverPerformance {
  driverId: number
  driverName: string
  totalTrips: number
  totalKm: number
  totalFuelCost: number
  avgCostPerKm: number
  avgRating: number
  totalReviews: number
  onTimeRate: number
  lateCount: number
}

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
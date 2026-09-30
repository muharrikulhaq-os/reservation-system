// ─────────────────────────────────────────
// OPERATIONAL TYPES
// Covers: fuel_expenses, maintenance,
//         master_settings, reports, audit_logs
// ─────────────────────────────────────────

import type { FuelType, ResourceStatus, ResourceType } from './enums'

// ─────────────────────────────────────────
// FUEL EXPENSES
// ─────────────────────────────────────────

// Sumber energi - BBM (satuan liter) atau LISTRIK (satuan kWh)
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
  // ── Saldo & voucher (rancangan voucher BBM) ──
  distanceKm?: number
  source?: FuelFillSource          // DIRECT (isi langsung) | VOUCHER
  voucherId?: number | null
  voucherCode?: string | null
  stationId?: number | null
  stationName?: string | null      // nama SPBU mitra / SPBU lain
  isPartnerStation?: boolean
  reason?: FuelFillReason | null
  status?: 'ACTIVE' | 'VOID'
  voidedAt?: string | null
  voidedByName?: string | null
  voidReason?: string | null
  batteryBefore?: number | null
  batteryAfter?: number | null
  meterStartKwh?: number | null
  meterEndKwh?: number | null
  quantitySource?: 'INPUT' | 'METER' | 'ESTIMATE' | null
  ledger?: {
    accrued: number | null
    debit: number | null
    balanceAfter: number | null
    kmPerUnit: number | null
  }
  /** Hanya pada respons create: peringatan melebihi hak saldo / tangki. */
  warnings?: string[] | null
}

export type FuelFillSource = 'DIRECT' | 'VOUCHER'
export type FuelFillReason = 'SPD' | 'LONG_TRIP' | 'EMERGENCY' | 'OFFICE' | 'OTHER'

// Payload create fuel (multipart - proofPhoto WAJIB)
export interface CreateFuelPayload {
  vehicleId: number
  bookingId?: number
  fuelTypeId: number   // WAJIB - referensi ke fuel-types
  fuelGrade?: string   // RON/grade bebas (opsional)
  // BBM
  liter?: number
  pricePerLiter?: number
  // LISTRIK
  kwh?: number
  pricePerKwh?: number
  // Listrik - kWh bebas: kwh langsung, ATAU meter awal/akhir, ATAU % baterai
  meterStartKwh?: number
  meterEndKwh?: number
  batteryBefore?: number
  batteryAfter?: number
  // Common
  odometer: number     // odometer saat mengisi (WAJIB)
  stationId?: number   // SPBU mitra
  stationName?: string // SPBU lain (bukan mitra)
  reason?: FuelFillReason
  note?: string
  proofPhoto: File // WAJIB
}

// ─────────────────────────────────────────
// SALDO BBM, SPBU MITRA, VOUCHER (docs/RANCANGAN_VOUCHER_BBM.md di API)
// ─────────────────────────────────────────

export interface FuelStation {
  id: number
  name: string
  address: string | null
  phone: string | null
  contactPerson: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface FuelStationPayload {
  name: string
  address?: string
  phone?: string
  contactPerson?: string
  isActive?: boolean
}

export interface FuelProfile {
  kmPerLiter: number | null
  tankCapacityLiter: number | null
  kmPerKwh: number | null
  batteryCapacityKwh: number | null
  fuelBaselineOdometer: number
}

export interface FuelBalance {
  energy: EnergyType
  unit: 'L' | 'kWh'
  kmPerUnit: number | null
  capacity: number | null
  checkpointOdometer: number     // odometer kejadian (isi/voucher) terakhir
  currentOdometer: number
  pendingKm: number              // jarak sejak kejadian terakhir
  pendingAccrued: number         // hak dari jarak itu
  recordedBalance: number        // saldo tercatat di ledger
  available: number              // saldo + hak tertunda
  voucherable: number | null     // liter voucher bila terbit sekarang (BBM)
  hasEntries: boolean
  warnings: string[] | null
}

export interface ActiveVoucherInfo {
  id: number
  code: string
  liter: number
  amount: number
  validUntil: string
  stationName: string
}

export interface VehicleFuelBalance {
  vehicleId: number
  vehicleName: string
  plateNumber: string
  energyType: 'BBM' | 'LISTRIK' | 'HYBRID'
  currentOdometer: number
  fixedDriverId: number | null
  profile: FuelProfile
  balances: Partial<Record<EnergyType, FuelBalance>>
  activeVoucher: ActiveVoucherInfo | null
  baselineLocked?: boolean
}

export interface FuelProfilePayload {
  kmPerLiter?: number | null
  tankCapacityLiter?: number | null
  kmPerKwh?: number | null
  batteryCapacityKwh?: number | null
  fuelBaselineOdometer?: number
}

export interface FuelAdjustmentPayload {
  energy: EnergyType
  amount: number // + menambah saldo, − mengurangi
  note: string
}

export type FuelLedgerType =
  | 'OPENING' | 'VOUCHER' | 'DIRECT_FILL' | 'VOUCHER_RETURN'
  | 'VOUCHER_REINSTATE' | 'VOID' | 'ADJUSTMENT'

export interface FuelLedgerEntry {
  id: number
  vehicleId: number
  energy: EnergyType
  entryType: FuelLedgerType
  odometer: number | null
  distanceKm: number | null
  kmPerUnit: number | null
  accrued: number
  debit: number
  balanceAfter: number
  fuelExpenseId: number | null
  reversesId: number | null
  createdByName: string | null
  note: string | null
  createdAt: string
}

export type FuelVoucherStatus = 'ISSUED' | 'USED' | 'EXPIRED' | 'CANCELLED'

export interface FuelVoucher {
  id: number
  code: string
  vehicleId: number
  vehicleName: string
  plateNumber: string
  fuelTypeId: number
  fuelTypeName: string
  stationId: number
  stationName: string
  stationAddress: string | null
  driverId: number | null
  driverName: string | null
  driverUserId: number | null
  bookingId: number | null
  issuedById: number
  issuedByName: string
  odometer: number
  distanceKm: number
  kmPerLiter: number
  accruedLiter: number
  carriedLiter: number
  tankCapacityLiter: number | null
  liter: number
  pricePerLiter: number
  amount: number
  validUntil: string
  status: FuelVoucherStatus
  usedAt: string | null
  usedByName: string | null
  usedOdometer: number | null
  receiptPhotoUrl: string | null
  fuelExpenseId: number | null
  cancelledAt: string | null
  cancelledByName: string | null
  cancelReason: string | null
  reconciledAt: string | null
  reconciledByName: string | null
  invoiceNumber: string | null
  note: string | null
  createdAt: string
}

export interface FuelVoucherPayload {
  vehicleId: number
  fuelTypeId: number
  stationId: number
  odometer?: number
  driverId?: number | null
  bookingId?: number
  note?: string
}

export interface FuelVoucherPreview {
  vehicleId: number
  vehicleName: string
  plateNumber: string
  fuelTypeName: string
  stationName: string
  odometer: number
  checkpointOdometer: number
  distanceKm: number
  kmPerLiter: number
  accruedLiter: number
  carriedLiter: number
  availableLiter: number
  tankCapacityLiter: number
  liter: number
  remainingLiter: number
  cappedByTank: boolean
  pricePerLiter: number
  amount: number
  validUntil: string
  activeVoucherId?: number
}

export interface FuelVoucherParams {
  page?: number
  limit?: number
  status?: FuelVoucherStatus
  vehicleId?: number
  stationId?: number
  from?: string
  to?: string
  reconciled?: boolean
  search?: string
}

export interface FuelVoucherSummary {
  status: FuelVoucherStatus
  count: number
  liter: number
  amount: number
}

export interface FuelExpenseParams {
  page?: number
  limit?: number
  driverId?: number
  vehicleId?: number
  fuelType?: EnergyType
  bookingId?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

// ─────────────────────────────────────────
// MAINTENANCE
// ─────────────────────────────────────────

// Shape dari GET /maintenance (list/detail) - VEHICLE only
export interface MaintenanceRecord {
  id: number
  vehicleId: number
  vehicleName: string
  plateNumber: string
  vehiclePhotoUrl: string | null
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

// POST /maintenance - JSON
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

// PUT /maintenance/:id - sama dengan create
export type UpdateMaintenancePayload = CreateMaintenancePayload

// PATCH /maintenance/:id/complete - multipart, upload foto bukti
export interface CompleteMaintenancePayload {
  photos?: File[]
}

export interface MaintenanceParams {
  vehicleId?: number
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
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

// GET /reports/bookings - ReportBookingSummaryRow
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

// GET /reports/resource-usage - v_vehicle_summary (VEHICLE saja)
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

// GET /reports/fuel-expenses - v_fuel_expense_summary
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

// GET /reports/maintenance-cost - ReportMaintenanceCostRow
export interface MaintenanceCostReport {
  vehicleId: number
  resource_name: string
  resource_type: string
  total_records: number
  total_cost: Numeric
}

// GET /reports/driver-ratings - v_driver_ratings_summary
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

// GET /reports/driver-activity - ReportDriverActivityRow
export interface DriverActivityReport {
  driver_id: number
  driver_name: string
  employeeId: string
  total_bookings: number
  completed_bookings: number
  total_fuel_expenses: Numeric
}

// GET /reports/overdue-bookings - ReportOverdueBookingsRow (flat)
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
  ipAddress: string | null
  userAgent: string | null
}

export interface AuditLogQueryParams {
  page?: number
  limit?: number
  entityType?: string
  userId?: number
  startDate?: string
  endDate?: string
}

// ─────────────────────────────────────────
// HEALTH CHECK
// ─────────────────────────────────────────

export interface HealthStatus {
  status: 'healthy' | 'unhealthy'
  db: 'connected' | 'disconnected'
}

// ─────────────────────────────────────────
// REPORT TYPES - EXTENDED
// TODO: Beberapa type ini belum ada endpoint-nya di backend.
//       Ditandai dengan [DUMMY] - data sementara dari frontend.
//       Hapus dummy dan ganti fetch setelah backend siap.
// ─────────────────────────────────────────

// [EXISTING] - sudah ada di atas:
// BookingSummaryReport, ResourceUsageReport, FuelExpenseReport,
// MaintenanceCostReport, DriverRatingReport, DriverActivityReport,
// OverdueBooking, AuditLog, ReportDateParams, AuditLogQueryParams

// [DUMMY] - endpoint belum ada
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

// SPD vs Non-SPD trip count, dan rating per driver - semuanya di-scope ke
// rentang tanggal yang sama (beda dari DriverPerformance.avgRating yang
// sepanjang masa, tidak ikut filter tanggal).
//
// Dua metrik overtime yang BEDA, jangan disamakan:
// - overtime* ("Keterlambatan"): trip selesai lewat endDate booking itu
//   sendiri - relatif ke jadwal trip itu, NON_SPD saja.
// - lembur* ("Lembur"): trip selesai lewat jam kerja tetap 18:00 WIB,
//   terlepas dari jadwal booking - NON_SPD saja (sama seperti overtime),
//   SPD tidak pernah dihitung lembur.
export interface DriverTrips {
  driverId: number
  driverName: string
  employeeId: string
  spdTrips: number
  nonSpdTrips: number
  totalTrips: number
  overtimeTrips: number
  totalOvertimeMinutes: number
  totalOvertimeHours: number
  lemburTrips: number
  totalLemburMinutes: number
  totalLemburHours: number
  avgRating: number
  totalReviews: number
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

// Query params tambahan - trend chart dulu selalu jendela tetap (N periods
// mundur dari sekarang), sekarang dibatasi rentang tanggal eksplisit (sama
// seperti ReportDateParams) supaya ikut filter di halaman Laporan;
// `groupBy` dipilih frontend berdasarkan lebar rentang (lihat
// utils/trendGranularity.ts) - bukan lagi jumlah bucket tetap.
export interface ReportTrendParams {
  groupBy?: 'daily' | 'weekly' | 'monthly'
  startDate?: string
  endDate?: string
}

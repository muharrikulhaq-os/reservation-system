// ─────────────────────────────────────────
// OPERATIONAL TYPES
// Covers: fuel_expenses, maintenance,
//         master_settings, reports, audit_logs
// ─────────────────────────────────────────

import type { FuelType, ResourceStatus, ResourceType } from './enums'
import type { VehicleOwnership } from './resource'

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

// Maintenance oleh vendor/bengkel luar (booking-system-api
// docs/RANCANGAN_MAINTENANCE_VENDOR.md):
// DRAFT → SUBMITTED → SCHEDULED → IN_PROGRESS → COMPLETED (CANCELLED sebelum
// kendaraan diserahkan). Kendaraan MAINTENANCE hanya selama IN_PROGRESS.
export type MaintenanceStatus =
  | 'DRAFT'
  | 'SUBMITTED'
  | 'SCHEDULED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CANCELLED'

export type MaintenanceCategory = 'ROUTINE' | 'REPAIR' | 'PARTS' | 'BODY' | 'OTHER'
export type MaintenancePickupMethod = 'DROP_OFF' | 'PICKUP'
export type MaintenanceCostBearer = 'COMPANY' | 'VENDOR' | 'UNDECIDED'
export type FuelLevel = 'E' | '1/4' | '1/2' | '3/4' | 'F'
export type MaintenanceDocumentKind =
  | 'INVOICE'
  | 'SIGNED_REQUEST'
  | 'SIGNED_HANDOVER'
  | 'SIGNED_RETURN'
  | 'PHOTO'
  | 'OTHER'
export type MaintenancePdfKind = 'request' | 'handover' | 'return'

/** Checklist kelengkapan berita acara: key → ada/tidak. */
export type HandoverChecklist = Record<string, boolean>

export interface MaintenanceVehicleRef {
  id: number
  name: string
  plateNumber: string
  photoUrl: string | null
  brand: string
  model: string
  year: number
  currentOdometer: number
  ownership: VehicleOwnership
  ownerVendorName: string | null
  rentalContractNo: string | null
}

export interface MaintenanceVendorRef {
  id: number
  name: string
  address: string | null
  picName: string | null
  phone: string | null
}

export interface MaintenanceHandover {
  at: string
  odometer: number | null
  fuelLevel: FuelLevel | null
  receiverName: string | null
  checklist: HandoverChecklist
  note: string | null
}

export interface MaintenanceReturn {
  at: string
  odometer: number | null
  fuelLevel: FuelLevel | null
  handlerName: string | null
  checklist: HandoverChecklist
  workDone: string | null
  partsReplaced: string | null
  note: string | null
}

export interface MaintenanceDocument {
  id: number
  maintenanceId: number
  kind: MaintenanceDocumentKind
  fileUrl: string
  fileName: string
  uploadedById: number
  uploadedBy: string
  createdAt: string
}

// Shape dari GET /maintenance (list) & GET /maintenance/:id (detail + documents)
export interface MaintenanceRecord {
  id: number
  requestNo: string | null
  status: MaintenanceStatus
  vehicle: MaintenanceVehicleRef
  vehicleId: number
  vehicleName: string
  plateNumber: string
  vendor: MaintenanceVendorRef | null
  /** Nama vendor (termasuk nama bengkel data lama tanpa master vendor). */
  vendorName: string | null
  category: MaintenanceCategory
  categoryLabel: string
  description: string
  complaint: string | null
  location: string | null
  plannedDate: string | null
  estimatedDays: number | null
  scheduledDate: string | null
  scheduleNote: string | null
  pickupMethod: MaintenancePickupMethod | null
  estimatedCost: number | null
  actualCost: number | null
  costBearer: MaintenanceCostBearer | null
  odometer: number | null
  submittedAt: string | null
  handover: MaintenanceHandover | null
  return: MaintenanceReturn | null
  completedAt: string | null
  cancelledAt: string | null
  cancelReason: string | null
  proofPhotos: string[]
  sourceIssueId: number | null
  createdBy: string
  createdAt: string
  updatedAt: string
  /** Jendela tanggal yang sedang memblokir booking (null = tidak memblokir). */
  blockStart: string | null
  blockEnd: string | null
  documents?: MaintenanceDocument[]
}

/** Respons aksi maintenance - `warning` bila bentrok dengan booking disetujui. */
export interface MaintenanceActionResponse {
  success: boolean
  message: string
  data: MaintenanceRecord
  warning?: string
}

export interface MaintenanceOption<T extends string = string> {
  value: T
  label: string
}

// GET /maintenance/options - pilihan tetap untuk form
export interface MaintenanceOptions {
  categories: MaintenanceOption<MaintenanceCategory>[]
  pickupMethods: MaintenanceOption<MaintenancePickupMethod>[]
  costBearers: MaintenanceOption<MaintenanceCostBearer>[]
  fuelLevels: FuelLevel[]
  checklist: MaintenanceOption[]
}

// POST /maintenance & PUT /maintenance/:id
export interface MaintenancePlanPayload {
  vehicleId: number
  vendorId?: number
  category: MaintenanceCategory
  description: string
  complaint?: string
  location?: string
  plannedDate?: string
  estimatedDays?: number
  pickupMethod?: MaintenancePickupMethod
  estimatedCost?: number
  costBearer?: MaintenanceCostBearer
  odometer?: number
  /** Create saja: langsung ajukan (buat nomor surat). */
  submit?: boolean
}

export interface ScheduleMaintenancePayload {
  scheduledDate: string
  estimatedDays?: number
  note?: string
}

export interface HandoverMaintenancePayload {
  handoverAt?: string
  odometer?: number
  fuelLevel?: FuelLevel
  receiverName: string
  checklist?: HandoverChecklist
  note?: string
}

export interface ReturnMaintenancePayload {
  returnedAt?: string
  odometer?: number
  fuelLevel?: FuelLevel
  handlerName?: string
  checklist?: HandoverChecklist
  workDone: string
  partsReplaced?: string
  note?: string
  actualCost?: number
  costBearer?: MaintenanceCostBearer
}

export interface MaintenanceCostPayload {
  estimatedCost?: number
  actualCost?: number
  costBearer?: MaintenanceCostBearer
}

export interface MaintenanceParams {
  vehicleId?: number
  vendorId?: number
  /** Satu status, beberapa dipisah koma, atau "ACTIVE" (belum final). */
  status?: string
  search?: string
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

// ─────────────────────────────────────────
// VENDOR / BENGKEL
// ─────────────────────────────────────────

export type VendorType = 'OWNER' | 'WORKSHOP' | 'BOTH'

export interface Vendor {
  id: number
  name: string
  type: VendorType
  typeLabel: string
  address: string | null
  picName: string | null
  phone: string | null
  email: string | null
  note: string | null
  isActive: boolean
  vehicleCount: number
  maintenanceCount: number
  createdAt: string
  updatedAt: string
}

export interface VendorPayload {
  name: string
  type: VendorType
  address?: string
  picName?: string
  phone?: string
  email?: string
  note?: string
}

export interface VendorParams {
  search?: string
  type?: 'OWNER' | 'WORKSHOP'
  isActive?: boolean
}

// ─────────────────────────────────────────
// LAPORAN KENDALA KENDARAAN (supir)
// ─────────────────────────────────────────

export type VehicleIssueStatus = 'OPEN' | 'CONVERTED' | 'DISMISSED'

export interface VehicleIssue {
  id: number
  vehicle: { id: number; name: string; plateNumber: string }
  bookingId: number | null
  reportedBy: { id: number; name: string }
  description: string
  location: string | null
  photos: string[]
  canContinue: boolean
  status: VehicleIssueStatus
  handledBy: string | null
  handledNote: string | null
  handledAt: string | null
  maintenanceId: number | null
  createdAt: string
}

export interface VehicleIssueParams {
  status?: VehicleIssueStatus
  vehicleId?: number
  page?: number
  limit?: number
}

// ─────────────────────────────────────────
// PENGATURAN DOKUMEN (kop surat & penandatangan)
// ─────────────────────────────────────────

export interface DocumentSettings {
  companyName: string
  companyAddress: string
  companyPhone: string
  companyEmail: string
  logoUrl: string | null
  signerName: string
  signerTitle: string
  letterCode: string
  updatedAt: string
}

export type DocumentSettingsPayload = Omit<DocumentSettings, 'logoUrl' | 'updatedAt'>

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

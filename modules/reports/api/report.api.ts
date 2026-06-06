// ─────────────────────────────────────────
// REPORT SERVICE
// Endpoint EXISTING  → fetch ke backend.
// Endpoint DUMMY     → return data statis + komentar TODO [BACKEND].
//                      Ganti body async dengan apiClient.get(...) saat siap.
// ─────────────────────────────────────────

import { apiClient } from '@/lib'
import { API_ENDPOINTS } from '@/constants'
import type {
  ApiResponse,
  PaginatedResponse,
  // Existing
  BookingSummaryReport,
  ResourceUsageReport,
  FuelExpenseReport,
  MaintenanceCostReport,
  DriverRatingReport,
  DriverActivityReport,
  OverdueBooking,
  AuditLog,
  AuditLogQueryParams,
  ReportDateParams,
  // New (DUMMY)
  ReportOverview,
  BookingTrend,
  BookingByDepartment,
  BookingByResource,
  ApprovalPerformance,
  ResourceAvailability,
  CostSummary,
  CostByVehicle,
  CostByDepartment,
  CostTrend,
  DriverPerformance,
  DepartmentSummary,
  ReportTrendParams,
  ReportPeriodParams,
} from '@/types'

// ─────────────────────────────────────────
// DUMMY DATA GENERATORS
// TODO: Hapus section ini setelah backend siap.
//       Ganti setiap fungsi dummy dengan API call.
// ─────────────────────────────────────────

const DUMMY_OVERVIEW: ReportOverview = {
  totalBookings: 124,
  totalCost: 15750000,
  avgUtilization: 72.3,
  overdueCount: 2,
  previousPeriod: {
    totalBookings: 108,
    totalCost: 14200000,
    avgUtilization: 68.1,
    overdueCount: 5,
  },
  changePercent: {
    bookings: 14.8,
    cost: 10.9,
    utilization: 6.2,
    overdue: -60.0,
  },
}

const DUMMY_BOOKING_TREND: BookingTrend[] = [
  { period: '2025-01', count: 18, vehicle: 12, room: 6 },
  { period: '2025-02', count: 22, vehicle: 14, room: 8 },
  { period: '2025-03', count: 15, vehicle: 9, room: 6 },
  { period: '2025-04', count: 28, vehicle: 18, room: 10 },
  { period: '2025-05', count: 32, vehicle: 20, room: 12 },
  { period: '2025-06', count: 24, vehicle: 15, room: 9 },
  { period: '2025-07', count: 30, vehicle: 19, room: 11 },
  { period: '2025-08', count: 35, vehicle: 22, room: 13 },
  { period: '2025-09', count: 27, vehicle: 16, room: 11 },
  { period: '2025-10', count: 31, vehicle: 20, room: 11 },
  { period: '2025-11', count: 38, vehicle: 24, room: 14 },
  { period: '2025-12', count: 29, vehicle: 18, room: 11 },
]

const DUMMY_BOOKING_BY_DEPT: BookingByDepartment[] = [
  { departmentId: 1, departmentName: 'Operations', total: 42, pending: 3, approved: 5, completed: 30, cancelled: 2, rejected: 2 },
  { departmentId: 2, departmentName: 'Marketing', total: 28, pending: 1, approved: 3, completed: 22, cancelled: 1, rejected: 1 },
  { departmentId: 3, departmentName: 'Finance', total: 18, pending: 0, approved: 2, completed: 15, cancelled: 1, rejected: 0 },
  { departmentId: 4, departmentName: 'HR', total: 15, pending: 1, approved: 1, completed: 12, cancelled: 0, rejected: 1 },
  { departmentId: 5, departmentName: 'IT', total: 21, pending: 0, approved: 2, completed: 16, cancelled: 2, rejected: 1 },
]

const DUMMY_BOOKING_BY_RESOURCE: BookingByResource[] = [
  { resourceId: 1, resourceName: 'Toyota Avanza', resourceType: 'VEHICLE', totalBookings: 25, totalHours: 187.5 },
  { resourceId: 2, resourceName: 'Honda Civic', resourceType: 'VEHICLE', totalBookings: 18, totalHours: 144.0 },
  { resourceId: 3, resourceName: 'Mitsubishi Pajero', resourceType: 'VEHICLE', totalBookings: 15, totalHours: 210.0 },
  { resourceId: 10, resourceName: 'Ruang Rapat A', resourceType: 'ROOM', totalBookings: 32, totalHours: 96.0 },
  { resourceId: 11, resourceName: 'Ruang Rapat B', resourceType: 'ROOM', totalBookings: 22, totalHours: 66.0 },
]

const DUMMY_APPROVAL_PERF: ApprovalPerformance = {
  avgApprovalTimeHours: 2.3,
  approvedWithin24h: 92.5,
  totalProcessed: 118,
}

const DUMMY_RESOURCE_AVAIL: ResourceAvailability[] = [
  { resourceId: 1, name: 'Toyota Avanza', type: 'VEHICLE', status: 'AVAILABLE', currentBooking: null, nextBooking: { id: 45, user: 'Budi', startDate: '2025-06-10T08:00:00Z' }, idleHoursThisMonth: 120 },
  { resourceId: 2, name: 'Honda Civic', type: 'VEHICLE', status: 'AVAILABLE', currentBooking: { id: 44, user: 'Rina', endDate: '2025-06-08T18:00:00Z' }, nextBooking: null, idleHoursThisMonth: 80 },
  { resourceId: 3, name: 'Mitsubishi Pajero', type: 'VEHICLE', status: 'MAINTENANCE', currentBooking: null, nextBooking: null, idleHoursThisMonth: 200 },
  { resourceId: 10, name: 'Ruang Rapat A', type: 'ROOM', status: 'AVAILABLE', currentBooking: null, nextBooking: { id: 46, user: 'Doni', startDate: '2025-06-07T09:00:00Z' }, idleHoursThisMonth: 150 },
]

const DUMMY_COST_SUMMARY: CostSummary = {
  totalFuelCost: 8500000,
  totalMaintenanceCost: 4250000,
  totalCost: 12750000,
  previousPeriod: { totalFuelCost: 7800000, totalMaintenanceCost: 5100000, totalCost: 12900000 },
  changePercent: { fuel: 8.9, maintenance: -16.7, total: -1.2 },
}

const DUMMY_COST_BY_VEHICLE: CostByVehicle[] = [
  { vehicleId: 1, name: 'Toyota Avanza', plateNumber: 'B 1234 ABC', fuelCost: 3050000, maintenanceCost: 1500000, totalCost: 4550000, totalKm: 3200, avgCostPerKm: 1422 },
  { vehicleId: 2, name: 'Honda Civic', plateNumber: 'B 5678 XYZ', fuelCost: 2800000, maintenanceCost: 750000, totalCost: 3550000, totalKm: 2800, avgCostPerKm: 1268 },
  { vehicleId: 3, name: 'Mitsubishi Pajero', plateNumber: 'B 9999 VIP', fuelCost: 4200000, maintenanceCost: 2000000, totalCost: 6200000, totalKm: 4500, avgCostPerKm: 1378 },
]

const DUMMY_COST_BY_DEPT: CostByDepartment[] = [
  { departmentId: 1, departmentName: 'Operations', bookingCount: 42, fuelCost: 4200000, maintenanceCost: 0, totalCost: 4200000 },
  { departmentId: 2, departmentName: 'Marketing', bookingCount: 28, fuelCost: 2800000, maintenanceCost: 0, totalCost: 2800000 },
  { departmentId: 3, departmentName: 'Finance', bookingCount: 18, fuelCost: 900000, maintenanceCost: 0, totalCost: 900000 },
  { departmentId: 4, departmentName: 'HR', bookingCount: 15, fuelCost: 750000, maintenanceCost: 0, totalCost: 750000 },
]

const DUMMY_COST_TREND: CostTrend[] = [
  { period: '2025-01', fuelCost: 6200000, maintenanceCost: 1500000, totalCost: 7700000 },
  { period: '2025-02', fuelCost: 7100000, maintenanceCost: 2200000, totalCost: 9300000 },
  { period: '2025-03', fuelCost: 5800000, maintenanceCost: 800000, totalCost: 6600000 },
  { period: '2025-04', fuelCost: 8200000, maintenanceCost: 3500000, totalCost: 11700000 },
  { period: '2025-05', fuelCost: 7800000, maintenanceCost: 5100000, totalCost: 12900000 },
  { period: '2025-06', fuelCost: 8500000, maintenanceCost: 4250000, totalCost: 12750000 },
]

const DUMMY_DRIVER_PERF: DriverPerformance[] = [
  { driverId: 1, driverName: 'Joko Susilo', totalTrips: 25, totalKm: 3200, totalFuelCost: 3200000, avgCostPerKm: 1000, avgRating: 4.7, totalReviews: 23, onTimeRate: 96.0, lateCount: 1 },
  { driverId: 2, driverName: 'Agus Prasetyo', totalTrips: 18, totalKm: 2400, totalFuelCost: 2640000, avgCostPerKm: 1100, avgRating: 4.2, totalReviews: 15, onTimeRate: 88.9, lateCount: 2 },
  { driverId: 3, driverName: 'Rahmat Hidayat', totalTrips: 30, totalKm: 4100, totalFuelCost: 3690000, avgCostPerKm: 900, avgRating: 4.9, totalReviews: 28, onTimeRate: 100.0, lateCount: 0 },
]

const DUMMY_DEPT_SUMMARY: DepartmentSummary[] = [
  { departmentId: 1, departmentName: 'Operations', bookingCount: 42, fuelCost: 4200000, maintenanceCost: 0, totalCost: 4200000, topResource: 'Toyota Avanza' },
  { departmentId: 2, departmentName: 'Marketing', bookingCount: 28, fuelCost: 2800000, maintenanceCost: 0, totalCost: 2800000, topResource: 'Ruang Rapat A' },
  { departmentId: 3, departmentName: 'Finance', bookingCount: 18, fuelCost: 900000, maintenanceCost: 0, totalCost: 900000, topResource: 'Honda Civic' },
  { departmentId: 4, departmentName: 'HR', bookingCount: 15, fuelCost: 750000, maintenanceCost: 0, totalCost: 750000, topResource: 'Ruang Rapat B' },
  { departmentId: 5, departmentName: 'IT', bookingCount: 21, fuelCost: 1050000, maintenanceCost: 0, totalCost: 1050000, topResource: 'Ruang Rapat A' },
]

// ─────────────────────────────────────────
// SERVICE
// ─────────────────────────────────────────

export const reportApi = {
  // ── EXISTING ENDPOINTS (fetch dari backend) ──

  getBookingSummary: (params?: ReportDateParams) =>
    apiClient
      .get<ApiResponse<BookingSummaryReport>>(API_ENDPOINTS.REPORTS.BOOKINGS, { params })
      .then((r) => r.data),

  getResourceUsage: (params?: ReportDateParams) =>
    apiClient
      .get<ApiResponse<ResourceUsageReport[]>>(API_ENDPOINTS.REPORTS.RESOURCE_USAGE, { params })
      .then((r) => r.data),

  getFuelExpenses: (params?: ReportDateParams) =>
    apiClient
      .get<ApiResponse<FuelExpenseReport[]>>(API_ENDPOINTS.REPORTS.FUEL_EXPENSES, { params })
      .then((r) => r.data),

  getMaintenanceCost: (params?: ReportDateParams) =>
    apiClient
      .get<ApiResponse<MaintenanceCostReport[]>>(API_ENDPOINTS.REPORTS.MAINTENANCE_COST, { params })
      .then((r) => r.data),

  getDriverRatings: () =>
    apiClient
      .get<ApiResponse<DriverRatingReport[]>>(API_ENDPOINTS.REPORTS.DRIVER_RATINGS)
      .then((r) => r.data),

  getDriverActivity: () =>
    apiClient
      .get<ApiResponse<DriverActivityReport[]>>(API_ENDPOINTS.REPORTS.DRIVER_ACTIVITY)
      .then((r) => r.data),

  getOverdueBookings: () =>
    apiClient
      .get<ApiResponse<OverdueBooking[]>>(API_ENDPOINTS.REPORTS.OVERDUE_BOOKINGS)
      .then((r) => r.data),

  getAuditLogs: (params?: AuditLogQueryParams) =>
    apiClient
      .get<PaginatedResponse<AuditLog>>(API_ENDPOINTS.REPORTS.AUDIT_LOGS, { params })
      .then((r) => r.data),

  // ── DUMMY ENDPOINTS (belum ada di backend) ──

  // TODO [BACKEND]: GET /api/v1/reports/overview?period=monthly
  getOverview: async (_params?: ReportPeriodParams): Promise<ApiResponse<ReportOverview>> => ({
    success: true,
    message: 'DUMMY',
    data: DUMMY_OVERVIEW,
  }),

  // TODO [BACKEND]: GET /api/v1/reports/bookings/trend?groupBy=monthly&periods=12
  getBookingTrend: async (_params?: ReportTrendParams): Promise<ApiResponse<BookingTrend[]>> => ({
    success: true,
    message: 'DUMMY',
    data: DUMMY_BOOKING_TREND,
  }),

  // TODO [BACKEND]: GET /api/v1/reports/bookings/by-department
  getBookingByDepartment: async (_params?: ReportDateParams): Promise<ApiResponse<BookingByDepartment[]>> => ({
    success: true,
    message: 'DUMMY',
    data: DUMMY_BOOKING_BY_DEPT,
  }),

  // TODO [BACKEND]: GET /api/v1/reports/bookings/by-resource
  getBookingByResource: async (_params?: ReportDateParams): Promise<ApiResponse<BookingByResource[]>> => ({
    success: true,
    message: 'DUMMY',
    data: DUMMY_BOOKING_BY_RESOURCE,
  }),

  // TODO [BACKEND]: GET /api/v1/reports/bookings/approval-performance
  getApprovalPerformance: async (_params?: ReportDateParams): Promise<ApiResponse<ApprovalPerformance>> => ({
    success: true,
    message: 'DUMMY',
    data: DUMMY_APPROVAL_PERF,
  }),

  // TODO [BACKEND]: GET /api/v1/reports/resource-availability
  getResourceAvailability: async (): Promise<ApiResponse<ResourceAvailability[]>> => ({
    success: true,
    message: 'DUMMY',
    data: DUMMY_RESOURCE_AVAIL,
  }),

  // TODO [BACKEND]: GET /api/v1/reports/cost-summary
  getCostSummary: async (_params?: ReportDateParams): Promise<ApiResponse<CostSummary>> => ({
    success: true,
    message: 'DUMMY',
    data: DUMMY_COST_SUMMARY,
  }),

  // TODO [BACKEND]: GET /api/v1/reports/cost/by-vehicle
  getCostByVehicle: async (_params?: ReportDateParams): Promise<ApiResponse<CostByVehicle[]>> => ({
    success: true,
    message: 'DUMMY',
    data: DUMMY_COST_BY_VEHICLE,
  }),

  // TODO [BACKEND]: GET /api/v1/reports/cost/by-department
  getCostByDepartment: async (_params?: ReportDateParams): Promise<ApiResponse<CostByDepartment[]>> => ({
    success: true,
    message: 'DUMMY',
    data: DUMMY_COST_BY_DEPT,
  }),

  // TODO [BACKEND]: GET /api/v1/reports/cost/trend?groupBy=monthly&periods=6
  getCostTrend: async (_params?: ReportTrendParams): Promise<ApiResponse<CostTrend[]>> => ({
    success: true,
    message: 'DUMMY',
    data: DUMMY_COST_TREND,
  }),

  // TODO [BACKEND]: GET /api/v1/reports/driver-performance
  getDriverPerformance: async (_params?: ReportDateParams): Promise<ApiResponse<DriverPerformance[]>> => ({
    success: true,
    message: 'DUMMY',
    data: DUMMY_DRIVER_PERF,
  }),

  // TODO [BACKEND]: GET /api/v1/reports/department-summary
  getDepartmentSummary: async (_params?: ReportDateParams): Promise<ApiResponse<DepartmentSummary[]>> => ({
    success: true,
    message: 'DUMMY',
    data: DUMMY_DEPT_SUMMARY,
  }),
}

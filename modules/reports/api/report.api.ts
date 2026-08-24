// ─────────────────────────────────────────
// REPORT SERVICE - semua endpoint dari backend real
// ─────────────────────────────────────────

import { apiClient } from '@/lib'
import { API_ENDPOINTS } from '@/constants'
import type {
  ApiResponse,
  PaginatedResponse,
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
  ReportOverview,
  BookingTrend,
  BookingByDepartment,
  BookingByResource,
  ApprovalPerformance,
  CostSummary,
  CostByVehicle,
  CostByDepartment,
  CostTrend,
  DriverPerformance,
  DriverTrips,
  DepartmentSummary,
  ReportTrendParams,
  ReportPeriodParams,
} from '@/types'

const get = <T>(url: string, params?: unknown) =>
  apiClient.get<ApiResponse<T>>(url, { params }).then((r) => r.data)

export const reportApi = {
  getBookingSummary: (params?: ReportDateParams) =>
    get<BookingSummaryReport>(API_ENDPOINTS.REPORTS.BOOKINGS, params),

  getResourceUsage: (params?: ReportDateParams) =>
    get<ResourceUsageReport[]>(API_ENDPOINTS.REPORTS.RESOURCE_USAGE, params),

  getFuelExpenses: (params?: ReportDateParams) =>
    get<FuelExpenseReport[]>(API_ENDPOINTS.REPORTS.FUEL_EXPENSES, params),

  getMaintenanceCost: (params?: ReportDateParams) =>
    get<MaintenanceCostReport[]>(API_ENDPOINTS.REPORTS.MAINTENANCE_COST, params),

  getDriverRatings: () =>
    get<DriverRatingReport[]>(API_ENDPOINTS.REPORTS.DRIVER_RATINGS),

  getDriverActivity: () =>
    get<DriverActivityReport[]>(API_ENDPOINTS.REPORTS.DRIVER_ACTIVITY),

  getOverdueBookings: () =>
    get<OverdueBooking[]>(API_ENDPOINTS.REPORTS.OVERDUE_BOOKINGS),

  getAuditLogs: (params?: AuditLogQueryParams) =>
    apiClient
      .get<PaginatedResponse<AuditLog>>(API_ENDPOINTS.REPORTS.AUDIT_LOGS, { params })
      .then((r) => r.data),

  // ── Extended ──
  getOverview: (params?: ReportPeriodParams) =>
    get<ReportOverview>(API_ENDPOINTS.REPORTS.OVERVIEW, params),

  getBookingTrend: (params?: ReportTrendParams) =>
    get<BookingTrend[]>(API_ENDPOINTS.REPORTS.BOOKINGS_TREND, params),

  getBookingByDepartment: (params?: ReportDateParams) =>
    get<BookingByDepartment[]>(API_ENDPOINTS.REPORTS.BOOKINGS_BY_DEPT, params),

  getBookingByResource: (params?: ReportDateParams) =>
    get<BookingByResource[]>(API_ENDPOINTS.REPORTS.BOOKINGS_BY_RESOURCE, params),

  getApprovalPerformance: (params?: ReportDateParams) =>
    get<ApprovalPerformance>(API_ENDPOINTS.REPORTS.APPROVAL_PERF, params),

  getCostSummary: (params?: ReportDateParams) =>
    get<CostSummary>(API_ENDPOINTS.REPORTS.COST_SUMMARY, params),

  getCostByVehicle: (params?: ReportDateParams) =>
    get<CostByVehicle[]>(API_ENDPOINTS.REPORTS.COST_BY_VEHICLE, params),

  getCostByDepartment: (params?: ReportDateParams) =>
    get<CostByDepartment[]>(API_ENDPOINTS.REPORTS.COST_BY_DEPT, params),

  getCostTrend: (params?: ReportTrendParams) =>
    get<CostTrend[]>(API_ENDPOINTS.REPORTS.COST_TREND, params),

  getDriverPerformance: (params?: ReportDateParams) =>
    get<DriverPerformance[]>(API_ENDPOINTS.REPORTS.DRIVER_PERFORMANCE, params),

  // SPD vs Non-SPD, overtime, dan rating per driver - satu-satunya endpoint
  // yang rating-nya ikut ter-filter rentang tanggal (params).
  getDriverTrips: (params?: ReportDateParams) =>
    get<DriverTrips[]>(API_ENDPOINTS.REPORTS.DRIVER_TRIPS, params),

  getDepartmentSummary: (params?: ReportDateParams) =>
    get<DepartmentSummary[]>(API_ENDPOINTS.REPORTS.DEPT_SUMMARY, params),
}

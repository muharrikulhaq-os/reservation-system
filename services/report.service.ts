// ─────────────────────────────────────────
// REPORT SERVICE
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
} from '@/types'

export const reportService = {
  getBookingSummary: (params?: ReportDateParams) =>
    apiClient
      .get<ApiResponse<BookingSummaryReport>>(
        API_ENDPOINTS.REPORTS.BOOKINGS,
        { params },
      )
      .then((r) => r.data),

  getResourceUsage: (params?: ReportDateParams) =>
    apiClient
      .get<ApiResponse<ResourceUsageReport[]>>(
        API_ENDPOINTS.REPORTS.RESOURCE_USAGE,
        { params },
      )
      .then((r) => r.data),

  getFuelExpenses: (params?: ReportDateParams) =>
    apiClient
      .get<ApiResponse<FuelExpenseReport[]>>(
        API_ENDPOINTS.REPORTS.FUEL_EXPENSES,
        { params },
      )
      .then((r) => r.data),

  getMaintenanceCost: (params?: ReportDateParams) =>
    apiClient
      .get<ApiResponse<MaintenanceCostReport[]>>(
        API_ENDPOINTS.REPORTS.MAINTENANCE_COST,
        { params },
      )
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
}

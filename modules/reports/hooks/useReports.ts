// ─────────────────────────────────────────
// REPORT HOOKS - TanStack Query
// Existing → fetch backend. Dummy → lihat report.api.ts.
// ─────────────────────────────────────────

import { useQuery } from '@tanstack/react-query'
import { QUERY_KEYS } from '@/constants'
import { reportApi } from '../api/report.api'
import type {
  ReportDateParams,
  ReportTrendParams,
  ReportPeriodParams,
  AuditLogQueryParams,
} from '@/types'

// ── Existing endpoints ──

export const useBookingSummary = (params?: ReportDateParams) =>
  useQuery({
    queryKey: [...QUERY_KEYS.REPORTS.BOOKINGS, params],
    queryFn: () => reportApi.getBookingSummary(params).then((r) => r.data),
  })

export const useResourceUsage = (params?: ReportDateParams) =>
  useQuery({
    queryKey: [...QUERY_KEYS.REPORTS.RESOURCE_USAGE, params],
    queryFn: () => reportApi.getResourceUsage(params).then((r) => r.data),
  })

export const useFuelExpenseReport = (params?: ReportDateParams) =>
  useQuery({
    queryKey: [...QUERY_KEYS.REPORTS.FUEL_EXPENSES, params],
    queryFn: () => reportApi.getFuelExpenses(params).then((r) => r.data),
  })

export const useMaintenanceCostReport = (params?: ReportDateParams) =>
  useQuery({
    queryKey: [...QUERY_KEYS.REPORTS.MAINTENANCE_COST, params],
    queryFn: () => reportApi.getMaintenanceCost(params).then((r) => r.data),
  })

export const useDriverRatingsReport = () =>
  useQuery({
    queryKey: QUERY_KEYS.REPORTS.DRIVER_RATINGS,
    queryFn: () => reportApi.getDriverRatings().then((r) => r.data),
  })

export const useDriverActivityReport = () =>
  useQuery({
    queryKey: QUERY_KEYS.REPORTS.DRIVER_ACTIVITY,
    queryFn: () => reportApi.getDriverActivity().then((r) => r.data),
  })

export const useOverdueBookings = () =>
  useQuery({
    queryKey: QUERY_KEYS.REPORTS.OVERDUE_BOOKINGS,
    queryFn: () => reportApi.getOverdueBookings().then((r) => r.data),
  })

export const useAuditLogs = (params?: AuditLogQueryParams) =>
  useQuery({
    queryKey: [...QUERY_KEYS.REPORTS.AUDIT_LOGS, params],
    queryFn: () => reportApi.getAuditLogs(params),
  })

// ── Dummy endpoints (TODO: ganti setelah backend siap) ──

export const useReportOverview = (params?: ReportPeriodParams) =>
  useQuery({
    queryKey: [...QUERY_KEYS.REPORTS.OVERVIEW, params],
    queryFn: () => reportApi.getOverview(params).then((r) => r.data),
  })

export const useBookingTrend = (params?: ReportTrendParams) =>
  useQuery({
    queryKey: [...QUERY_KEYS.REPORTS.BOOKING_TREND, params],
    queryFn: () => reportApi.getBookingTrend(params).then((r) => r.data),
  })

export const useBookingByDepartment = (params?: ReportDateParams) =>
  useQuery({
    queryKey: [...QUERY_KEYS.REPORTS.BOOKING_BY_DEPT, params],
    queryFn: () => reportApi.getBookingByDepartment(params).then((r) => r.data),
  })

export const useBookingByResource = (params?: ReportDateParams) =>
  useQuery({
    queryKey: [...QUERY_KEYS.REPORTS.BOOKING_BY_RESOURCE, params],
    queryFn: () => reportApi.getBookingByResource(params).then((r) => r.data),
  })

export const useApprovalPerformance = (params?: ReportDateParams) =>
  useQuery({
    queryKey: [...QUERY_KEYS.REPORTS.APPROVAL_PERF, params],
    queryFn: () => reportApi.getApprovalPerformance(params).then((r) => r.data),
  })

export const useCostSummary = (params?: ReportDateParams) =>
  useQuery({
    queryKey: [...QUERY_KEYS.REPORTS.COST_SUMMARY, params],
    queryFn: () => reportApi.getCostSummary(params).then((r) => r.data),
  })

export const useCostByVehicle = (params?: ReportDateParams) =>
  useQuery({
    queryKey: [...QUERY_KEYS.REPORTS.COST_BY_VEHICLE, params],
    queryFn: () => reportApi.getCostByVehicle(params).then((r) => r.data),
  })

export const useCostByDepartment = (params?: ReportDateParams) =>
  useQuery({
    queryKey: [...QUERY_KEYS.REPORTS.COST_BY_DEPT, params],
    queryFn: () => reportApi.getCostByDepartment(params).then((r) => r.data),
  })

export const useCostTrend = (params?: ReportTrendParams) =>
  useQuery({
    queryKey: [...QUERY_KEYS.REPORTS.COST_TREND, params],
    queryFn: () => reportApi.getCostTrend(params).then((r) => r.data),
  })

export const useDriverPerformance = (params?: ReportDateParams) =>
  useQuery({
    queryKey: [...QUERY_KEYS.REPORTS.DRIVER_PERFORMANCE, params],
    queryFn: () => reportApi.getDriverPerformance(params).then((r) => r.data),
  })

export const useDepartmentSummary = (params?: ReportDateParams) =>
  useQuery({
    queryKey: [...QUERY_KEYS.REPORTS.DEPT_SUMMARY, params],
    queryFn: () => reportApi.getDepartmentSummary(params).then((r) => r.data),
  })

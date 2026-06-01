// ─────────────────────────────────────────
// REPORT HOOKS
// ─────────────────────────────────────────

import { useQuery } from '@tanstack/react-query'
import { QUERY_KEYS } from '@/constants'
import { reportService } from '@/services'
import type { ReportDateParams, AuditLogQueryParams } from '@/types'

export const useBookingSummaryReport = (params?: ReportDateParams) =>
  useQuery({
    queryKey: [...QUERY_KEYS.REPORTS.BOOKINGS, params],
    queryFn:  () => reportService.getBookingSummary(params).then((r) => r.data),
  })

export const useResourceUsageReport = (params?: ReportDateParams) =>
  useQuery({
    queryKey: [...QUERY_KEYS.REPORTS.RESOURCE_USAGE, params],
    queryFn:  () => reportService.getResourceUsage(params).then((r) => r.data),
  })

export const useFuelExpenseReport = (params?: ReportDateParams) =>
  useQuery({
    queryKey: [...QUERY_KEYS.REPORTS.FUEL_EXPENSES, params],
    queryFn:  () => reportService.getFuelExpenses(params).then((r) => r.data),
  })

export const useMaintenanceCostReport = (params?: ReportDateParams) =>
  useQuery({
    queryKey: [...QUERY_KEYS.REPORTS.MAINTENANCE_COST, params],
    queryFn:  () => reportService.getMaintenanceCost(params).then((r) => r.data),
  })

export const useDriverRatingsReport = () =>
  useQuery({
    queryKey: QUERY_KEYS.REPORTS.DRIVER_RATINGS,
    queryFn:  () => reportService.getDriverRatings().then((r) => r.data),
  })

export const useDriverActivityReport = () =>
  useQuery({
    queryKey: QUERY_KEYS.REPORTS.DRIVER_ACTIVITY,
    queryFn:  () => reportService.getDriverActivity().then((r) => r.data),
  })

export const useOverdueBookingsReport = () =>
  useQuery({
    queryKey: QUERY_KEYS.REPORTS.OVERDUE_BOOKINGS,
    queryFn:  () => reportService.getOverdueBookings().then((r) => r.data),
  })

export const useAuditLogs = (params?: AuditLogQueryParams) =>
  useQuery({
    queryKey: [...QUERY_KEYS.REPORTS.AUDIT_LOGS, params],
    queryFn:  () => reportService.getAuditLogs(params).then((r) => r.data),
  })

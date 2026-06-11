// ─────────────────────────────────────────
// API ENDPOINTS
// Base URL & prefix dikontrol dari APP_CONFIG
// Gunakan helper buildUrl() untuk dynamic segments
// ─────────────────────────────────────────

export const API_PREFIX = '/api/v1' as const

export const API_ENDPOINTS = {
  // ── Health ──────────────────────────────
  HEALTH: '/health',

  // ── Auth ────────────────────────────────
  AUTH: {
    REGISTER:        `${API_PREFIX}/auth/register`,
    LOGIN:           `${API_PREFIX}/auth/login`,
    REFRESH:         `${API_PREFIX}/auth/refresh`,
    LOGOUT:          `${API_PREFIX}/auth/logout`,
    FORGOT_PASSWORD: `${API_PREFIX}/auth/forgot-password`,
    VERIFY_OTP:      `${API_PREFIX}/auth/verify-otp`,
    RESET_PASSWORD:  `${API_PREFIX}/auth/reset-password`,
    CHANGE_PASSWORD: `${API_PREFIX}/auth/change-password`,
    ME:              `${API_PREFIX}/auth/me`,
  },

  DASHBOARD: {
    SUMMARY: `${API_PREFIX}/dashboard/summary`
  },

  // ── Users ───────────────────────────────
  USERS: {
    BASE:            `${API_PREFIX}/users`,
    ME:              `${API_PREFIX}/users/me`,
    ROLES:           `${API_PREFIX}/users/roles`,
    DEPARTMENTS:     `${API_PREFIX}/users/departments`,
    BY_ID:           (id: number) => `${API_PREFIX}/users/${id}`,
    TOGGLE_ACTIVE:   (id: number) => `${API_PREFIX}/users/${id}/toggle-active`,
    ME_PHOTO:        `${API_PREFIX}/users/me/profile-photo`,
    PHOTO_BY_ID:     (id: number) => `${API_PREFIX}/users/${id}/profile-photo`,
  },

  // ── Vehicles ────────────────────────────
  VEHICLES: {
    BASE:            `${API_PREFIX}/vehicles`,
    CATEGORIES:      `${API_PREFIX}/vehicles/categories`,
    CATEGORY_BY_ID:  (id: number) => `${API_PREFIX}/vehicles/categories/${id}`,
    BY_ID:           (id: number) => `${API_PREFIX}/vehicles/${id}`,
    STATUS:          (id: number) => `${API_PREFIX}/vehicles/${id}/status`,
    PHOTO:           (id: number) => `${API_PREFIX}/vehicles/${id}/photo`,
    ATTACHMENTS:     (id: number) => `${API_PREFIX}/vehicles/${id}/attachments`,
  },

  // ── Rooms ───────────────────────────────
  ROOMS: {
    BASE:            `${API_PREFIX}/rooms`,
    BY_ID:           (id: number) => `${API_PREFIX}/rooms/${id}`,
    STATUS:          (id: number) => `${API_PREFIX}/rooms/${id}/status`,
    PHOTO:           (id: number) => `${API_PREFIX}/rooms/${id}/photo`,
    ATTACHMENTS:     (id: number) => `${API_PREFIX}/rooms/${id}/attachments`,
  },

  // ── Bookings ────────────────────────────
  BOOKINGS: {
    BASE:            `${API_PREFIX}/bookings`,
    BY_ID:           (id: number) => `${API_PREFIX}/bookings/${id}`,
    CANCEL:          (id: number) => `${API_PREFIX}/bookings/${id}/cancel`,
    APPROVE:         (id: number) => `${API_PREFIX}/bookings/${id}/approve`,
    REJECT:          (id: number) => `${API_PREFIX}/bookings/${id}/reject`,
    ASSIGN_VEHICLE:  (id: number) => `${API_PREFIX}/bookings/${id}/assign-vehicle`,
    START:           (id: number) => `${API_PREFIX}/bookings/${id}/start`,
    COMPLETE:        (id: number) => `${API_PREFIX}/bookings/${id}/complete`,
    RATE_DRIVER:     (id: number) => `${API_PREFIX}/bookings/${id}/rate-driver`,
    DRIVER_RATINGS:  (driverId: number) => `${API_PREFIX}/bookings/drivers/${driverId}/ratings`,
    APPROVAL_LOG:    (id: number) => `${API_PREFIX}/bookings/${id}/approval-log`,
    ATTACHMENTS:     (id: number) => `${API_PREFIX}/bookings/${id}/attachments`,
    SUBSTITUTE_RESOURCE: (id: number) => `${API_PREFIX}/bookings/${id}/substitute-resource`,
    MERGE:               (id: number) => `${API_PREFIX}/bookings/${id}/merge`,
    MERGE_INFO:          (id: number) => `${API_PREFIX}/bookings/${id}/merge-info`,
    ACTIVITY:            (id: number) => `${API_PREFIX}/bookings/${id}/activity`,
    RETURN_REPORT:       (id: number) => `${API_PREFIX}/bookings/${id}/return-report`,
  },

  // ── Drivers ─────────────────────────────
  DRIVERS: {
    BASE:            `${API_PREFIX}/drivers`,
    BY_ID:           (id: number) => `${API_PREFIX}/drivers/${id}`,
    TOGGLE_ACTIVE:   (id: number) => `${API_PREFIX}/drivers/${id}/toggle-active`,
    ASSIGN:          (id: number) => `${API_PREFIX}/drivers/${id}/assign`,
    RELEASE:         (id: number) => `${API_PREFIX}/drivers/${id}/release`,
    ASSIGNMENTS:     (id: number) => `${API_PREFIX}/drivers/${id}/assignments`,
  },

  // ── Fuel Expenses ───────────────────────
  FUEL_EXPENSES: {
    BASE:            `${API_PREFIX}/fuel-expenses`,
    BBM:             `${API_PREFIX}/fuel-expenses/bbm`,
    LISTRIK:         `${API_PREFIX}/fuel-expenses/listrik`,
    BY_ID:           (id: number) => `${API_PREFIX}/fuel-expenses/${id}`,
  },

  // ── Maintenance ─────────────────────────
  MAINTENANCE: {
    BASE:            `${API_PREFIX}/maintenance`,
    BY_ID:           (id: number) => `${API_PREFIX}/maintenance/${id}`,
  },

  // ── Attachments ─────────────────────────
  ATTACHMENTS: {
    BY_ID:           (id: number) => `${API_PREFIX}/attachments/${id}`,
  },

  // ── Guest Bookings ──────────────────────
  GUEST_BOOKINGS: {
    BASE:            `${API_PREFIX}/guest-bookings`,
    BY_TOKEN:        (token: string) => `${API_PREFIX}/guest-bookings/${token}`,
    COMPLETE:        (token: string) => `${API_PREFIX}/guest-bookings/${token}/complete`,
    CANCEL:          (token: string) => `${API_PREFIX}/guest-bookings/${token}/cancel`,
    BY_ID:           (id: number) => `${API_PREFIX}/guest-bookings/${id}`,
    APPROVE:         (id: number) => `${API_PREFIX}/guest-bookings/${id}/approve`,
    REJECT:          (id: number) => `${API_PREFIX}/guest-bookings/${id}/reject`,
    START:           (id: number) => `${API_PREFIX}/guest-bookings/${id}/start`,
  },

  // ── Master Settings ─────────────────────
  MASTER_SETTINGS: {
    BASE:            `${API_PREFIX}/master-settings`,
    BY_KEY:          (key: string) => `${API_PREFIX}/master-settings/${key}`,
  },

  // ── Reports ─────────────────────────────
  REPORTS: {
    BOOKINGS:        `${API_PREFIX}/reports/bookings`,
    RESOURCE_USAGE:  `${API_PREFIX}/reports/resource-usage`,
    FUEL_EXPENSES:   `${API_PREFIX}/reports/fuel-expenses`,
    MAINTENANCE_COST:`${API_PREFIX}/reports/maintenance-cost`,
    DRIVER_RATINGS:  `${API_PREFIX}/reports/driver-ratings`,
    DRIVER_ACTIVITY: `${API_PREFIX}/reports/driver-activity`,
    OVERDUE_BOOKINGS:`${API_PREFIX}/reports/overdue-bookings`,
    AUDIT_LOGS:      `${API_PREFIX}/reports/audit-logs`,
  },
} as const
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
    SUMMARY:         `${API_PREFIX}/users/summary`,
    ROLES:           `${API_PREFIX}/users/roles`,
    DEPARTMENTS:     `${API_PREFIX}/users/departments`,
    BY_ID:           (id: number) => `${API_PREFIX}/users/${id}`,
    TOGGLE_ACTIVE:   (id: number) => `${API_PREFIX}/users/${id}/toggle-active`,
    RESET_PASSWORD:  (id: number) => `${API_PREFIX}/users/${id}/reset-password`,
    ME_PHOTO:        `${API_PREFIX}/users/me/profile-photo`,
    PHOTO_BY_ID:     (id: number) => `${API_PREFIX}/users/${id}/profile-photo`,
    BULK_TEMPLATE:   `${API_PREFIX}/users/bulk-template`,
    BULK_IMPORT:     `${API_PREFIX}/users/bulk-import`,
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
    FIXED_DRIVER:    (id: number) => `${API_PREFIX}/vehicles/${id}/fixed-driver`,
  },

  // ── Rooms ───────────────────────────────
  ROOMS: {
    BASE:            `${API_PREFIX}/rooms`,
    BY_ID:           (id: number) => `${API_PREFIX}/rooms/${id}`,
    STATUS:          (id: number) => `${API_PREFIX}/rooms/${id}/status`,
    PHOTO:           (id: number) => `${API_PREFIX}/rooms/${id}/photo`,
    ATTACHMENTS:     (id: number) => `${API_PREFIX}/rooms/${id}/attachments`,
    ROOM_KEEPER:     (id: number) => `${API_PREFIX}/rooms/${id}/room-keeper`,
  },

  // ── Room Keepers ────────────────────────
  ROOM_KEEPERS: {
    BASE:  `${API_PREFIX}/room-keepers`,
    BY_ID: (id: number) => `${API_PREFIX}/room-keepers/${id}`,
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
    DRIVER_RATING_BY_BOOKING: (id: number) => `${API_PREFIX}/bookings/${id}/driver-rating`,
    DRIVER_RATINGS:  (driverId: number) => `${API_PREFIX}/bookings/drivers/${driverId}/ratings`,
    RATE_ROOM:       (id: number) => `${API_PREFIX}/bookings/${id}/rate-room`,
    ROOM_RATING_BY_BOOKING: (id: number) => `${API_PREFIX}/bookings/${id}/room-rating`,
    ROOM_RATINGS:    (roomKeeperId: number) => `${API_PREFIX}/bookings/room-keepers/${roomKeeperId}/ratings`,
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
    AVAILABLE:       `${API_PREFIX}/drivers/available`, // ?startDate=&endDate=
    FIXED_VEHICLE:   (id: number) => `${API_PREFIX}/drivers/${id}/fixed-vehicle`,
  },

  // ── Fuel Expenses (multipart, BBM + Listrik) ──
  FUEL: {
    BASE:            `${API_PREFIX}/fuel-expenses`,
    BY_ID:           (id: number) => `${API_PREFIX}/fuel-expenses/${id}`,
  },

  // ── Fuel Types (master data harga acuan) ──
  FUEL_TYPES: {
    BASE:            `${API_PREFIX}/fuel-types`,
    BY_ID:           (id: number) => `${API_PREFIX}/fuel-types/${id}`,
  },

  // ── Maintenance ─────────────────────────
  MAINTENANCE: {
    BASE:            `${API_PREFIX}/maintenance`,
    BY_ID:           (id: number) => `${API_PREFIX}/maintenance/${id}`,
    COMPLETE:        (id: number) => `${API_PREFIX}/maintenance/${id}/complete`,
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
  SETTINGS: {
    BASE:            `${API_PREFIX}/master-settings`,
    BY_KEY:          (key: string) => `${API_PREFIX}/master-settings/${key}`,
  },

  // ── Reports ─────────────────────────────
  REPORTS: {
    BOOKINGS:            `${API_PREFIX}/reports/bookings`,
    RESOURCE_USAGE:      `${API_PREFIX}/reports/resource-usage`,
    FUEL_EXPENSES:       `${API_PREFIX}/reports/fuel-expenses`,
    MAINTENANCE_COST:    `${API_PREFIX}/reports/maintenance-cost`,
    DRIVER_RATINGS:      `${API_PREFIX}/reports/driver-ratings`,
    DRIVER_ACTIVITY:     `${API_PREFIX}/reports/driver-activity`,
    OVERDUE_BOOKINGS:    `${API_PREFIX}/reports/overdue-bookings`,
    AUDIT_LOGS:          `${API_PREFIX}/reports/audit-logs`,
    // Extended
    OVERVIEW:            `${API_PREFIX}/reports/overview`,
    BOOKINGS_TREND:      `${API_PREFIX}/reports/bookings/trend`,
    BOOKINGS_BY_DEPT:    `${API_PREFIX}/reports/bookings/by-department`,
    BOOKINGS_BY_RESOURCE:`${API_PREFIX}/reports/bookings/by-resource`,
    APPROVAL_PERF:       `${API_PREFIX}/reports/bookings/approval-performance`,
    COST_SUMMARY:        `${API_PREFIX}/reports/cost-summary`,
    COST_BY_VEHICLE:     `${API_PREFIX}/reports/cost/by-vehicle`,
    COST_BY_DEPT:        `${API_PREFIX}/reports/cost/by-department`,
    COST_TREND:          `${API_PREFIX}/reports/cost/trend`,
    DRIVER_PERFORMANCE:  `${API_PREFIX}/reports/driver-performance`,
    DRIVER_TRIPS:        `${API_PREFIX}/reports/driver-trips`,
    DEPT_SUMMARY:        `${API_PREFIX}/reports/department-summary`,
  },

  // ── Notifications ───────────────────────
  NOTIFICATIONS: {
    BASE:            `${API_PREFIX}/users/me/notifications`,
    UNREAD_COUNT:    `${API_PREFIX}/users/me/notifications/unread-count`,
    MARK_READ:       (id: number) => `${API_PREFIX}/users/me/notifications/${id}/read`,
    MARK_ALL_READ:   `${API_PREFIX}/users/me/notifications/read-all`,
    DEVICE_TOKENS:   `${API_PREFIX}/users/me/device-tokens`,
    // Path WS relatif ke API_PREFIX - lihat WS_URL di config.ts untuk yang lengkap.
    WS:              `${API_PREFIX}/ws`,
  },
} as const
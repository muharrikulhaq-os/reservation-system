// ─────────────────────────────────────────
// APP CONFIG & QUERY CONSTANTS
// ─────────────────────────────────────────

// --- App Config ---

export const APP_CONFIG = {
  API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080",
  REQUEST_TIMEOUT: 15_000, // 15 detik
  DEFAULT_PAGE_SIZE: 10,
  MAX_FILE_SIZE_MB: 10,
  ACCEPTED_IMAGE_TYPES: ["image/jpeg", "image/png", "image/webp"],
  ACCEPTED_DOC_TYPES: ["application/pdf", "image/jpeg", "image/png"],
} as const;

// --- Token Config ---

export const TOKEN_CONFIG = {
  ACCESS_TOKEN_KEY: "access_token",
  REFRESH_TOKEN_KEY: "refresh_token",
} as const;

// --- UI Preference Keys ---
// Key penyimpanan preferensi tampilan (bukan data).
// Dipakai lewat usePersistedState - jangan akses storage langsung.

export const STORAGE_KEYS = {
  VEHICLES_VIEW_MODE: "vehicles:view-mode",
  ROOMS_VIEW_MODE: "rooms:view-mode",
} as const;

// --- Query Keys ---
// Selalu gunakan konstanta ini sebagai queryKey di TanStack Query
// Jangan hardcode string ['bookings'] di komponen

export const QUERY_KEYS = {
  // Auth
  AUTH_ME: ["auth", "me"] as const,

  //Dashboard
  DASHBOARD: ["dashboard_summary"] as const,

  // Users
  USERS: ["users"] as const,
  USER_SUMMARY: ["users", "summary"] as const,
  USER_ROLES: ["users", "roles"] as const,
  USER_DEPARTMENTS: ["users", "departments"] as const,

  // Vehicles
  VEHICLES: ["vehicles"] as const,
  VEHICLE_CATEGORIES: ["vehicles", "categories"] as const,

  // Rooms
  ROOMS: ["rooms"] as const,

  // Bookings
  BOOKINGS: ["bookings"] as const,
  GUEST_BOOKINGS: ["guest-bookings"] as const,

  // Drivers
  DRIVERS: ["drivers"] as const,

  // Fuel
  FUEL: ["fuel-expenses"] as const,
  FUEL_TYPES: ["fuel-types"] as const,

  // Maintenance
  MAINTENANCE: ["maintenance"] as const,

  // Settings
  SETTINGS: ["master-settings"] as const,

  // Notifications
  NOTIFICATIONS: ["notifications"] as const,
  NOTIFICATIONS_UNREAD_COUNT: ["notifications", "unread-count"] as const,

  // Reports
  REPORTS: {
    BOOKINGS: ["reports", "bookings"] as const,
    RESOURCE_USAGE: ["reports", "resource-usage"] as const,
    FUEL_EXPENSES: ["reports", "fuel-expenses"] as const,
    MAINTENANCE_COST: ["reports", "maintenance-cost"] as const,
    DRIVER_RATINGS: ["reports", "driver-ratings"] as const,
    DRIVER_ACTIVITY: ["reports", "driver-activity"] as const,
    OVERDUE_BOOKINGS: ["reports", "overdue-bookings"] as const,
    AUDIT_LOGS: ["reports", "audit-logs"] as const,
    // --- Extended (sebagian masih dummy, lihat report.api.ts) ---
    OVERVIEW: ["reports", "overview"] as const,
    BOOKING_TREND: ["reports", "booking-trend"] as const,
    BOOKING_BY_DEPT: ["reports", "booking-by-department"] as const,
    BOOKING_BY_RESOURCE: ["reports", "booking-by-resource"] as const,
    APPROVAL_PERF: ["reports", "approval-performance"] as const,
    RESOURCE_AVAIL: ["reports", "resource-availability"] as const,
    COST_SUMMARY: ["reports", "cost-summary"] as const,
    COST_BY_VEHICLE: ["reports", "cost-by-vehicle"] as const,
    COST_BY_DEPT: ["reports", "cost-by-department"] as const,
    COST_TREND: ["reports", "cost-trend"] as const,
    DRIVER_PERFORMANCE: ["reports", "driver-performance"] as const,
    DRIVER_TRIPS: ["reports", "driver-trips"] as const,
    DEPT_SUMMARY: ["reports", "department-summary"] as const,
  },
} as const;

// --- Query Config ---

export const QUERY_CONFIG = {
  STALE_TIME: 5 * 60 * 1000, // 5 menit - data dianggap fresh
  CACHE_TIME: 10 * 60 * 1000, // 10 menit - cache disimpan
  RETRY: 2,
  RETRY_DELAY: 1_000, // 1 detik antar retry
} as const;

// --- Pagination Defaults ---

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: APP_CONFIG.DEFAULT_PAGE_SIZE,
  // Pilihan jumlah data per halaman di dropdown pager
  LIMIT_OPTIONS: [5, 10, 20, 50, 100] as readonly number[],
} as const;

// --- Master Setting Keys ---
// Key dari GET /api/v1/master-settings

export const SETTING_KEYS = {
  BBM_PRICE_PER_LITER: "bbm_price_per_liter",
  ELECTRICITY_PRICE_PER_KWH: "electricity_price_per_kwh",
} as const;

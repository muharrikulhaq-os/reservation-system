// ─────────────────────────────────────────
// APP CONFIG & QUERY CONSTANTS
// ─────────────────────────────────────────

// --- App Config ---

export const APP_CONFIG = {
  API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080",
  REQUEST_TIMEOUT: 15_000, // 15 detik
  DEFAULT_PAGE_SIZE: 20,
  MAX_FILE_SIZE_MB: 10,
  ACCEPTED_IMAGE_TYPES: ["image/jpeg", "image/png", "image/webp"],
  ACCEPTED_DOC_TYPES: ["application/pdf", "image/jpeg", "image/png"],
} as const;

// --- Token Config ---

export const TOKEN_CONFIG = {
  ACCESS_TOKEN_KEY: "access_token",
  REFRESH_TOKEN_KEY: "refresh_token",
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
  FUEL_EXPENSES: ["fuel-expenses"] as const,

  // Maintenance
  MAINTENANCE: ["maintenance"] as const,

  // Settings
  MASTER_SETTINGS: ["master-settings"] as const,

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
  },
} as const;

// --- Query Config ---

export const QUERY_CONFIG = {
  STALE_TIME: 5 * 60 * 1000, // 5 menit — data dianggap fresh
  CACHE_TIME: 10 * 60 * 1000, // 10 menit — cache disimpan
  RETRY: 2,
  RETRY_DELAY: 1_000, // 1 detik antar retry
} as const;

// --- Pagination Defaults ---

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: APP_CONFIG.DEFAULT_PAGE_SIZE,
} as const;

// --- Master Setting Keys ---
// Key dari GET /api/v1/master-settings

export const SETTING_KEYS = {
  BBM_PRICE_PER_LITER: "bbm_price_per_liter",
  ELECTRICITY_PRICE_PER_KWH: "electricity_price_per_kwh",
} as const;

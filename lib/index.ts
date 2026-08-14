// ─────────────────────────────────────────
// LIB - BARREL EXPORT
// ─────────────────────────────────────────

// axios instance - gunakan ini untuk semua API call
export { apiClient, clearTokenCookies, syncTokensToCookies } from "./axios";

// query client - pass ke QueryClientProvider di layout
export { queryClient } from "./queryClient";

// token storage - gunakan ini, jangan akses localStorage langsung
export { tokenStorage } from "./token";

// utilities
export * from "./utils";
